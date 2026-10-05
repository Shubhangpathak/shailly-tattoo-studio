<?php
declare(strict_types=1);
require dirname(__DIR__) . '/lib/gallery.php';
gallery_endpoint(function (): array {
    gallery_require_admin();
    $token = gallery_session();
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        gallery_check_runtime();
        return gallery_locked(false, function (string $dir) use ($token): array {
            $initialized = is_file($dir . '/catalogue.json');
            return ['csrf' => $token, 'initialized' => $initialized, 'items' => $initialized ? gallery_read($dir)['items'] : []];
        });
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') throw new GalleryError('Use POST for gallery changes.', 405);
    gallery_check_csrf($token);
    $input = str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') ? json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR) : $_POST;
    if (!is_array($input)) throw new GalleryError('Invalid gallery request.');
    $action = $input['action'] ?? '';
    if ($action === 'initialize') return gallery_initialize();
    if ($action === 'upload') {
        $requestId = $input['requestId'] ?? '';
        if (!is_string($requestId) || !preg_match('/^[a-zA-Z0-9-]{16,64}$/', $requestId)) throw new GalleryError('Invalid upload identifier. Refresh and try again.');
        $existing = gallery_locked(false, function (string $dir) use ($requestId): ?array {
            foreach (gallery_read($dir)['items'] as $photo) if (($photo['uploadId'] ?? '') === $requestId) return $photo;
            return null;
        });
        if ($existing) return ['item' => $existing];
        $file = $_FILES['photo'] ?? null;
        if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) throw new GalleryError('The photo did not upload. Check the 10 MB limit and PHP upload_max_filesize/post_max_size settings.');
        $fields = $input;
        $fields['tags'] = json_decode($input['tags'] ?? '[]', true);
        $item = gallery_process($file['tmp_name'], gallery_fields($fields));
        $item['uploadId'] = $requestId;
        try {
            $saved = gallery_locked(true, function (string $dir) use ($item, $requestId): array {
                $data = gallery_read($dir);
                foreach ($data['items'] as $photo) if (($photo['uploadId'] ?? '') === $requestId) return $photo;
                array_unshift($data['items'], $item);
                gallery_save($dir, $data);
                return $item;
            });
            if ($saved['id'] !== $item['id']) gallery_discard($item);
            return ['item' => $saved];
        } catch (Throwable $error) { gallery_discard($item); throw $error; }
    }
    if (!in_array($action, ['edit', 'remove'], true)) throw new GalleryError('Unknown gallery action.');
    return gallery_locked(true, function (string $dir) use ($input, $action): array {
        $data = gallery_read($dir);
        $index = array_search($input['id'] ?? '', array_column($data['items'], 'id'), true);
        if ($index === false) throw new GalleryError('This photo no longer exists. Refresh the collection.', 404);
        $item = $data['items'][$index];
        if ($action === 'edit') {
            $item = array_replace($item, gallery_fields($input));
            $data['items'][$index] = $item;
            gallery_save($dir, $data);
            return ['item' => $item];
        }
        // Stage both owned files in private storage before committing removal.
        // A failed catalogue write restores the files and preserves the record.
        $staged = [];
        try {
            foreach (['thumbnail', 'src'] as $key) {
                $original = gallery_owned_path($item[$key], $item['id']);
                if (!is_file($original)) continue;
                $temp = $dir . '/delete-' . basename($original);
                if (!@rename($original, $temp)) throw new GalleryError('Could not remove the photo. Check file permissions.', 503);
                $staged[$original] = $temp;
            }
            array_splice($data['items'], $index, 1);
            gallery_save($dir, $data);
        } catch (Throwable $error) {
            foreach ($staged as $original => $temp) @rename($temp, $original);
            throw $error;
        }
        $cleanupFailed = false;
        foreach ($staged as $temp) if (!@unlink($temp)) { $cleanupFailed = true; error_log('Gallery private deletion cleanup needed: ' . $temp); }
        return ['removed' => $item['id'], 'warning' => $cleanupFailed ? 'The photo is no longer public, but temporary file cleanup failed. Check the hosting error log.' : null];
    });
});
