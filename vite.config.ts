import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: [
      // This is a workaround for the strange Vercel build error.
      // It explicitly tells Rollup how to resolve the module.
      { find: 'react-dom-client', replacement: 'react-dom/client' }
    ]
  }
})