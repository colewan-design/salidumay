<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$title = $_GET['title'] ?? '';
$ep    = (int)($_GET['ep'] ?? 1);

if (!$title) {
    http_response_code(400);
    echo json_encode(['error' => 'missing title']);
    exit;
}

$base    = 'https://yugenanime.tv';
$headers = [
    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept: text/html,application/xhtml+xml,*/*;q=0.9',
    'Accept-Language: en-US,en;q=0.9',
    'Referer: ' . $base . '/',
];

function yugen_get($url, $extra_headers = []) {
    global $headers;
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_HTTPHEADER     => array_merge($headers, $extra_headers),
    ]);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);
    return [$body, $code, $err];
}

function yugen_post($url, $fields, $extra_headers = []) {
    global $headers;
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query($fields),
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_HTTPHEADER     => array_merge($headers, $extra_headers),
    ]);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);
    return [$body, $code, $err];
}

// ── Step 1: Search ────────────────────────────────────────────────────────────
[$html, $code, $err] = yugen_get($base . '/discover/?q=' . urlencode($title));

if ($err || $code !== 200 || !$html) {
    echo json_encode(['error' => 'search_failed', 'code' => $code, 'curl' => $err]);
    exit;
}

// Extract anime cards: href="/anime/{slug}/" and title text
preg_match_all('#href="(/anime/([^/"]+)/)"[^>]*>.*?<p[^>]*>([^<]+)<#si', $html, $m);

if (empty($m[2])) {
    // Fallback pattern — some themes wrap differently
    preg_match_all('#/anime/([^/"]+)/"[^>]*class="[^"]*anime[^"]*"#i', $html, $m2);
    if (empty($m2[1])) {
        echo json_encode(['error' => 'no_results', 'title' => $title]);
        exit;
    }
    $slug = $m2[1][0];
} else {
    // Pick best title match
    $norm = strtolower(preg_replace('/[^a-z0-9]/i', '', $title));
    $best_score = PHP_INT_MAX;
    $slug = $m[2][0];

    foreach ($m[2] as $i => $s) {
        $candidate = strtolower(preg_replace('/[^a-z0-9]/i', '', $m[3][$i] ?? $s));
        similar_text($norm, $candidate, $pct);
        $score = 100 - (int)$pct;
        if ($score < $best_score) {
            $best_score = $score;
            $slug = $s;
        }
    }
}

// ── Step 2: Episode page → embed id ──────────────────────────────────────────
$ep_url = $base . '/watch/' . $slug . '/' . $ep . '/';
[$ep_html, $ep_code, $ep_err] = yugen_get($ep_url, ['Referer: ' . $base . '/anime/' . $slug . '/']);

if ($ep_err || $ep_code !== 200 || !$ep_html) {
    echo json_encode(['error' => 'episode_page_failed', 'url' => $ep_url, 'code' => $ep_code]);
    exit;
}

// data-ep-id="..." or data-id="..." in the watch page
if (!preg_match('/data-ep-id=["\'](\d+)["\']/', $ep_html, $id_m) &&
    !preg_match('/data-id=["\'](\d+)["\']/', $ep_html, $id_m) &&
    !preg_match('/\"episodeId\"\s*:\s*(\d+)/', $ep_html, $id_m)) {
    echo json_encode(['error' => 'embed_id_not_found', 'slug' => $slug, 'ep' => $ep]);
    exit;
}
$embed_id = $id_m[1];

// ── Step 3: Embed API → HLS URL ───────────────────────────────────────────────
[$embed_body, $embed_code, $embed_err] = yugen_post(
    $base . '/api/embed/',
    ['id' => $embed_id, 'ac' => '0'],
    [
        'X-Requested-With: XMLHttpRequest',
        'Accept: application/json, text/javascript, */*; q=0.01',
        'Referer: ' . $ep_url,
    ]
);

if ($embed_err || !$embed_body) {
    echo json_encode(['error' => 'embed_api_failed', 'curl' => $embed_err]);
    exit;
}

$embed = json_decode($embed_body, true);
if (!$embed) {
    echo json_encode(['error' => 'embed_json_invalid', 'raw' => substr($embed_body, 0, 300)]);
    exit;
}

// Response shape: { "hls": "https://...m3u8", "mp4": [...] }
$sources = [];

if (!empty($embed['hls'])) {
    $sources[] = ['url' => $embed['hls'], 'type' => 'hls', 'quality' => 'auto'];
}

foreach ($embed['mp4'] ?? [] as $mp4) {
    if (!empty($mp4['src'])) {
        $sources[] = ['url' => $mp4['src'], 'type' => 'mp4', 'quality' => $mp4['size'] ?? 'unknown'];
    }
}

if (!$sources) {
    echo json_encode(['error' => 'no_streams', 'embed_raw' => $embed]);
    exit;
}

echo json_encode(['slug' => $slug, 'ep' => $ep, 'embed_id' => $embed_id, 'sources' => $sources]);
