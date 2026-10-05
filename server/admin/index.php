<?php
declare(strict_types=1);
require dirname(__DIR__) . '/lib/gallery.php';
try {
    gallery_require_admin();
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    readfile(__DIR__ . '/ui.html');
} catch (GalleryError $error) {
    http_response_code($error->status);
    header('Content-Type: text/plain; charset=utf-8');
    echo $error->getMessage();
}
