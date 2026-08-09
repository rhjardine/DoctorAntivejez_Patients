# Runbook Operativo — Doctor Antivejez PWA

Procedimientos de soporte e incidentes. Destinatarios: soporte de primera línea, SRE y el
médico de guardia.

> Ante cualquier duda sobre si un incidente afectó la seguridad de un paciente, **escalar al
> médico responsable antes que resolver técnicamente**. La app es un producto clínico.

---

## 1. Kill switch de IA generativa

**Cuándo usarlo:** el VCoach emite una recomendación clínicamente peligrosa, el FoodScanner
clasifica mal un alérgeno, o se sospecha de cualquier daño atribuible a la IA.

**Procedimiento (menos de 5 minutos):**

1. En el panel de entorno del hosting, fijar:
   - `VITE_FEATURE_VCOACH=off` — desactiva el chat
   - `VITE_FEATURE_FOODSCANNER=off` — desactiva el escáner de alimentos
2. Redesplegar. Las variables se resuelven **en tiempo de build**, así que un cambio sin
   redeploy no surte efecto.
3. Verificar en la app: el chat debe mostrar *"VCoach no disponible"* y el botón del escáner
   debe haber desaparecido de la vista de Nutrición.
4. Notificar al médico responsable y registrar el incidente.

Valores que desactivan: `off`, `false`, `0` (sin distinguir mayúsculas).
**Si la variable no existe, la función queda activa** — apagar es siempre deliberado.

Para reactivar: borrar la variable o ponerla en `on`, y redesplegar.

---

## 2. Paciente con la app rota o en estado inconsistente

**Síntomas:** pantalla en blanco, sesión que no cierra, datos que no cargan tras un cambio de
dispositivo, error de descifrado.

**Causa habitual:** caché local corrupta. El perfil se cifra con una clave derivada de la huella
del dispositivo; si esta cambia (actualización del navegador, cambio de equipo), el descifrado
falla.

**Procedimiento:** enviar al paciente esta URL:

```
https://<dominio-de-produccion>/?clear=1
```

Borra `localStorage`, `sessionStorage` y las cachés del Service Worker, y redirige a la raíz.
El paciente deberá iniciar sesión de nuevo. **No borra nada del servidor**: su historial clínico
está intacto.

Si persiste tras el reset, escalar a ingeniería con: modelo de dispositivo, navegador y versión,
y hora aproximada del fallo.

---

## 3. "Marqué mi tratamiento y no aparece"

**Causa conocida y esperada.** Cuando el backend no emite un identificador estable para un ítem
del protocolo, la adherencia **no puede registrarse**. La app lo detecta, revierte la casilla y
muestra un aviso rojo: *"No pudimos registrar este cambio."*

**Esto no es un fallo de la app: es la deuda descrita en [ADR-005](adr/ADR-005-ids-inestables-adherencia.md).**

**Procedimiento:**
1. Confirmar con el paciente que vio el aviso rojo (si marcó y **no** hubo aviso, el registro sí
   se hizo — es otro problema, escalar).
2. Registrar la adherencia por el canal manual de respaldo (WhatsApp de soporte o nota en la
   próxima consulta).
3. Anotar el caso: la métrica `adherence_rejected_unstable_id` mide la frecuencia y justifica la
   prioridad del arreglo en backend.

---

## 4. El backend tarda o da error al iniciar sesión

El plan gratuito de Render suspende la instancia por inactividad; el primer arranque en frío
puede tardar más de 30 s. El login ya contempla 45 s de timeout y reintenta una vez.

**Mensaje al paciente:** *"El servidor está iniciando. Espere 30 segundos e intente de nuevo."*

Si se repite de forma sistemática, es un problema de infraestructura, no de la app: migrar a
instancia de pago (decisión D-8 del informe de gobernanza).

---

## 5. Sospecha de compromiso de la semilla de cifrado

Si `VITE_ENCRYPTION_SEED` se filtra (aparece en un repositorio, un log o un ticket):

1. Generar una semilla nueva: `openssl rand -base64 48`
2. Reemplazarla en el entorno de producción y redesplegar.
3. **Consecuencia esperada:** todos los perfiles cacheados dejan de descifrarse. La app lo
   gestiona sola —limpia la caché y vuelve a pedir los datos al backend—, así que **no hay
   pérdida de datos clínicos**, solo una recarga.
4. Registrar el incidente: la semilla protege PHI, su filtración es un evento reportable.

---

## 6. Verificación tras un despliegue

```bash
npm ci && npx tsc --noEmit && npm run lint && npm test && npm run build
```

Y en la app desplegada:

- [ ] Login con un paciente de prueba
- [ ] La guía de tratamiento carga
- [ ] Marcar adherencia persiste tras recargar
- [ ] El aviso de IA es visible al abrir el VCoach
- [ ] La PWA se instala (Android e iOS 16.4+)
- [ ] `?clear=1` limpia y redirige correctamente

---

## Contactos

| Rol | Responsable | Canal |
|---|---|---|
| Médico responsable | _por definir_ | _por definir_ |
| Ingeniería / SRE | _por definir_ | _por definir_ |
| Soporte a pacientes | _por definir_ | WhatsApp |

> Completar antes del primer paciente. Un runbook sin responsables no es operable.
