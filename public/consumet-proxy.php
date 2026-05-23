<?php
// Proxy for Consumet API — avoids CORS in production
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$path = $_GET['path'] ?? '';

if (!$path || !preg_match('#^/anime/#', $path)) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid path']);
    exit;
}

$params = $_GET;
unset($params['path']);
$qs = http_build_query($params);

// Try multiple public Consumet instances in order
$bases = [
    'https://consumet-api.vercel.app',
    'https://consumet.pages.dev',
];

$body   = false;
$status = 0;
$err    = '';

foreach ($bases as $base) {
    $url = $base . $path . ($qs ? '?' . $qs : '');
    $ch  = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_HTTPHEADER     => [
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept: application/json',
        ],
    ]);

    $body   = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err    = curl_error($ch);
    curl_close($ch);

    // Stop on a successful response
    if (!$err && $status >= 200 && $status < 500) break;
}

if ($err && !$body) {
    http_response_code(502);
    echo json_encode(['error' => $err]);
    exit;
}

http_response_code($status);
echo $body;
