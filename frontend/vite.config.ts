import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Language Magnet Poetry',
        short_name: 'Magnet Poetry',
        description:
          'Build, categorize, and save sentences by selecting words instead of typing.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#aa3bff',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // App shell (JS/CSS/HTML/icons) is precached automatically.
        // The word list is fetched separately from the Django API, so it
        // needs its own runtime caching rule to survive offline.
        // /api/auth/* and /api/sentences/* must NOT get a rule here: their
        // responses are per-user and session-dependent, so a CacheFirst
        // (or any) cache would leak/serve stale data across accounts.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/words/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'words-api-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
