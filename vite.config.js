import { defineConfig } from 'vite';
import fs from 'node:fs/promises';

export default defineConfig({
  plugins: [{
    name: 'hostinger-php',
    apply: 'build',
    async closeBundle() {
      // The server-authenticated PHP entrypoint serves this protected UI.
      await fs.rename('dist/admin/index.html', 'dist/admin/ui.html');
      await fs.cp('server', 'dist', { recursive: true });
    },
  }],
  server: {
    proxy: process.env.GALLERY_PHP_ORIGIN ? Object.fromEntries(['/api/', '/admin/api.php', '/uploads/'].map(path => [path, { target: process.env.GALLERY_PHP_ORIGIN }])) : undefined,
  },
  build: {
    rollupOptions: {
      input: ['index.html', 'gallery.html', 'privacy-policy.html', 'admin/index.html'],
    },
  },
});
