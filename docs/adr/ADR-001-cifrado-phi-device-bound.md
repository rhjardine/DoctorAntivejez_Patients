# ADR-001 — Cifrado AES-GCM device-bound para PHI en el dispositivo

- **Estado:** Aceptado
- **Fecha:** 2026-08-09 (documenta una decisión anterior, ya implementada)
- **Componentes:** `cryptoService.ts`, `useProfileStore.ts`

---

## Contexto

La PWA cachea el perfil clínico del paciente (edad biológica y cronológica, tipo de sangre,
guías de tratamiento, planes alimentarios) para funcionar sin conexión y evitar recargas
constantes del backend. Ese caché es PHI y vive en `localStorage`, legible en claro por
cualquier script del origen y por quien tenga acceso físico al dispositivo desbloqueado.

## Decisión

Cifrar el estado persistido de `useProfileStore` con **AES-GCM 256**, mediante un `StateStorage`
propio (`encryptedStorage`) que cifra en `setItem` y descifra en `getItem`.

**Derivación de la clave:**

```
clave = PBKDF2(
  material   = VITE_ENCRYPTION_SEED + ":" + huellaDispositivo,
  salt       = "doctor-antivejez-salt",
  iteraciones= 100 000,
  hash       = SHA-256
) → AES-GCM 256, no exportable
```

La huella proviene de FingerprintJS (`visitorId`). Cada operación de cifrado usa un **IV
aleatorio de 12 bytes**; el formato almacenado es `base64(iv):base64(ciphertext)`.

**Validación de la semilla** (`cryptoService.init`): en producción se exige 32+ caracteres y se
rechazan patrones débiles conocidos (`changeme`, `test`, `password`…). Si falla, la app **no
arranca**: muestra "Error de Configuración de Seguridad". Se prefiere no arrancar antes que
cifrar PHI con una clave predecible.

## Consecuencias

**Positivas**
- El PHI en reposo no es legible sin la semilla del servidor **y** el dispositivo concreto.
- La clave es no exportable: no puede extraerse desde JS.
- Robar el `localStorage` sin la huella del dispositivo no basta.

**Negativas / aceptadas**
- **El cifrado no protege frente a un XSS en ejecución**: el atacante opera en el mismo contexto
  y puede invocar `decrypt()`. Protege el dato en reposo, no el runtime.
- Si la huella cambia (navegador actualizado, dispositivo nuevo), el descifrado falla. Se maneja
  limpiando la caché y refrescando desde el backend — sin pérdida de datos, pero con recarga.
- FingerprintJS `visitorId` es dato personal bajo GDPR: **debe declararse en la política de
  privacidad y en el consentimiento informado**. Pendiente de verificar en
  `PrivacyConsentModal.tsx`.
- Rotar la semilla invalida todos los cachés (procedimiento en `docs/RUNBOOK.md` §5).

## Alternativas descartadas

- **`crypto-js`** — implementación en JS puro, más lenta y con peor pedigrí criptográfico que
  Web Crypto, que es nativa y auditada por el navegador.
- **Semilla fija en el bundle** — recuperable con solo abrir el JS; equivale a no cifrar.
- **Semilla solo del dispositivo, sin componente de servidor** — impediría rotar la clave ante
  un compromiso.
- **No cachear PHI** — obligaría a pedir el perfil en cada navegación, inviable con un backend
  que puede tardar 30 s en arrancar en frío.
