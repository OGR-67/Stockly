import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'
import { VitePWA } from 'vite-plugin-pwa'


// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    proxy: {
      '/api': 'http://localhost:5050',
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      workbox: {
        globPatterns: [],
        runtimeCaching: [],
      },
      manifest: {
        name: 'Stockly',
        short_name: 'Stockly',
        description: 'Gestion des stocks maison',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
    mkcert({ hosts: ['localhost', '192.168.1.28'] }),
    tanstackRouter(),
    react(),
    tailwindcss(),
  ],
})
