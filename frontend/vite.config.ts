import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      includeAssets: ['icons/apple-touch-icon.png', 'icons/favicon-32.png'],
      manifest: {
        name: 'InFormation',
        short_name: 'InFormation',
        description: 'Find and sign up for Girl Scout school volunteer events near you.',
        start_url: '/',
        display: 'standalone',
        background_color: '#faf6f0',
        theme_color: '#b5654a',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache the app shell only; API calls to the backend always go to the network.
        globPatterns: ['**/*.{js,css,html,png,svg}'],
      },
    }),
  ],
})
