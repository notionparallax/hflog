import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
      },
      manifest: {
        name: 'Human Factors Log',
        short_name: 'HF Log',
        description: 'Post-dive safety logging — confidential human factors reporting',
        theme_color: '#005f73',
        background_color: '#f4f4f5',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/hflog/',
        scope: '/hflog/',
        icons: [
          { src: 'pwa-64x64.png',           sizes: '64x64',   type: 'image/png' },
          { src: 'pwa-192x192.png',          sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png',          sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  base: '/hflog/',
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
})
