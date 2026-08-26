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

## ⚠️ Corrección: la semilla NO es secreta

La descripción de arriba habla de una «semilla de servidor», y eso **sobreestima la garantía**.
`VITE_ENCRYPTION_SEED` es una variable de Vite: se compila **literalmente dentro del bundle**
que se sirve al navegador. Verificado construyendo con una semilla marcada y encontrándola en
`dist/assets/index-*.js`.

En una aplicación de cliente esto no tiene arreglo: **no existe forma de ocultar un secreto en
un frontend**. La consecuencia es que el único factor realmente no público es el `visitorId`
del dispositivo, que además lo calcula el mismo código público.

**Lo que este cifrado sí protege:**
- Un volcado de `localStorage` trasladado a **otro** dispositivo: la huella difiere y el
  descifrado falla.
- Inspección casual del almacenamiento: el PHI no se lee a simple vista.

**Lo que NO protege:**
- A un atacante con acceso al dispositivo y capacidad de ejecutar código en el origen: puede
  invocar `decrypt()` igual que la app.
- A un ataque dirigido que reproduzca la derivación con la semilla pública y la huella.

Es **defensa en profundidad, no confidencialidad fuerte**, y así debe describirse ante el
comité y en cualquier evaluación de cumplimiento. El cierre real es el contrato de backend
recogido en [ADR-005](ADR-005-ids-inestables-adherencia.md) §«Gestión de claves»: que el
servidor entregue, tras autenticar, un secreto de envoltura por usuario que viva solo en
memoria. Con eso el contenido cifrado deja de ser descifrable sin una sesión válida.

## Consecuencias

**Positivas**
- La clave es no exportable: no puede extraerse desde JS.
- Robar el `localStorage` y llevárselo a otro dispositivo no basta.

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
