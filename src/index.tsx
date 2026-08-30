import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import * as Sentry from "@sentry/react";
import { cryptoService, CryptoConfigError } from './services/cryptoService';
import { logger } from './utils/logger';

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

/**
 * Retira la pantalla de carga de index.html una vez que React ya pintó.
 * Se espera un frame para que el primer render exista antes de desvanecer:
 * sin esa espera se vería un parpadeo en blanco entre splash y app.
 * Idempotente — puede llamarse más de una vez sin efecto adicional.
 */
const dismissSplash = () => {
  const splash = document.getElementById('da-splash');
  if (!splash) return;
  requestAnimationFrame(() => {
    splash.classList.add('da-hide');
    splash.addEventListener('transitionend', () => splash.remove(), { once: true });
    // Red de seguridad: si la transición no dispara (pestaña en segundo plano,
    // prefers-reduced-motion), retirarlo igualmente.
    setTimeout(() => splash.remove(), 800);
  });
};

async function main() {
  if (!container) {
    console.error("No se pudo encontrar el elemento root.");
    // Retirar el splash aunque no haya nada que montar: una página en blanco
    // es honesta, un cargador eterno afirma que algo sigue en marcha.
    dismissSplash();
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
    // Proceder a montar la aplicación normalmente
  } catch (error: any) {
    console.error("Fallo crítico en la inicialización del motor criptográfico:", error);
    
    if (import.meta.env.PROD || error instanceof CryptoConfigError) {
      const rootElement = document.getElementById('root')!;
      const root = createRoot(rootElement);
      root.render(
        <div className="flex h-screen items-center justify-center bg-white text-[#293b64] p-6 text-center">
          <div className="max-w-md bg-slate-50 p-8 rounded-3xl border border-red-100 shadow-sm">
            <span className="text-4xl mb-4 block">🔒</span>
            <h1 className="text-xl font-bold mb-2">Error de Configuración de Seguridad</h1>
            <p className="text-sm text-slate-500">No se pudo establecer la conexión segura de datos. Por favor, contacte al administrador o recargue la aplicación.</p>
          </div>
        </div>
      );
      // Imprescindible: sin esto la pantalla de error quedaría oculta tras el
      // splash y el paciente vería una carga infinita en lugar del mensaje.
      dismissSplash();
      return; // Detener el arranque
    }

    // For other failures in DEV, continue boot.
    // The profile store will re-fetch fresh data from the network on next mount.
    logger.error('[Boot] Crypto init failed — profile will re-fetch from network', { error });
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  dismissSplash();
}

main();
