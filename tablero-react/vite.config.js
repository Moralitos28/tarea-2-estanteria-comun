import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Permite importar Bootstrap desde node_modules en los parciales de Sass.
        loadPaths: [fileURLToPath(new URL('./node_modules', import.meta.url))],
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin'],
      },
    },
  },
  server: {
    port: 5173,
  },
});
