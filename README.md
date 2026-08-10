# Doctor Antivejez — PWA de Pacientes

Aplicación web progresiva para pacientes de medicina antienvejecimiento. Permite consultar la
guía de tratamiento prescrita por el médico, registrar adherencia, seguir el plan nutrigenómico
y acceder al asistente VCoach.

> **Estado: pre-beta.** No apta todavía para pacientes reales en producción abierta.
> Ver [Estado y deuda conocida](#estado-y-deuda-conocida).

---

## Requisitos

- Node.js 20+
- npm 10+

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y rellenar VITE_ENCRYPTION_SEED
npm run dev                  # http://localhost:3000
```

`VITE_ENCRYPTION_SEED` es obligatoria: cifra el PHI en el dispositivo. En desarrollo, si falta,
se usa una semilla temporal insegura; **en producción la app no arranca sin ella**, por diseño.
Generar con `openssl rand -base64 48`.

En desarrollo, las llamadas al backend se proxean vía `/api-render` (ver `vite.config.ts`), así
que no hace falta `VITE_API_URL` localmente.

## Comandos

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (puerto 3000) |
| `npm run build` | Build de producción |
| `npm run preview` | Servir el build localmente |
| `npm test` | Tests unitarios (Vitest) |
| `npm run test:coverage` | Tests con reporte de cobertura |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Arquitectura

```
src/
├── pages/          Rutas. `public/` = funnel sin login; el resto requiere sesión
├── components/     Vistas y componentes de UI
├── services/       Capa de datos: API, cifrado, cola offline, normalización clínica
├── store/          Estado global (Zustand): auth, perfil, UI, funnel público
├── hooks/          Sesión, sincronización, recordatorios, modo oscuro
├── config/         Feature flags (kill switch de IA)
└── utils/          Logger con sanitización de PHI, limpieza de storage
```

**Stack:** React 19 · Vite 6 · TypeScript · Zustand · React Router 7 · Tailwind ·
Workbox (PWA) · Sentry

### Decisiones de seguridad relevantes

- El **access token vive solo en memoria** (`tokenStore`), nunca en disco — [ADR-002](docs/adr/ADR-002-access-token-solo-en-memoria.md).
- El **perfil clínico se cifra** con AES-GCM antes de persistirse, con clave derivada de la
  semilla y la huella del dispositivo.
- El **logger sanitiza PHI** antes de escribir a consola o Sentry. No usar `console.*` directo
  para datos clínicos.
- Ante un fallo del backend, **nunca se fabrican datos clínicos** — [ADR-007](docs/adr/ADR-007-nunca-fabricar-datos-clinicos.md).

## Documentación

- [`docs/adr/`](docs/adr/) — Architecture Decision Records
- [`docs/RUNBOOK.md`](docs/RUNBOOK.md) — Operación, soporte e incidentes (incluye kill switch de IA)

## Estado y deuda conocida

Bloqueantes para el piloto con pacientes reales, **fuera del alcance de este repositorio**
(requieren backend u organización):

| Deuda | Referencia |
|---|---|
| El backend no emite IDs estables → parte de la adherencia no se registra | [ADR-005](docs/adr/ADR-005-ids-inestables-adherencia.md) |
| Guardrails de IA del servidor: filtros de entrada/salida, auditoría, retención | [ADR-004](docs/adr/ADR-004-ia-generativa-vcoach-foodscanner.md) |
| `refresh_token` sin cifrar en `localStorage` | [ADR-002](docs/adr/ADR-002-access-token-solo-en-memoria.md) |
| Sin rate-limit en `/mobile-auth-v1` | Backend |

Módulos aún tras *feature gate* ("Próximamente"): Logros, Explorador Ómico, Historial Clínico,
Tienda.
