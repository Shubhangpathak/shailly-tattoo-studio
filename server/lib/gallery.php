<?php
declare(strict_types=1);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

const GALLERY_TAGS = ['minimal', 'portraits', 'traditional', 'colour'];
const GALLERY_MAX_BYTES = 10 * 1024 * 1024;

final class GalleryError extends RuntimeException {
    public function __construct(string $message, public readonly int $status = 400) { parent::__construct($message); }
}

function gallery_root(): string { return dirname(__DIR__); }
function gallery_data_dir(): string {
    $configPath = dirname(gallery_root()) . '/gallery-config.php';
    $config = is_file($configPath) ? require $configPath : [];
    $path = getenv('GALLERY_DATA_DIR') ?: ($config['data_dir'] ?? dirname(gallery_root()) . '/gallery-data');
    if (!is_dir($path) && !@mkdir($path, 0750, true)) throw new GalleryError('Create a writable gallery-data directory outside public_html. See the setup guide.', 503);
    $real = realpath($path);
    $root = realpath(gallery_root());
    if (!$real || !$root || $real === $root || str_starts_with(str_replace('\\', '/', $real) . '/', str_replace('\\', '/', $root) . '/')) {
        throw new GalleryError('Gallery data must be stored outside the public website directory.', 503);
    }
    if (!is_writable($real)) throw new GalleryError('The private gallery-data directory is not writable.', 503);
    return $real;
}

function gallery_json(array $body, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, max-age=0');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($body, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
    exit;
}

function gallery_endpoint(callable $action): never {
    try { gallery_json($action()); }
    catch (GalleryError $error) { gallery_json(['error' => $error->getMessage()], $error->status); }
    catch (JsonException $error) { gallery_json(['error' => 'The request contains invalid JSON.'], 400); }
    catch (Throwable $error) {
        error_log('Gallery: ' . $error->getMessage());
        gallery_json(['error' => 'The gallery could not complete this request. Please try again or check the hosting error log.'], 500);
    }
}

// This value is supplied by the web server after directory authentication,
// unlike a client-supplied Authorization header or PHP_AUTH_USER.
function gallery_require_admin(): void {
    $user = $_SERVER['REMOTE_USER'] ?? $_SERVER['REDIRECT_REMOTE_USER'] ?? '';
    if (!is_string($user) || $user === '') throw new GalleryError('Protect the entire /admin directory with Hostinger password protection before using it. The server must pass REMOTE_USER to PHP.', 403);
    if (PHP_VERSION_ID < 80200) throw new GalleryError('PHP 8.2 or newer is required.', 503);
}

function gallery_session(): string {
    session_name('shaillys_gallery');
    session_set_cookie_params(['path' => '/admin/', 'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off', 'httponly' => true, 'samesite' => 'Strict']);
    ini_set('session.use_strict_mode', '1');
    if (!session_start()) throw new GalleryError('The hosting session directory is not writable.', 503);
    if (empty($_SESSION['csrf'])) {
        session_regenerate_id(true);
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    $token = $_SESSION['csrf'];
    session_write_close(); // Do not serialize independent uploads/edits on the session lock.
    return $token;
}

function gallery_check_csrf(string $token): void {
    $supplied = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($supplied) || !hash_equals($token, $supplied)) throw new GalleryError('Your editing session expired. Refresh the admin page and try again.', 403);
}

function gallery_check_runtime(): void {
    foreach (['gd', 'fileinfo', 'exif'] as $extension) {
        if (!extension_loaded($extension)) throw new GalleryError("Enable the $extension PHP extension in Hostinger PHP Configuration.", 503);
    }
    if (!function_exists('imagewebp') || !(imagetypes() & IMG_WEBP)) throw new GalleryError('Enable GD WebP support in PHP Configuration.', 503);
}

function gallery_locked(bool $write, callable $action): mixed {
    $dir = gallery_data_dir();
    $lock = @fopen($dir . '/catalogue.lock', 'c');
    if (!$lock || !flock($lock, $write ? LOCK_EX : LOCK_SH)) throw new GalleryError('Cannot lock gallery storage. Check directory permissions.', 503);
    try { return $action($dir); }
    finally { flock($lock, LOCK_UN); fclose($lock); }
}

function gallery_read(string $dir): array {
    $path = $dir . '/catalogue.json';
    if (!is_file($path)) throw new GalleryError('The gallery has not been initialized. Open /admin/ to import the current collection.', 503);
    try { $data = json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR); }
    catch (JsonException $error) { throw new GalleryError('The gallery catalogue is invalid. Restore its backup before editing.', 503); }
    if (($data['version'] ?? null) !== 1 || !is_array($data['items'] ?? null)) throw new GalleryError('The gallery catalogue is invalid. Restore its backup before editing.', 503);
    return $data;
}

function gallery_save(string $dir, array $data): void {
    $encoded = json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    $temp = $dir . '/catalogue-' . bin2hex(random_bytes(8)) . '.tmp';
    try {
        if (@file_put_contents($temp, $encoded, LOCK_EX) === false) throw new GalleryError('Cannot write the gallery catalogue.', 503);
        @chmod($temp, 0640);
        if (!@rename($temp, $dir . '/catalogue.json')) throw new GalleryError('Cannot save the gallery catalogue. Check storage permissions.', 503);
    } finally { if (is_file($temp)) @unlink($temp); }
}

function gallery_fields(array $input): array {
    if (!is_string($input['title'] ?? null) || !is_string($input['alt'] ?? '')) throw new GalleryError('Photo titles and descriptions must be text.');
    $title = trim($input['title']);
    $alt = trim($input['alt'] ?? '');
    $tags = $input['tags'] ?? [];
    if ($title === '' || preg_match_all('/./us', $title) > 180) throw new GalleryError('Enter a photo title of up to 180 characters.');
    if ($alt === '') $alt = $title;
    if (preg_match_all('/./us', $alt) > 400) throw new GalleryError('Keep the image description under 400 characters.');
    if (!is_array($tags) || array_filter($tags, fn($tag) => !is_string($tag) || !in_array($tag, GALLERY_TAGS, true))) throw new GalleryError('Choose only the existing gallery tags.');
    return ['title' => $title, 'alt' => $alt, 'tags' => array_values(array_unique($tags))];
}

function gallery_media_dir(): string {
    $dir = gallery_root() . '/uploads/gallery/managed';
    if (!is_dir($dir) && !@mkdir($dir, 0755, true)) throw new GalleryError('Cannot create uploads/gallery/managed. Check its permissions.', 503);
    if (!is_writable($dir)) throw new GalleryError('uploads/gallery/managed is not writable.', 503);
    return $dir;
}

function gallery_owned_path(string $url, string $id): string {
    if (!preg_match('/^[a-f0-9]{32}$/', $id) || !in_array($url, ["/uploads/gallery/managed/$id-thumb.webp", "/uploads/gallery/managed/$id-full.webp"], true)) {
        throw new GalleryError('This file does not belong to a managed gallery photo.', 409);
    }
    $path = gallery_media_dir() . '/' . basename($url);
    if (is_link($path)) throw new GalleryError('Cannot operate on a linked gallery file.', 409);
    return $path;
}

function gallery_discard(array $item): void {
    foreach (['thumbnail', 'src'] as $key) {
        $path = gallery_owned_path($item[$key], $item['id']);
        if (is_file($path) && !@unlink($path)) error_log('Gallery orphan cleanup needed: ' . $path);
    }
}

function gallery_rotate_jpeg(GdImage $image, string $path): GdImage {
    $exif = @exif_read_data($path);
    $orientation = (int)($exif['Orientation'] ?? 1);
    if (in_array($orientation, [2, 4, 5, 7], true)) imageflip($image, in_array($orientation, [4, 5], true) ? IMG_FLIP_VERTICAL : IMG_FLIP_HORIZONTAL);
    $angle = match ($orientation) { 3 => 180, 5, 6, 7 => -90, 8 => 90, default => 0 };
    if ($angle !== 0) {
        $rotated = imagerotate($image, $angle, 0);
        if (!$rotated) throw new GalleryError('Could not correct photo orientation.');
        return $rotated;
    }
    return $image;
}

function gallery_process(string $path, array $fields): array {
    gallery_check_runtime();
    $size = @filesize($path);
    if ($size === false || $size > GALLERY_MAX_BYTES) throw new GalleryError('Each photo must be 10 MB or smaller.');
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($path);
    $info = @getimagesize($path);
    if (!$info || !in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true) || ($info['mime'] ?? '') !== $mime) throw new GalleryError('Upload a valid JPEG, PNG, or WebP photo.');
    $pixels = $info[0] * $info[1];
    $limit = ini_get('memory_limit');
    $memory = $limit === '-1' ? PHP_INT_MAX : (int)$limit * match (strtolower(substr($limit, -1))) { 'g' => 1073741824, 'm' => 1048576, 'k' => 1024, default => 1 };
    if ($pixels > 24000000 || $pixels * 8 + 32 * 1024 * 1024 > $memory - memory_get_usage(true)) throw new GalleryError('This photo is too large to process safely. Resize it below 24 megapixels, or increase PHP memory_limit.');
    $image = match ($mime) { 'image/jpeg' => @imagecreatefromjpeg($path), 'image/png' => @imagecreatefrompng($path), 'image/webp' => @imagecreatefromwebp($path) };
    if (!$image) throw new GalleryError('The image could not be decoded. Try exporting it again.');
    $id = bin2hex(random_bytes(16));
    $dir = gallery_media_dir();
    $created = [];
    try {
        if ($mime === 'image/jpeg') $image = gallery_rotate_jpeg($image, $path);
        $width = imagesx($image); $height = imagesy($image);
        $item = ['id' => $id] + $fields + ['width' => $width, 'height' => $height, 'createdAt' => gmdate('c')];
        foreach (['thumbnail' => [640, 'thumb'], 'src' => [1800, 'full']] as $key => [$max, $suffix]) {
            $ratio = min(1, $max / max($width, $height));
            $w = max(1, (int)round($width * $ratio)); $h = max(1, (int)round($height * $ratio));
            $output = imagecreatetruecolor($w, $h);
            imagealphablending($output, false); imagesavealpha($output, true);
            imagefilledrectangle($output, 0, 0, $w, $h, imagecolorallocatealpha($output, 0, 0, 0, 127));
            imagecopyresampled($output, $image, 0, 0, 0, 0, $w, $h, $width, $height);
            $dest = "$dir/$id-$suffix.webp";
            $created[] = $dest;
            $ok = imagewebp($output, $dest, 82); unset($output);
            if (!$ok || !is_file($dest) || filesize($dest) === 0) throw new GalleryError('Could not save the optimized photo. Check available disk space.', 503);
            $item[$key] = "/uploads/gallery/managed/$id-$suffix.webp";
        }
        return $item;
    } catch (Throwable $error) {
        foreach ($created as $file) if (is_file($file)) @unlink($file);
        throw $error;
    } finally { unset($image); }
}

function gallery_initialize(): array {
    return gallery_locked(true, function (string $dir): array {
        if (is_file($dir . '/catalogue.json')) throw new GalleryError('The gallery is already initialized. Existing edits were preserved.', 409);
        $seeds = json_decode(file_get_contents(__DIR__ . '/seed.json'), true, 512, JSON_THROW_ON_ERROR);
        $items = [];
        try {
            foreach ($seeds as $seed) {
                if (!preg_match('~^/images/[a-zA-Z0-9_.-]+\.webp$~', $seed['src'])) throw new GalleryError('Invalid seed image path.', 503);
                $path = gallery_root() . $seed['src'];
                if (!is_file($path)) throw new GalleryError('A starting photo is missing. Upload the complete images folder before importing.', 503);
                $items[] = gallery_process($path, gallery_fields($seed));
            }
            $data = ['version' => 1, 'items' => $items];
            gallery_save($dir, $data);
            return $data;
        } catch (Throwable $error) {
            foreach ($items as $item) gallery_discard($item);
            throw $error;
        }
    });
}
