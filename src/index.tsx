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

  // Warm up crypto before React hydrates
  // This guarantees the key is ready before any Zustand persist read is attempted
  await cryptoService.init().catch(() => {
    // If crypto fails, the store falls back to returning null for profileData
    // user sees loading state, not a crash
    console.warn('[Boot] Crypto init failed — profile will re-fetch from network');
  });

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}

main();
