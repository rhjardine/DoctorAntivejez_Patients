import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
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
            {
              src: '/Icono_app.jpeg',
              sizes: '192x192',
              type: 'image/jpeg',
              purpose: 'any',
            },
            {
              src: '/Icono_app.jpeg',
              sizes: '192x192',
              type: 'image/jpeg',
              purpose: 'maskable',
            },
            {
              src: '/Icono_app.jpeg',
              sizes: '512x512',
              type: 'image/jpeg',
              purpose: 'any',
            },
            {
              src: '/Icono_app.jpeg',
              sizes: '512x512',
              type: 'image/jpeg',
              purpose: 'maskable',
            },
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
            },
          ],
        },
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-motion': ['framer-motion'],
            'vendor-charts': ['recharts'],
            'vendor-icons': ['lucide-react'],
            'vendor-router': ['react-router-dom'],
            'vendor-sentry': ['@sentry/react'],
            'vendor-fingerprint': ['@fingerprintjs/fingerprintjs'],
            'vendor-utils': ['axios', 'date-fns', 'zustand'],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
  };
});
