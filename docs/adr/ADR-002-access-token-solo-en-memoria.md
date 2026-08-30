# ADR-002 — El access token vive solo en memoria

- **Estado:** Aceptado
- **Fecha:** 2026-08-09
- **Contexto normativo:** R-P0-2 del Informe de Gobernanza Pre-Beta
- **Componentes:** `tokenStore.ts`, `apiClient.ts`, `useAuthStore.ts`

---

## Contexto

La PWA maneja PHI (edad biológica, tipo de sangre, protocolo de tratamiento). Una sesión
robada no expone "una cuenta": expone el historial clínico de un paciente.

El modelo de amenaza principal en una SPA es **XSS**. Cualquier script inyectado —propio o de
una dependencia comprometida— puede leer `localStorage` de forma síncrona y completa. Las
cookies `HttpOnly` estarían fuera de su alcance, pero el backend actual entrega el token en el
cuerpo de la respuesta de `mobile-auth-v1`, así que el frontend debe custodiarlo.

### El fallo real, antes de este cambio

El diseño declaraba "token en memoria" (`tokenStore.ts`), pero existían tres filtraciones que
lo contradecían:

1. **`apiClient` (interceptor de respuesta):** tras un refresh por 401, escribía el access token
   renovado en `localStorage` bajo `auth-storage`.
2. **`apiClient` (interceptor de petición):** lo leía de vuelta desde `localStorage` como
   "fallback para F5".
3. **`useAuthStore.partialize`:** incluía `token: state.token` entre los campos persistidos.

Los puntos 1 y 2 formaban un par autorreferencial: el único escritor alimentaba al único lector.
El resultado neto era que **cualquier sesión que hubiera pasado por un refresh quedaba con el
token en disco**, anulando la protección que el diseño decía ofrecer.

---

## Decisión

**El access token se guarda exclusivamente en memoria (`tokenStore`) y nunca toca disco.**

- Se eliminó la escritura a `auth-storage` en el interceptor de refresh.
- Se eliminó la lectura de respaldo desde `localStorage` en el interceptor de petición.
- Se eliminó `token` de `partialize` en `useAuthStore`.

### Qué ocurre tras un F5

La memoria queda vacía, así que la primera petición sale sin cabecera `Authorization` y recibe
un 401. El interceptor de respuesta la reintenta usando el `refresh_token` y repuebla la memoria.
**Es el flujo previsto, no un fallo:** el "fallback a disco" que se eliminó no arreglaba nada que
el refresh no resolviera ya, y a cambio dejaba el token expuesto de forma permanente.

---

## Consecuencias

**Positivas**
- Un XSS con acceso a `localStorage` ya no obtiene una sesión clínica activa.
- El código y el diseño declarado vuelven a coincidir.

**Negativas / aceptadas**
- Cada recarga cuesta un ciclo 401 + refresh (una petición extra, imperceptible).
- **El `refresh_token` sigue en `localStorage` sin cifrar.** Es la deuda restante: un XSS podría
  usarlo para acuñar access tokens. Mitigado parcialmente por su TTL y por la rotación en cada
  uso. Cierre previsto en R-P1-2 (cifrarlo con `cryptoService`).

---

## Alternativas descartadas

- **Cookie `HttpOnly` + `SameSite=Strict`** — es la solución correcta y sigue siendo el destino
  deseable, pero requiere que el backend emita la cookie y comparta dominio con la PWA. Fuera del
  alcance de este repositorio. Reevaluar junto a R-P1-3.
- **`sessionStorage` en lugar de `localStorage`** — reduce la ventana temporal, pero sigue siendo
  legible por XSS. No resuelve el modelo de amenaza.
- **Cifrar el token con `cryptoService`** — la clave de descifrado vive en el mismo contexto JS
  que el atacante; ofrece ofuscación, no seguridad.

---

## Verificación

`src/test/apiClient.test.ts` fija el comportamiento como guarda de regresión:

- adjunta el token cuando está en memoria;
- **no** lo lee desde `localStorage` cuando la memoria está vacía;
- no deja rastro del token en `localStorage` tras adjuntarlo.

El segundo test reproduce exactamente el estado que dejaba la implementación anterior.
