# Gallery admin: Hostinger setup

The gallery manager is at **`https://shaillystattoo.com/admin/`**. Hostinger supplies the username/password prompt. There are no credentials in the application or JavaScript.

## First installation

1. In hPanel → **Advanced → PHP Configuration**, choose PHP **8.2 or newer**. Enable **GD**, **Fileinfo**, and **EXIF**, with GD WebP support. Set `memory_limit` to **256M** or higher, `upload_max_filesize` to **12M**, `post_max_size` to **16M**, and `max_execution_time` to **180** for the first import. Individual photos have a 10 MB application limit.
2. Create `public_html/admin`. In **Password Protect Directories**, protect that entire directory and set your own username and strong password. Use HTTPS. Do not share your hPanel account password as the gallery password.
3. Upload **`hostinger-backend.zip`** into `public_html` and extract **its contents directly there**, choosing Replace for application files. This adds PHP, the dashboard, assets, and seed photos without replacing the public homepage/gallery HTML yet. It does not overwrite Hostinger’s `admin/.htaccess` or password file.
4. Create a private **`gallery-data`** directory alongside `public_html`, outside the website directory. PHP will also try to create it automatically. It must be writable by the website’s PHP user, usually permissions `750`.
5. Open `/admin/`, enter your credentials, and click **Import 19 photos**. Wait for completion. Managed copies retain the existing titles and tags. Originals and homepage photos stay separate. Unrelated files from `/list.php` are not imported.
6. Open **`/api/gallery.php`**. It should return `{ "version": 1, "items": [...] }` with 19 photos and managed WebP URLs. Check a thumbnail URL. If `/admin/` reports missing `REMOTE_USER`, ask Hostinger to forward the **server-verified authenticated username** to PHP; do not bypass this check or substitute an unverified Authorization header.
7. Upload and extract **`hostinger-upload.zip`** into `public_html`, replacing matching HTML, CSS, JavaScript, and PHP files. Clear Hostinger/CDN cache. Verify the gallery, filters, preview, and admin on mobile and desktop.

Protect `/admin/` **before** uploading it. Confirm a private/incognito window prompts for a password at both `/admin/` and `/admin/api.php`. Confirm `/lib/seed.json` returns 403, enforced by the included `lib/.htaccess`. If an obsolete `admin/index.html` exists from a manual deployment, remove that one file so `/admin/` uses `index.php`.

### Custom private storage location

If needed, place `gallery-config.php` alongside `public_html`, outside it:

```php
<?php
return ['data_dir' => '/absolute/private/path/gallery-data'];
```

The directory must be outside `public_html` and writable by PHP. Alternatively set the server environment variable `GALLERY_DATA_DIR`. No password belongs in this file.

## Day-to-day use

- **Add photos:** select or drop JPEG, PNG, or WebP files. Give each a title and zero or more tags. Uploads run one at a time, with progress and individual errors. Retrying an interrupted upload does not duplicate it.
- **Tags:** Minimal, Portraits, Traditional, Colour. Multiple tags are allowed. All work includes every photo, even without tags.
- **Edit:** change title, accessible image description, or tags. Visitors see changes on their next gallery load.
- **Remove:** preview and confirm permanent deletion. Both managed image versions and the catalogue record are removed. No trash; original homepage images are never deleted.
- **Access:** change username/password in Hostinger Password Protect Directories. Basic authentication is remembered by the browser; close the private session on a shared computer. There is no misleading logout button.

Images become WebP at quality 82: thumbnails up to 640 px, full previews up to 1800 px. Aspect ratio, JPEG orientation, and transparency are preserved. HEIC, SVG, GIF, video, corrupt images, and oversized photos are rejected with a message. Very large phone photos may need resizing first.

## Future deployments and backups

Build with `npm run build:hostinger` or `node scripts/build-hostinger.mjs`. Normal Vite builds also include PHP. Upload the whole matching release, overwriting files rather than synchronizing with deletion.

**Preserve these runtime files and folders:**

- `public_html/uploads/`, especially `uploads/gallery/managed/`.
- Private `gallery-data/` and optional `gallery-config.php`.
- Hostinger’s `admin/.htaccess` and password file.
- Existing `/list.php`, independent of the new gallery.

Neither release ZIP includes runtime photos, catalogue data, or admin authentication configuration. Back up **gallery-data plus uploads/gallery/managed together** before permanent deletions or hosting changes. Import cannot run again even after the collection is emptied. Deploying application files never restores deleted photos.

## Local development and verification

- `npm run dev`: the public gallery uses its 19-photo seed when PHP is unavailable. Admin reports an unavailable PHP API instead of pretending to save changes.
- For Vite plus PHP, set `GALLERY_PHP_ORIGIN` before starting Vite. API and uploads are proxied to that origin. Production `/admin/` uses the authenticated PHP entrypoint; local Vite HTML is for development only.
- `npm run test:gallery`: real PHP/GD integration checks. Supply configured PHP through `PHP_BINARY`. On Windows, tests also support a portable runtime at `tmp/php/php.exe`. Runtime and fixtures remain in ignored `tmp/`. The test authentication router is never deployed.
- Tests cover authentication, CSRF, upload limits/types, optimization/orientation, edits/removal, file locking, empty state, and redeployment persistence. Nothing modifies the live Hostinger website.

Production displays **Try again** if its API fails. It never silently restores removed seed photos.
