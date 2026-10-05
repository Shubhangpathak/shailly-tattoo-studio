<?php
declare(strict_types=1);
require dirname(__DIR__) . '/lib/gallery.php';
gallery_endpoint(function (): array {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') throw new GalleryError('This endpoint is read-only.', 405);
    return gallery_locked(false, fn(string $dir): array => gallery_read($dir));
});
