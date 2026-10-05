import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { randomUUID, createHash } from 'node:crypto';
import net from 'node:net';
import sharp from 'sharp';

const workspace = process.cwd();
const php = process.env.PHP_BINARY || (process.platform === 'win32' ? path.join(workspace, 'tmp/php/php.exe') : 'php');
const flags = process.platform === 'win32' && php.includes(`${path.sep}tmp${path.sep}`) ? ['-d', `extension_dir=${path.dirname(php)}/ext`, '-d', 'extension=gd', '-d', 'extension=fileinfo', '-d', 'extension=exif'] : [];
const phpArgs = [...flags, '-d', 'memory_limit=256M', '-d', 'upload_max_filesize=12M', '-d', 'post_max_size=16M'];
const fixture = path.resolve(workspace, 'tmp', `gallery-test-${randomUUID()}`);
assert(fixture.startsWith(path.resolve(workspace, 'tmp') + path.sep));
const root = path.join(fixture, 'public_html');
const privateDir = path.join(fixture, 'gallery-data');
await fs.mkdir(root, { recursive: true });
await fs.cp('dist', root, { recursive: true });
for (const file of ['lib/gallery.php', 'admin/index.php', 'admin/api.php', 'api/gallery.php']) execFileSync(php, ['-l', path.join(root, file)]);
const socket = net.createServer();
await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
const port = socket.address().port;
await new Promise(resolve => socket.close(resolve));
const env = { ...process.env, GALLERY_DATA_DIR: privateDir, GALLERY_TEST_USER: 'test-admin', GALLERY_TEST_PASSWORD: randomUUID() };
const server = spawn(php, [...phpArgs, '-S', `127.0.0.1:${port}`, '-t', root, path.join(workspace, 'tests/router.php')], { env, stdio: ['ignore', 'pipe', 'pipe'] });
let serverOutput = '';
server.stderr.on('data', chunk => { serverOutput += chunk; });
const base = `http://127.0.0.1:${port}`;
const authorization = 'Basic ' + Buffer.from(`${env.GALLERY_TEST_USER}:${env.GALLERY_TEST_PASSWORD}`).toString('base64');
let cookie = '', token = '', checks = 0;
const check = (condition, message) => { assert(condition, message); checks++; };
async function get(url, authenticated = false) {
  return fetch(base + url, { headers: authenticated ? { Authorization: authorization, Cookie: cookie } : {}, signal: AbortSignal.timeout(10000) });
}
async function mutate(action, data = {}, csrf = token) {
  return fetch(base + '/admin/api.php', { method: 'POST', headers: { Authorization: authorization, Cookie: cookie, 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }, body: JSON.stringify({ action, ...data }), signal: AbortSignal.timeout(180000) });
}
async function upload(buffer, name, fields = {}) {
  const form = new FormData();
  form.append('action', 'upload'); form.append('photo', new Blob([buffer]), name);
  form.append('title', fields.title || 'New test photo'); form.append('tags', JSON.stringify(fields.tags || [])); form.append('requestId', fields.requestId || randomUUID());
  return fetch(base + '/admin/api.php', { method: 'POST', headers: { Authorization: authorization, Cookie: cookie, 'X-CSRF-Token': token }, body: form, signal: AbortSignal.timeout(30000) });
}
async function items() { return (await (await get('/api/gallery.php')).json()).items; }
const hash = buffer => createHash('sha256').update(buffer).digest('hex');

try {
  for (let i = 0; i < 60; i++) {
    try { await get('/api/gallery.php'); break; } catch { await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  check((await get('/admin/')).status === 401, 'Dashboard must require authentication');
  check((await get('/admin/api.php')).status === 401, 'Admin API must require authentication');
  check((await fetch(base + '/admin/api.php', { headers: { Authorization: 'Basic ' + Buffer.from('forged:wrong').toString('base64'), REMOTE_USER: 'admin' } })).status === 401, 'Forged credentials/headers cannot authenticate');
  check((await get('/api/gallery.php')).status === 503, 'Uninitialized public gallery reports setup needed');
  const adminResponse = await get('/admin/api.php', true);
  cookie = adminResponse.headers.get('set-cookie').split(';')[0];
  const admin = await adminResponse.json(); token = admin.csrf;
  check(admin.initialized === false && admin.items?.length === 0, `Admin begins with explicit import state: ${admin.error || adminResponse.status}`);
  check((await mutate('initialize', {}, 'invalid')).status === 403, 'Invalid CSRF must fail');
  const original = await fs.readFile(path.join(root, 'images/new.webp'));
  const imported = await mutate('initialize');
  check(imported.status === 200, `Import failed: ${await imported.clone().text()}`);
  const seeds = JSON.parse(await fs.readFile('src/gallery/seed.json', 'utf8'));
  let collection = await items();
  check(collection.length === 19, 'Import all 19 existing photos');
  check(collection.every((photo, i) => photo.title === seeds[i].title && photo.tags[0] === seeds[i].tags[0]), 'Preserve import order/tags/titles');
  const thumb = await sharp(path.join(root, collection[0].thumbnail)).metadata();
  check(Math.max(thumb.width, thumb.height) <= 640, 'Thumbnail respects 640px limit');
  check((await mutate('initialize')).status === 409, 'Import is one-time');
  const jpeg = await sharp({ create: { width: 240, height: 160, channels: 3, background: '#5c45dd' } }).jpeg().withMetadata({ orientation: 6 }).toBuffer();
  const uploadId = randomUUID();
  const uploaded = await upload(jpeg, 'camera.jpg', { tags: ['minimal', 'colour'], requestId: uploadId });
  check(uploaded.status === 200, 'Valid JPEG upload succeeds');
  const photo = (await uploaded.json()).item;
  check(photo.width === 160 && photo.height === 240, 'EXIF rotation corrected');
  check(photo.tags.length === 2, 'Multiple tags preserved');
  const retry = await upload(jpeg, 'camera.jpg', { requestId: uploadId });
  check((await retry.json()).item.id === photo.id, 'Retry does not duplicate an upload');
  const png = await sharp({ create: { width: 128, height: 96, channels: 4, background: { r: 100, g: 20, b: 200, alpha: 0 } } }).png().toBuffer();
  const pngResponse = await upload(png, 'transparent.png');
  const transparent = (await pngResponse.json()).item;
  check(pngResponse.status === 200 && (await sharp(path.join(root, transparent.src)).metadata()).hasAlpha, 'PNG transparency is preserved');
  const webp = await sharp(jpeg).webp().toBuffer();
  check((await upload(webp, 'test.webp')).status === 200, 'WebP upload succeeds');
  const beforeInvalid = (await items()).length;
  check((await upload(Buffer.from('<?php echo "not an image";'), 'payload.php')).status === 400, 'Executable upload rejected');
  check((await upload(jpeg, 'invalid.jpg', { tags: ['unknown'] })).status === 400, 'Unknown tags rejected');
  check((await upload(Buffer.alloc(10 * 1024 * 1024 + 1), 'large.png')).status === 400, 'Oversized uploads rejected');
  const largeDimensions = await sharp({ create: { width: 6000, height: 4500, channels: 3, background: '#ffffff' } }).png().toBuffer();
  check((await upload(largeDimensions, 'huge.png')).status === 400, 'Unsafe image dimensions rejected');
  check((await items()).length === beforeInvalid, 'Failed uploads do not add records');
  check((await mutate('edit', { id: photo.id, title: 'Updated title', alt: 'Updated description', tags: ['portraits', 'colour'] })).status === 200, 'Caption and tags editable');
  check((await items()).find(item => item.id === photo.id).tags.includes('portraits'), 'Edited tags are publicly available');
  check((await mutate('remove', { id: '../../images/new.webp' })).status === 404, 'Forged deletion path cannot target static files');
  await Promise.all(Array.from({ length: 8 }, (_, i) => new Promise((resolve, reject) => {
    const worker = spawn(php, [...phpArgs, 'tests/concurrent.php', root, String(i)], { env, stdio: 'pipe' });
    let output = ''; worker.stderr.on('data', data => { output += data; });
    worker.on('exit', code => code === 0 ? resolve() : reject(new Error(output)));
  })));
  collection = await items();
  check(collection.slice(0, 8).every((item, i) => item.title === `Concurrent edit ${i}`), 'File locks preserve concurrent edits');
  const removePhoto = collection.find(item => item.id === photo.id);
  check((await mutate('remove', { id: photo.id })).status === 200, 'Permanent removal succeeds');
  check(!(await fs.stat(path.join(root, removePhoto.src)).catch(() => null)), 'Full image permanently removed');
  check(!(await fs.stat(path.join(root, removePhoto.thumbnail)).catch(() => null)), 'Thumbnail permanently removed');
  check(hash(await fs.readFile(path.join(root, 'images/new.webp'))) === hash(original), 'Original homepage image untouched');
  for (const item of await items()) assert.equal((await mutate('remove', { id: item.id })).status, 200);
  check((await items()).length === 0, 'A successfully emptied catalogue stays empty');
  await fs.cp('dist', root, { recursive: true });
  check((await items()).length === 0, 'Redeploy preserves persistent empty catalogue');
  check((await mutate('initialize')).status === 409, 'Redeploy cannot reseed removed photos');
  check((await get('/admin/', true)).status === 200, 'Authenticated dashboard served');
  check((await get('/lib/seed.json')).status === 403, 'Library files not publicly served');
  console.log(`Passed ${checks} gallery integration checks (real PHP/GD, HTTP uploads, filesystem, concurrency, redeployment).`);
} catch (error) {
  console.error(serverOutput.slice(-4000)); throw error;
} finally { server.kill(); await new Promise(resolve => server.once('exit', resolve)); }
