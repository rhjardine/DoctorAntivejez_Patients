import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://TU_DSN_AQUI@sentry.io/PROJECT_ID", // TODO: Replace with real DSN provided by user
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

import './index.css'; // Assuming styles are imported here or in App.tsx

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  console.error("No se pudo encontrar el elemento root.");
}
