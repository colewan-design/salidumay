<?php
// Proxy for animex.wrdd.site API — avoids CORS in production
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$path = $_GET['path'] ?? '';

// Whitelist: only allow requests to the animex API paths
if (!$path || !preg_match('#^/api/#', $path)) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid path']);
    exit;
}

// Forward remaining query params (strip our own "path" key)
$params = $_GET;
unset($params['path']);
$qs = http_build_query($params);

$url = 'https://animex.wrdd.site' . $path . ($qs ? '?' . $qs : '');

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_HTTPHEADER     => [
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept: application/json, text/plain, */*',
        'Referer: https://animex.wrdd.site/',
        'X-Requested-With: XMLHttpRequest',
    ],
]);

$body   = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err    = curl_error($ch);
curl_close($ch);

if ($err) {
    http_response_code(502);
    echo json_encode(['error' => $err]);
    exit;
}

http_response_code($status);
echo $body;
