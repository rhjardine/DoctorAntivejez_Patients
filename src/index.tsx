import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import * as Sentry from "@sentry/react";
import { cryptoService } from './services/cryptoService';

// ✅ SECURITY: Sentry solo se inicializa si el DSN está configurado via env var
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event) {
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          // @ts-ignore
          delete event.request.headers.Authorization;
        }
      }
      return event;
    },
  });
}

import './index.css'; // Assuming styles are imported here or in App.tsx

const container = document.getElementById('root');

async function main() {
  if (!container) {
    console.error("No se pudo encontrar el elemento root.");
    return;
  }

  // ✅ EMERGENCY RESET — ?clear=1 parameter clears all corrupted local state
  // Usage: send patient the URL https://doctorantivejez-patients.onrender.com/?clear=1
  const url = new URL(window.location.href);
  if (url.searchParams.get('clear') === '1') {
    console.log('[Boot] Emergency reset triggered via ?clear=1');
    // Remove all localStorage keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keysToRemove.push(key);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    sessionStorage.clear();
    // Clear Service Worker caches too
    if ('caches' in window) {
      caches.keys().then(names => names.forEach(n => caches.delete(n)));
    }
    // Redirect cleanly without the ?clear=1 parameter
    window.location.replace('/');
    return; // Stop boot here — redirect will re-run main()
  }

  // Warm up crypto before React hydrates
  // This guarantees the key is ready before any Zustand persist read is attempted
  try {
    await cryptoService.init();
  } catch (error: any) {
    // Check if it's the critical production seed error
    if (import.meta.env.PROD && error.message?.includes('VITE_ENCRYPTION_SEED missing')) {
      const root = createRoot(container);
      root.render(
        <div style={{
          height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#F8FAFC', color: '#1E293B', fontFamily: 'system-ui', padding: '20px', textAlign: 'center'
        }}>
          <div style={{ maxWidth: '400px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔐</div>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Error de configuración de seguridad</h1>
            <p style={{ marginTop: '10px', color: '#64748B', lineHeight: '1.5' }}>
              Contacte al administrador del sistema para verificar las variables de entorno (SEED).
            </p>
          </div>
        </div>
      );
      return; // STOP BOOT
    }

    // For other failures (e.g. FingerprintJS or subtle crypto issues), fall back gracefully
    console.warn('[Boot] Crypto init failed — profile will re-fetch from network');
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

main();
