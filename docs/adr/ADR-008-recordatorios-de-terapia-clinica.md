# ADR-008 — Recordatorios de terapia clínica

- **Estado:** **No implementable desde este repositorio** — requiere backend
- **Fecha:** 2026-08-23
- **Origen:** revisión médica en vídeo. *"El sistema debe alertar/notificar automáticamente al
  paciente el día y la frecuencia en que le corresponde asistir a su terapia clínica."*
- **Componentes:** `useReminders.ts`, `notificationService.ts`, `clinicalPayloadNormalizer.ts`

---

## Contexto

El médico pidió que la app avise al paciente el día que le toca acudir a un procedimiento
(suero, quelación, nebulización, terapia celular). Al intentar implementarlo aparecieron **dos
bloqueos independientes**, ambos del lado del servidor. Conviene enunciarlos por separado:
resolver uno sin el otro no cumple el requisito.

### Bloqueo 1 — No existe una fecha a la que avisar

`PatientProtocol` no tiene ningún campo de cita:

```ts
{ id, category, itemName, dose, schedule, observations?, status, timeSlot,
  prescribedAt, updatedAt }
```

`schedule` es **texto libre** escrito por el médico: `"Quincenal"`, `"Semanal"`,
`"En ayunas"`. No es una frecuencia estructurada ni una fecha.

De ahí que hoy no pueda calcularse *"el día que le corresponde"* **ni siquiera dentro de la
app**. Intentar deducirlo interpretando la cadena —parsear `"Quincenal"` y contar desde
`prescribedAt`— produciría una fecha inventada; en una app clínica, un aviso para acudir a
consulta el día equivocado es peor que no avisar.

### Bloqueo 2 — No existe Web Push

`useReminders` funciona con un `setInterval` de 60 s más un listener de `visibilitychange`:

```ts
const interval = setInterval(checkTimeAndNotify, 60000);
document.addEventListener('visibilitychange', checkTimeAndNotify);
```

Es decir, **solo se ejecuta con la aplicación abierta**. `notificationService.send()` muestra
una notificación local; no hay suscripción push. Un paciente con la app cerrada —el caso
normal— nunca recibiría el aviso.

No hay `pushManager`, ni claves VAPID, ni `applicationServerKey` en ninguna parte del proyecto.

---

## Decisión

**No se simula el comportamiento.** En Terapéutica se muestra la frecuencia tal como la escribió
el médico, que es el dato real disponible, y no se anuncia ninguna fecha.

El requisito queda **abierto** y bloquea su propio cierre hasta que el backend aporte las dos
piezas de abajo.

---

## Contrato pendiente del backend

### 1. Fecha o frecuencia estructurada

Añadir a cada ítem de categoría clínica, como mínimo:

```ts
{
  nextAppointmentAt?: string;   // ISO 8601 — la próxima cita concreta
  frequency?: {                 // alternativa: frecuencia estructurada
    every: number;              // 1, 2, 3...
    unit: 'DAY' | 'WEEK' | 'MONTH';
  };
}
```

Con `nextAppointmentAt` basta para avisar. Con `frequency` la app puede calcular la siguiente a
partir de la última realizada, pero eso exige además registrar las sesiones ya aplicadas.

`schedule` se mantiene como texto para mostrar al paciente; **no debe usarse para calcular**.

### 2. Web Push (VAPID)

- Par de claves VAPID; la pública se expone al cliente.
- Endpoint para persistir la suscripción (`pushManager.subscribe()`) por paciente y dispositivo,
  con baja al cerrar sesión.
- Servicio de envío programado que dispare la notificación el día de la cita.
- El Service Worker ya existe (`vite-plugin-pwa` + `sw-messages.js`): habrá que añadirle el
  manejador `push`.

**Privacidad:** el cuerpo de la notificación **no debe contener PHI**. Un aviso legible en la
pantalla de bloqueo con el nombre del procedimiento expone información clínica a quien tenga el
teléfono delante. Texto neutro: *"Tienes una cita programada. Abre la app para ver el detalle."*

---

## Consecuencias

**Aceptadas**
- El paciente debe seguir dependiendo del canal humano de recordatorio (WhatsApp de soporte o
  consulta) para sus procedimientos. **El médico debe saber que esta pieza no está cubierta.**

**Cuando se implemente**
- Revisar la retención de suscripciones push en la matriz de riesgos: un endpoint push es un
  identificador de dispositivo.

---

## Verificación de cierre

Con un ítem clínico cuya cita sea mañana y la app **cerrada**, el paciente recibe la
notificación. Hasta que eso pueda comprobarse, este ADR permanece en estado *No implementable*.
