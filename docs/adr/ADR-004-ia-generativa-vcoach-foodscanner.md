# ADR-004 — IA generativa: VCoach y FoodScanner

- **Estado:** Parcial — el frontend cumple; **los guardrails de servidor siguen pendientes**
- **Fecha:** 2026-08-09
- **Contexto normativo:** §2, §3 y R-P0-4 del Informe de Gobernanza Pre-Beta; decisiones D-3, D-17
- **Componentes:** `geminiService.ts`, `VCoachChat.tsx`, `FoodScannerModal.tsx`, `config/featureFlags.ts`

---

## Contexto

La PWA expone dos funciones basadas en modelos generativos:

| Función | Endpoint | Riesgo |
|---|---|---|
| **VCoach** (chat) | `/vcoach-chat-v1` | Crítico — puede emitir recomendaciones clínicas no validadas |
| **FoodScanner** (visión) | `/api/vision-v1` | Alto — puede clasificar mal un alimento alergénico |

`geminiService.ts` envía al backend un `patientContext` con nombre, edad cronológica, edad
biológica, brecha entre ambas y tipo de sangre. Ese contexto se usa, presumiblemente, para
construir el prompt del modelo.

### Lo que faltaba en el frontend

- **Ningún aviso** de que el paciente hablaba con un modelo de IA.
- El FoodScanner emitía **veredictos absolutos** (`Recomendado` / `Evitar`) con la autoridad
  visual de una indicación médica, sin considerar alergias declaradas ni el plan del médico.
- **Ningún interruptor** para desactivar la IA ante un incidente sin redesplegar código.

---

## Decisión

### Implementado en este repositorio

1. **Transparencia persistente en VCoach.** Banner no descartable en la cabecera del chat:
   el paciente habla con una IA, puede equivocarse, no diagnostica ni prescribe, y ante duda
   clínica debe consultar a su equipo médico.
2. **Trazabilidad por mensaje.** Cada respuesta del modelo se etiqueta *"Generado por IA"* junto
   a la hora, para que no pueda confundirse con un mensaje de una persona.
3. **Lenguaje no prescriptivo en FoodScanner** (decisión D-3(b)):
   `Recomendado` → **"Posiblemente compatible"**;
   `Evitar` → **"Posible incompatibilidad"**;
   `Consumo Moderado` → **"Requiere moderación"**.
   Se añade un aviso que declara explícitamente que la clasificación **no considera alergias ni
   el plan médico específico** y remite a verificación con el nutricionista.
4. **Kill switch (D-17).** `VITE_FEATURE_VCOACH` y `VITE_FEATURE_FOODSCANNER`. Con valor
   `off` / `false` / `0`:
   - VCoach muestra una pantalla de indisponibilidad que redirige al médico;
   - el botón del FoodScanner desaparece y el modal no se monta aunque el estado lo solicite.
   La ausencia de la variable **no** desactiva nada: apagar es siempre deliberado.

---

## Pendiente — bloquea el Gate 1

Nada de lo anterior sustituye los guardrails de servidor. Sigue **sin implementar** (backend,
§3.2 del informe):

1. **Versionado del system prompt** y aprobación por el equipo médico.
2. **Filtro de entrada:** detección de síntomas agudos ("dolor de pecho", ideación suicida,
   abandono de medicación) con **escalación a un humano**.
3. **Filtro de salida:** bloqueo de lenguaje prescriptivo ("debes dejar", "diagnóstico", "cura",
   "garantizo") y verificación contra el plan del médico y los alimentos prohibidos del paciente.
4. **Registro de auditoría** (`vcoach_interactions`) con prompt, versión, modelo, contexto,
   respuesta y destinatario. Hoy solo se registra `messageLength` — insuficiente para una
   reconstrucción médico-legal.
5. **Retención de 6+ años** (decisión D-7).
6. **Red team documentado** en acta firmada (§3.3).

### Preguntas abiertas para el comité (§2.3)

Sin respuesta a la fecha, y necesarias para cerrar este ADR:

- Proveedor y modelo exactos (¿Gemini API directa? ¿Vertex AI?) y **contrato BAA** si aplica.
- Retención de prompts y respuestas **del lado del proveedor**.
- Parámetros de `temperature` / `top-p` (control de alucinaciones).
- **Consentimiento informado específico para IA**, en casilla separada (decisión D-5(b)).
  `PrivacyConsentModal.tsx` existe, pero no se ha verificado que cubra el uso de IA.

---

## Consecuencias

**Positivas**
- El paciente ya no puede confundir una salida de modelo con una indicación médica.
- Existe un corte de emergencia operable sin tocar código.
- El FoodScanner deja de emitir veredictos con autoridad clínica.

**Negativas / aceptadas**
- **La transparencia no evita el daño, solo lo advierte.** Si el modelo emite una recomendación
  peligrosa, el aviso no la bloquea: eso requiere el filtro de salida del backend.
- El `patientContext` (incluido el nombre del paciente) sigue enviándose al proveedor del modelo
  sin que esté documentado su tratamiento. Riesgo regulatorio abierto hasta que el comité
  responda §2.3.

---

## Verificación

- `src/test/featureFlags.test.ts` fija la semántica del kill switch.
- Verificación manual pendiente: fijar `VITE_FEATURE_VCOACH=off`, reconstruir y confirmar que
  el chat muestra la pantalla de indisponibilidad y el botón del escáner desaparece.
