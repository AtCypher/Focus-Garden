import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';
import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Base path. GitHub Pages serves a project site from /<repo-name>/, so the
 * deploy workflow sets VITE_BASE=/Focus-Garden/. Locally the app runs at /.
 */
const base = process.env.VITE_BASE ?? (process.env.GITHUB_ACTIONS ? '/Focus-Garden/' : '/');

/** GitHub Pages has no SPA rewrite; serving index.html as 404.html keeps deep links working. */
function spaFallback(): Plugin {
  let outDir = 'dist';
  return {
    name: 'grove-spa-fallback',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const index = resolve(outDir, 'index.html');
      if (existsSync(index)) copyFileSync(index, resolve(outDir, '404.html'));
    },
  };
}

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    spaFallback(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon.ico', 'icons/apple-touch-icon-180x180.png', 'icons/*.svg'],
      manifest: {
        name: 'Grove: focus timer',
        short_name: 'Grove',
        description: 'A focus timer that grows a garden. Free, offline, no accounts.',
        theme_color: '#2f6b4f',
        background_color: '#f4f7f1',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        categories: ['productivity', 'lifestyle'],
        icons: [
          { src: 'icons/pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    sourcemap: false,
    target: 'es2022',
  },
});
