/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_ENCRYPTION_SEED?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  /** Kill switch de IA — "off" desactiva el VCoach. Ver src/config/featureFlags.ts */
  readonly VITE_FEATURE_VCOACH?: string;
  /** Kill switch de IA — "off" desactiva el FoodScanner. */
  readonly VITE_FEATURE_FOODSCANNER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
