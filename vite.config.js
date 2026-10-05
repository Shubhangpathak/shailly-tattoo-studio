import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: ['index.html', 'gallery.html', 'privacy-policy.html'],
    },
  },
});
