<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

$url     = $_GET['url']     ?? '';
$referer = $_GET['referer'] ?? 'https://www.miruro.tv/';

if (!$url) {
    http_response_code(400);
    echo 'Missing url';
    exit;
}

$parsed = parse_url($url);
$host   = $parsed['host'] ?? '';

$allowed = ['cinewave2.site', 'miruro', 'watching.onl', 'lostproject.club', 'anikoto'];
$ok = false;
foreach ($allowed as $d) {
    if (str_contains($host, $d)) { $ok = true; break; }
}
if (!$ok) {
    http_response_code(403);
    echo 'Domain not allowed';
    exit;
}

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT        => 30,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_HTTPHEADER     => [
        'Referer: ' . $referer,
        'Origin: ' . rtrim($referer, '/'),
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept: */*',
        'Accept-Language: en-US,en;q=0.9',
        'sec-ch-ua: "Not_A Brand";v="8", "Chromium";v="120"',
        'sec-ch-ua-mobile: ?0',
        'Sec-Fetch-Dest: empty',
        'Sec-Fetch-Mode: cors',
        'Sec-Fetch-Site: cross-site',
    ],
]);

$body        = curl_exec($ch);
$status      = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE) ?: '';
curl_close($ch);

http_response_code($status);

$isM3u8 = str_contains($url, '.m3u8') || str_contains($contentType, 'mpegurl');

if ($isM3u8) {
    header('Content-Type: application/vnd.apple.mpegurl');

    $baseUrl    = substr($url, 0, strrpos($url, '/') + 1);
    $scheme     = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $proxyBase  = $scheme . '://' . $_SERVER['HTTP_HOST'] . '/stream-proxy.php';

    $lines = explode("\n", $body);
    foreach ($lines as &$line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#')) continue;

        if (!str_starts_with($trimmed, 'http')) {
            $trimmed = $baseUrl . $trimmed;
        }

        $line = $proxyBase . '?url=' . urlencode($trimmed) . '&referer=' . urlencode($referer);
    }
    echo implode("\n", $lines);
} else {
    header('Content-Type: ' . ($contentType ?: 'video/mp2t'));
    echo $body;
}
