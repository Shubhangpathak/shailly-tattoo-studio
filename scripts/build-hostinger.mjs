import { execFileSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

execFileSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build'], { stdio: 'inherit' });
const root = process.cwd();
const output = path.join(root, 'hostinger-upload.zip');
function archive(folder, destination) {
if (process.platform === 'win32') {
  const quote = value => `'${value.replaceAll("'", "''")}'`;
  if (fs.existsSync(destination)) fs.unlinkSync(destination);
  const command = `$ErrorActionPreference = 'Stop'; Add-Type -AssemblyName System.IO.Compression; Add-Type -AssemblyName System.IO.Compression.FileSystem; $packageRoot = ${quote(folder)}; $packageZip = [IO.Compression.ZipFile]::Open(${quote(destination)}, [IO.Compression.ZipArchiveMode]::Create); try { Get-ChildItem -LiteralPath $packageRoot -Recurse -File -Force | ForEach-Object { $entryName = $_.FullName.Substring($packageRoot.Length + 1).Replace('\\', '/'); [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($packageZip, $_.FullName, $entryName) | Out-Null } } finally { $packageZip.Dispose() }`;
  execFileSync('powershell.exe', ['-NoProfile', '-Command', command], { stdio: 'inherit' });
} else {
  if (fs.existsSync(destination)) fs.unlinkSync(destination);
  execFileSync('zip', ['-qr', destination, '.'], { cwd: folder, stdio: 'inherit' });
}
}
archive(path.join(root, 'dist'), output);
fs.mkdirSync(path.join(root, 'tmp'), { recursive: true });
const setup = fs.mkdtempSync(path.join(root, 'tmp', 'hostinger-setup-'));
for (const entry of ['admin', 'api', 'lib', 'assets', 'images', 'fonts', 'brand-logo.webp', 'favicon-circle.svg']) {
  fs.cpSync(path.join(root, 'dist', entry), path.join(setup, entry), { recursive: true });
}
archive(setup, path.join(root, 'hostinger-backend.zip'));
console.log(`Ready to upload: ${output}\nFirst installation: upload hostinger-backend.zip and initialize /admin/ before replacing the public pages.\nPreserve uploads/, private gallery-data, and admin/.htaccess on future deployments.`);
