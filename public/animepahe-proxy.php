<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$m = $_GET['m'] ?? '';
$allowed = ['search', 'release', 'episode'];
if (!$m || !in_array($m, $allowed)) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid m param']);
    exit;
}

$params = $_GET;
$qs     = http_build_query($params);

$headers = [
    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept: application/json, text/javascript, */*; q=0.01',
    'Accept-Language: en-US,en;q=0.9',
    'X-Requested-With: XMLHttpRequest',
];

// Try .pw then .ru
$hosts = ['https://animepahe.pw', 'https://animepahe.ru'];
$body   = false;
$status = 0;
$err    = '';

foreach ($hosts as $host) {
    $url = $host . '/api?' . $qs;
    $ch  = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT        => 12,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_HTTPHEADER     => array_merge($headers, ['Referer: ' . $host . '/']),
    ]);

    $body   = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err    = curl_error($ch);
    unset($ch);

    if (!$err && $status === 200) break;
}

if ($err && !$body) {
    http_response_code(502);
    echo json_encode(['error' => $err]);
    exit;
}

http_response_code($status);
echo $body;
