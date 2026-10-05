<?php
declare(strict_types=1);
require $argv[1] . '/lib/gallery.php';
gallery_locked(true, function (string $dir) use ($argv): void {
    $data = gallery_read($dir);
    usleep(75000);
    $data['items'][(int)$argv[2]]['title'] = 'Concurrent edit ' . $argv[2];
    gallery_save($dir, $data);
});
