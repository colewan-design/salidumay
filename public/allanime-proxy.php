<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$title = $_GET['title'] ?? '';
$ep    = $_GET['ep']    ?? '1';
$mode  = $_GET['mode']  ?? 'sub';

if (!$title) {
    http_response_code(400);
    echo json_encode(['error' => 'missing title']);
    exit;
}

// Key: SHA-256 of salt string (same as ani-cli)
$key_hex = hash('sha256', 'Xot36i3lK3:v1');

// GraphQL queries
$search_gql = 'query($search:SearchInput $limit:Int $page:Int $translationType:VaildTranslationTypeEnumType $countryOrigin:VaildCountryOriginEnumType){shows(search:$search limit:$limit page:$page translationType:$translationType countryOrigin:$countryOrigin){edges{_id name availableEpisodes __typename}}}';
$episode_gql = 'query($showId:String!$translationType:VaildTranslationTypeEnumType!$episodeString:String!){episode(showId:$showId translationType:$translationType episodeString:$episodeString){episodeString sourceUrls}}';

function allanime_gql($query, $variables) {
    $payload = json_encode(['query' => $query, 'variables' => $variables]);
    $ch = curl_init('https://api.allanime.day/api');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Referer: https://allmanga.to',
            'Origin: https://allmanga.to',
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ],
    ]);
    $body = curl_exec($ch);
    $err  = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    unset($ch);
    if ($err) return ['_curl_err' => $err];
    if ($code !== 200) return ['_http_err' => $code, '_body' => substr($body, 0, 200)];
    return json_decode($body, true) ?: ['_json_err' => substr($body, 0, 200)];
}

function norm_title($s) {
    return strtolower(preg_replace('/[^a-z0-9]/i', '', $s));
}

function decode_tobeparsed($encoded, $key_hex) {
    $bin = base64_decode($encoded);
    if (!$bin || strlen($bin) < 30) return [];

    $iv_hex = bin2hex(substr($bin, 1, 12));
    $ctr    = $iv_hex . '00000002';
    $ct_len = strlen($bin) - 13 - 16;
    if ($ct_len <= 0) return [];
    $ciphertext = substr($bin, 13, $ct_len);

    $plain = openssl_decrypt(
        $ciphertext,
        'aes-256-ctr',
        hex2bin($key_hex),
        OPENSSL_RAW_DATA | OPENSSL_ZERO_PADDING,
        hex2bin($ctr)
    );
    if (!$plain) return [];

    preg_match_all('/"sourceUrl":"--([^"]+)"[^}]*"sourceName":"([^"]+)"/', $plain, $m);
    $sources = [];
    foreach ($m[1] as $i => $url) {
        $sources[] = ['url' => $url, 'name' => $m[2][$i]];
    }
    return $sources;
}

// Step 1: Search
$search_res = allanime_gql($search_gql, [
    'search'          => ['query' => $title, 'allowAdult' => false],
    'limit'           => 40,
    'page'            => 1,
    'translationType' => $mode,
    'countryOrigin'   => 'JP',
]);

if (isset($search_res['_curl_err']) || isset($search_res['_http_err']) || isset($search_res['_json_err'])) {
    echo json_encode(['error' => 'search_api_failed', 'detail' => $search_res]);
    exit;
}

$edges = $search_res['data']['shows']['edges'] ?? [];
if (!$edges) {
    echo json_encode(['error' => 'no_results', 'raw' => $search_res]);
    exit;
}

// Best title match
$norm_target = norm_title($title);
usort($edges, function($a, $b) use ($norm_target) {
    $na = norm_title($a['name']); $nb = norm_title($b['name']);
    $sa = ($na === $norm_target) ? 0 : (strpos($na, $norm_target) !== false ? 1 : 2);
    $sb = ($nb === $norm_target) ? 0 : (strpos($nb, $norm_target) !== false ? 1 : 2);
    return $sa - $sb;
});
$show = $edges[0];

// Step 2: Get episode stream URLs
$ep_res = allanime_gql($episode_gql, [
    'showId'          => $show['_id'],
    'translationType' => $mode,
    'episodeString'   => (string)$ep,
]);

if (isset($ep_res['_curl_err']) || isset($ep_res['_http_err'])) {
    echo json_encode(['error' => 'episode_api_failed', 'detail' => $ep_res, 'show' => $show['name']]);
    exit;
}

$source_urls = $ep_res['data']['episode']['sourceUrls'] ?? [];
if (!$source_urls) {
    echo json_encode(['error' => 'no_sources', 'show' => $show['name'], 'ep_raw' => $ep_res]);
    exit;
}

// Step 3: Decode each source
$sources = [];
foreach ($source_urls as $src) {
    $raw  = $src['sourceUrl'] ?? '';
    $name = $src['sourceName'] ?? 'unknown';
    $type = $src['type'] ?? '';

    if (substr($raw, 0, 2) === '--') {
        $sources[] = ['url' => substr($raw, 2), 'name' => $name, 'type' => 'direct'];
    } elseif ($type === 'tobeparsed') {
        foreach (decode_tobeparsed($raw, $key_hex) as $d) {
            $sources[] = ['url' => $d['url'], 'name' => $d['name'], 'type' => 'tobeparsed'];
        }
    }
}

echo json_encode(['show' => $show['name'], 'ep' => $ep, 'sources' => $sources]);
