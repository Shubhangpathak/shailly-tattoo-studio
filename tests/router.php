<?php
// Test server only. Never include this router in a Hostinger release.
declare(strict_types=1);
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (str_starts_with($path, '/lib/')) { http_response_code(403); exit; }
if (str_starts_with($path, '/admin')) {
    $user = $_SERVER['PHP_AUTH_USER'] ?? '';
    $pass = $_SERVER['PHP_AUTH_PW'] ?? '';
    if (!hash_equals(getenv('GALLERY_TEST_USER') ?: '', $user) || !hash_equals(getenv('GALLERY_TEST_PASSWORD') ?: '', $pass) || $user === '') {
        header('WWW-Authenticate: Basic realm="Gallery integration test"');
        http_response_code(401); echo 'Authentication required'; exit;
    }
    $_SERVER['REMOTE_USER'] = $user;
    if ($path === '/admin/' || $path === '/admin') { require $_SERVER['DOCUMENT_ROOT'] . '/admin/index.php'; return true; }
}
return false;
