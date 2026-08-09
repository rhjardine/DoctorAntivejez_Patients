# ADR-006 — Hosting del backend en Render (plan gratuito)

- **Estado:** Aceptado con fecha de revisión — **se recomienda migrar antes del piloto**
- **Fecha:** 2026-08-09
- **Contexto normativo:** decisión D-8 del Informe de Gobernanza Pre-Beta; §6.2 ("infraestructura
  metida en el cliente")
- **Componentes:** `authService.ts`, `apiClient.ts`, `vite.config.ts`

---

## Contexto

El backend clínico corre en Render, plan gratuito. Ese plan **suspende la instancia por
inactividad**, y el primer arranque en frío puede superar los 30 segundos.

El frontend compensa esa limitación con lógica propia:

- timeout de login de **45 s** (frente a los ~10 s razonables);
- **reintento automático** ante fallos de red;
- mensaje específico al paciente: *"El servidor está iniciando. Espere 30 segundos."*

## Decisión

Se mantiene el plan gratuito **para desarrollo**, y se **recomienda migrar al plan de pago
(~7 USD/mes) antes del primer paciente del piloto**.

Justificación: el primer contacto del paciente con la aplicación es el login. Una espera de 30 s
sin explicación es la peor primera impresión posible en un producto clínico, y el mensaje de
espera —por muy bien redactado que esté— no deja de ser una disculpa por una limitación evitable
por el coste de un café.

## Consecuencias

**De mantener el plan gratuito**
- Arranques en frío de 30 s+ en el primer acceso del día de cada paciente.
- Se conserva **lógica de infraestructura dentro del cliente**: timeouts y reintentos que
  existen solo por el plan de hosting. Acopla el frontend a una decisión que debería serle
  transparente (§6.2).
- Riesgo de que el paciente abandone creyendo que la app no funciona.

**De migrar al plan de pago**
- Desaparece el ~90 % de los problemas de arranque.
- Los timeouts pueden bajar a valores razonables (~10 s) y los reintentos volverse
  excepcionales.
- Coste: ~7 USD/mes.

## Criterios de revisión

Migrar cuando se cumpla **cualquiera** de estos:

1. Se incorpora el primer paciente real (aunque sea del piloto acotado).
2. El soporte recibe más de 2 incidencias por semana atribuibles a lentitud de arranque.
3. Se activa cualquier función de IA generativa en producción (los endpoints del modelo suman
   latencia sobre un arranque ya lento).

## Alternativas

- **Railway / Fly.io** — precios similares, sin suspensión por inactividad. Válidas si se
  prefiere no seguir en Render.
- **Ping periódico para mantener viva la instancia** — descartada: viola los términos de uso del
  plan gratuito y traslada al cliente un problema del servidor.
- **BFF en Vercel Edge / Cloudflare Workers** — solución de escala, no de arranque en frío. No
  se justifica con el volumen actual (decisión D-11: no antes del piloto).
