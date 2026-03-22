import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api-render': {
          target: 'https://doctor-antivejez-web.onrender.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-render/, ''),
          secure: true,
        },
      },
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'prompt',
        manifest: {
          name: 'Doctor Antivejez',
          short_name: 'Antivejez',
          description: 'Plataforma de medicina preventiva y longevidad',
          theme_color: '#293B64',
          background_color: '#293B64',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // ✅ UPDATE: Esperar activación del Service Worker
          // Evita recargar sesiones activas abruptamente
          skipWaiting: false,
          clientsClaim: true,
          importScripts: ['sw-messages.js'],
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,jpeg,jpg}'],
          runtimeCaching: [
            {
              urlPattern: ({ url }) =>
                url.pathname.includes('mobile-auth-v1') ||
                url.pathname.includes('mobile-profile-v1') ||
                url.pathname.includes('mobile-adherence-v1') ||
                url.pathname.includes('auth/refresh') ||
                url.pathname.includes('/api/'),
              handler: 'NetworkOnly',
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
