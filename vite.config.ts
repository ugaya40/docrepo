import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import packageJson from './package.json'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('mermaid')) return 'vendor-mermaid';
            if (id.includes('katex')) return 'vendor-katex';
            if (id.includes('highlight.js')) return 'vendor-highlight';
            if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype')) return 'vendor-markdown';
            if (id.includes('@supabase') || id.includes('octokit')) return 'vendor-db';
            if (id.includes('react')) return 'vendor-react';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'docRepo',
        short_name: 'docRepo',
        description: 'GitHub Repository Markdown Viewer',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
  }
})
