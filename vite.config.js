import { defineConfig } from 'vite';

// GitHub Pages serves at /belgische-poolexpedities-musea/ — use relative base
// so all asset paths resolve correctly. Use absolute '/' for local dev.
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/belgische-poolexpedities-musea/' : '/',
});
