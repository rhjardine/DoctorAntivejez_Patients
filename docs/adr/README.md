# Architecture Decision Records

Decisiones arquitectónicas con su contexto, sus alternativas descartadas y sus consecuencias
aceptadas. Sirven para que quien llegue después entienda **por qué** el código es como es, sin
tener que reconstruirlo por arqueología.

Regla: una decisión que afecte a la seguridad del paciente, a la custodia de PHI o al contrato
con el backend **se documenta aquí antes de mergear**.

## Índice

| ADR | Tema | Estado |
|---|---|---|
| [001](ADR-001-cifrado-phi-device-bound.md) | Cifrado AES-GCM device-bound para PHI | Aceptado |
| [002](ADR-002-access-token-solo-en-memoria.md) | El access token vive solo en memoria | Aceptado |
| [003](ADR-003-cola-offline-indexeddb.md) | Cola offline en IndexedDB, sin credenciales | Aceptado |
| [004](ADR-004-ia-generativa-vcoach-foodscanner.md) | IA generativa: VCoach y FoodScanner | **Parcial — guardrails de servidor pendientes** |
| [005](ADR-005-ids-inestables-adherencia.md) | IDs inestables y pérdida de adherencia | **Parcial — depende del backend** |
| [006](ADR-006-hosting-render-free-tier.md) | Hosting en Render (plan gratuito) | Aceptado con fecha de revisión |
| [007](ADR-007-nunca-fabricar-datos-clinicos.md) | Nunca fabricar datos clínicos | Aceptado |
| [008](ADR-008-recordatorios-de-terapia-clinica.md) | Recordatorios de terapia clínica | **No implementable — requiere backend** |

## Deuda que bloquea el piloto

Los ADR **004**, **005** y **008** describen deuda que **no puede cerrarse desde este
repositorio**: requieren cambios en el backend. Todos incluyen el contrato exacto que debe
cumplirse y su criterio de verificación.

## Formato

Contexto → Decisión → Consecuencias (positivas y aceptadas) → Alternativas descartadas →
Verificación. Sin adornos: un ADR que no dice qué se descartó y por qué no sirve de nada.
