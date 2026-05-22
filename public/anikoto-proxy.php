<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$query = trim($_GET['q'] ?? '');
$ep    = (int)($_GET['ep'] ?? 1);

if (!$query) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing q']);
    exit;
}

$searchUrl = 'https://anikoto.cz/search?keyword=' . rawurlencode($query);

$ch = curl_init($searchUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_HTTPHEADER     => [
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language: en-US,en;q=0.9',
        'Referer: https://anikoto.cz/',
        'sec-ch-ua: "Chromium";v="124", "Google Chrome";v="124"',
        'sec-ch-ua-mobile: ?0',
        'sec-ch-ua-platform: "Windows"',
        'Sec-Fetch-Dest: document',
        'Sec-Fetch-Mode: navigate',
        'Sec-Fetch-Site: same-origin',
    ],
]);

$html   = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if (!$html || $status !== 200) {
    http_response_code(502);
    echo json_encode(['error' => "Upstream returned $status"]);
    exit;
}

// Extract all /watch/slug links from the search results
preg_match_all('#href=["\'](/watch/([a-z0-9\-]+)/ep-\d+)["\']#i', $html, $matches);

if (empty($matches[2])) {
    echo json_encode(['url' => null]);
    exit;
}

// Deduplicate slugs, pick best match
$slugs = array_unique($matches[2]);
$normTarget = preg_replace('/[^a-z0-9]/', '', strtolower($query));

$bestSlug = null;
foreach ($slugs as $slug) {
    $normSlug = preg_replace('/[^a-z0-9]/', '', strtolower($slug));
    if ($normSlug === $normTarget) { $bestSlug = $slug; break; }
}
if (!$bestSlug) {
    foreach ($slugs as $slug) {
        $normSlug = preg_replace('/[^a-z0-9]/', '', strtolower($slug));
        if (str_contains($normSlug, $normTarget) || str_contains($normTarget, $normSlug)) {
            $bestSlug = $slug; break;
        }
    }
}
if (!$bestSlug) $bestSlug = $slugs[0];

echo json_encode([
    'url'  => "https://anikoto.cz/watch/{$bestSlug}/ep-{$ep}",
    'slug' => $bestSlug,
]);
