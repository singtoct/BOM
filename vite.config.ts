import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        "short_name": "BOM Manager",
        "name": "BOM & Costing Manager",
        "description": "An application for managing Bill of Materials (BOM) and calculating raw material costs for plastic injection molded products.",
        "icons": [
          {
            "src": "/vite.svg",
            "type": "image/svg+xml",
            "sizes": "192x192 512x512"
          }
        ],
        "start_url": ".",
        "display": "standalone",
        "theme_color": "#ffffff",
        "background_color": "#f3f4f6"
      }
    })
  ],
})
