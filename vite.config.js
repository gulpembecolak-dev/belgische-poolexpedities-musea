import { defineConfig } from 'vite';

/**
 * GitHub Pages serves the project at /belgische-poolexpedities-musea/.
 * Local dev still serves at root (/). Vite's `base` handles HTML/CSS bundles
 * automatically — but hardcoded absolute paths in JS strings (`'/models/…'`,
 * `'/audio/…'`, etc.) bypass Vite. The plugin below rewrites those literals
 * at build time when running on CI, so production assets resolve correctly.
 */
const BASE = process.env.GITHUB_ACTIONS ? '/belgische-poolexpedities-musea/' : '/';
const ASSET_FOLDERS = [
  'models', 'photos', 'videos', 'audio',
  'textures', 'data', 'assets', 'fonts',
];

export default defineConfig({
  base: BASE,
  plugins: BASE === '/' ? [] : [
    {
      name: 'rewrite-absolute-asset-paths',
      enforce: 'pre',
      transform(code, id) {
        if (!/\.(js|jsx|ts|tsx|mjs)$/.test(id)) return null;
        if (id.includes('node_modules')) return null;
        const re = new RegExp(
          `(["'\`])/(${ASSET_FOLDERS.join('|')})/`,
          'g',
        );
        const out = code.replace(re, `$1${BASE}$2/`);
        return out === code ? null : { code: out, map: null };
      },
    },
  ],
});
