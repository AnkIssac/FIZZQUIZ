import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// The client proxies API calls to the FizzQuiz server during development and shares
// the /shared constants + scoring modules with the server via the @shared alias.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    fs: {
      // Allow importing the sibling /shared directory (outside the client root).
      allow: [fileURLToPath(new URL('..', import.meta.url))],
    },
    proxy: {
      '/api': 'http://localhost:3001',
      '/socket.io': { target: 'http://localhost:3001', ws: true },
    },
  },
});
