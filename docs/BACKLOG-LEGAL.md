# Backlog legal y de cumplimiento

Estado: **propuesta de trabajo**, nada de esto está implementado salvo lo que se
marca como existente. Fecha del inventario: 2026-10-15.

## Qué es este documento y qué no es

Es el plan de **ingeniería** para sostener seis compromisos legales en la PWA:
términos y condiciones, política de privacidad, política de almacenamiento local
y su consentimiento, registro demostrable de quién aceptó qué y cuándo, política
de reembolso, y derechos sobre los elementos.

No es asesoría legal y no contiene texto legal. Los textos los tiene que redactar
o aprobar el abogado de la clínica: aquí se construyen las superficies donde ese
texto vive, el mecanismo que captura la aceptación y la prueba que queda después.
Escribir yo el articulado sería el mismo error que inventar una dieta (ADR-007),
con la diferencia de que el daño llega más tarde.

Hay una decisión que bloquea la redacción y que no puedo tomar yo: **bajo qué
marco legal opera el piloto**. Venezuela, un país de la UE con pacientes bajo
RGPD, o varios a la vez, cambian qué hace falta y qué basta. Lo demás del plan
se sostiene igual en cualquiera de los tres; lo que cambia es el contenido de los
textos y si el escaneo facial es «dato biométrico de categoría especial».

## Lo que ya existe (verificado en el código)

| Pieza | Dónde | Estado |
|---|---|---|
| Consentimiento granular con tres decisiones independientes | `src/services/consentService.ts`, `src/components/PrivacyConsentModal.tsx` | Funciona |
| Versión de política junto a la decisión (`VERSION_POLITICA`) | `consentService.ts` | Funciona; si el texto cambia, sube la constante y se vuelve a preguntar |
| Sello de tiempo de la aceptación | `RegistroConsentimiento.timestamp` | Funciona |
| Envío al servidor con reintento offline | `consentService.ts` → `POST /mobile-profile-v1/consent`, con respaldo en `offlineQueue` | **Sin verificar que el backend persista el campo `consents`** |
| Los consentimientos opcionales no bloquean el servicio | Solo `datosClinicos` es obligatorio | Funciona |
| Rechazar IA generativa apaga el asistente | `VCoachChat.tsx` | Funciona |
| Cifrado AES-GCM de PHI en el dispositivo | ADR-001, `cryptoService.ts` | Funciona |

El cimiento está puesto. Lo que falta es, sobre todo, **texto que no existe** y
**prueba que no se puede exportar**.

## Lo que falta, por sprint

Los sprints están ordenados por dependencia, no por urgencia percibida. L1 es el
que más importa: sin él, los demás producen aceptaciones que no se pueden
demostrar, y una aceptación que no se puede demostrar no sirve de nada.

### Sprint L1 — Que el consentimiento sea demostrable

El objetivo no es pedir consentimiento (eso ya se hace), es poder **probar**
meses después, ante quien lo pregunte, que una persona concreta aceptó un texto
concreto en un momento concreto.

1. **Verificar que el backend persiste `consents`.** Hoy el cliente envía
   `{accepted, version, timestamp, consents:{clinicalData, generativeAI, facialBiometrics}}`.
   Nadie ha confirmado que el servidor guarde las tres decisiones y no solo
   `accepted`. Si las descarta, el consentimiento granular es decorativo. **Esto
   es lo primero que hay que mirar**, y es trabajo de backend.
2. **Registro inmutable**, de solo-añadir: cada aceptación o retirada es una fila
   nueva, nunca un `UPDATE` sobre la anterior. Sin esto no hay historial, y sin
   historial no hay prueba de qué estaba vigente en una fecha dada.
3. **Guardar junto a la decisión** el hash del texto exacto que se mostró, no
   solo su número de versión. La versión dice «era la 2026-10-14»; el hash
   demuestra *qué decía* la 2026-10-14.
4. **Permitir retirar el consentimiento** desde Ajustes, con el mismo detalle con
   que se dio. Un consentimiento que no se puede retirar con la misma facilidad
   con que se dio no es válido en RGPD, y es razonable exigirlo en cualquier caso.
5. **Exportación de evidencia**: dado un paciente, devolver su historial completo
   de consentimientos en un formato legible por un humano. Es lo que se entrega
   si alguien reclama.
6. **Consentimiento en el embudo público.** `/agebot` y `/consulta` no tienen
   sesión, así que hoy no registran nada. Si ahí se captan datos —y se captan:
   `da_pending_leads`, `vx_lead_email`, `vx_lead_name`— hace falta una captura de
   consentimiento propia, anclada a algo distinto del id de paciente.

### Sprint L2 — Términos y condiciones, y política de privacidad

7. **Dos pantallas de texto legal versionado**, accesibles **antes** de aceptar
   (hoy el modal pide aceptar un texto que no se puede leer entero) y después
   desde Ajustes. El texto vive en el repositorio con su versión, no incrustado
   en un componente.
8. **La política de privacidad tiene que nombrar a los terceros reales.** Del
   inventario de hoy:
   - **Sentry** (`https://*.ingest.sentry.io`) — y aquí hay un problema abierto:
     `Sentry.replayIntegration()` está activo en `src/index.tsx`. La grabación de
     sesión de una app médica captura la pantalla del paciente, es decir, datos
     clínicos. **Necesita enmascarado antes del piloto, o apagarse.**
   - **Google Fonts** (`fonts.googleapis.com`, `fonts.gstatic.com`) — transfiere
     la IP del paciente a Google en cada carga. Se evita alojando las fuentes.
   - **FingerprintJS** — huella del dispositivo, usada como material de clave en
     `cryptoService.ts`. Es seguridad, no publicidad, y conviene que la política
     lo diga así de claro.
   - **Stripe** — ver sprint L4.
   - El backend propio (`doctor-antivejez-web.onrender.com`) y su alojamiento.
9. **Declarar los plazos de conservación** y el procedimiento de borrado. Hoy el
   `logout` conserva deliberadamente la cola offline sin sincronizar para no
   destruir registros clínicos; eso es correcto y hay que contarlo.
10. **Sanear `logger.audit`**: queda pendiente del informe anterior comprobar que
    no escribe datos personales en los registros.

### Sprint L3 — Almacenamiento local (la mal llamada «política de cookies»)

**Hallazgo: la app no escribe ni una sola cookie.** No hay un solo
`document.cookie` ni `withCredentials` en todo `src/`. Un banner de cookies
genérico sería a la vez falso y inútil.

Lo que sí hay son **~25 claves de `localStorage` y una base IndexedDB**:

- `auth-storage`, `auth_token`, `refresh_token`, `rejuvenate_session_v1`
- `profile-storage`, `rejuvenate_profile_v1`, `rejuvenate_protocol_cache`
- `da_consentimiento_v2`, `da_onboarding_slim_v1`, `ui-storage`
- `da_streak_v1`, `da_meal_notes_v1`, `rejuvenate_favorite_foods`, `da_item_${i}`
- `da_agebot_result`, `da_test_progress`, `da_result_source`, `da_funnel_conversion`
- `da_pending_leads`, `vx_lead_email`, `vx_lead_name`, `vx_test_result`, `vx_booking_data`
- `vytalix-funnel-v2`, `notifications_enabled`
- IndexedDB `rejuvenate-offline-queue` / `pending-writes`

11. **Inventario mantenido** de cada clave: qué guarda, por qué, cuánto dura, si
    es imprescindible para que el servicio funcione. Con una prueba que falle si
    alguien añade una clave sin declararla — es la única forma de que el
    inventario no envejezca.
12. **Escribir la política sobre ese inventario**, no sobre una plantilla de
    cookies copiada de otro sitio.
13. **Pedir consentimiento solo para lo que no es imprescindible.** Las claves de
    sesión, consentimiento y perfil clínico son necesarias para prestar el
    servicio. Las del embudo público (`da_funnel_conversion`, `vx_lead_*`) son
    otra cosa y conviene tratarlas aparte.

### Sprint L4 — Política de reembolso, y el estado real del cobro

14. **Hallazgo, verificado en navegador con la CSP de producción: el cobro con
    Stripe no puede funcionar hoy.** `ConsultaExploratoriaPage.tsx` carga Stripe
    Elements, pero la CSP de `public/_headers` declara `script-src 'self'` sin
    `js.stripe.com`. El navegador responde:

    ```
    Refused to load the script 'https://js.stripe.com/v3' because it violates
    the following Content Security Policy directive: "script-src 'self'"
    ```

    La petición falla con motivo `csp` y **se montan cero iframes de Stripe**.
    Además `Permissions-Policy: payment=()` desactiva la Payment Request API, y
    ni `frame-src` ni `connect-src` contemplan a Stripe. La oferta actual de
    `/consulta` dice «Sin costo», así que no hay nadie afectado hoy; pero el día
    que se quiera cobrar, no se cobrará. **No lo he tocado**: modificar la CSP
    estaba fuera del encargo, y abrirla es una decisión de seguridad que merece
    su propio ADR.

15. **Decidir qué se vende** antes de redactar nada: consultas, suscripción,
    productos de la Tienda. El plazo de reembolso, las excepciones y quién lo
    autoriza dependen de eso.
16. **Mostrar la política en el punto de pago**, no enterrada en los términos, y
    registrar su aceptación con el mismo mecanismo del sprint L1.
17. **Dejar rastro de cada reembolso**: quién lo pidió, quién lo aprobó, cuándo.
    Es el mismo patrón de registro auditable que los «números de control» que
    quedaron pendientes de especificar.

### Sprint L5 — Derechos sobre los elementos

18. **Fotografías del equipo médico.** `public/equipo_med/` contiene retratos
    identificables: `Dra_ZuraidaR.png`, `Dra_SaraiMedina.png`, `Dr_Juan_Mendez.png`.
    Hacen falta dos cosas distintas que suelen confundirse: la **licencia del
    fotógrafo** y la **autorización de uso de imagen de cada persona retratada**.
    Conviene archivarlas antes del piloto.
19. **Marca y logotipos** (`logo.png`, `logoadn.jpeg`, `isotipo-claro.png`,
    `Logo_azul_oscuro.png`, iconos PWA): confirmar titularidad y registro de
    «Doctor Antivejez» y «Vytalix», y dejar la nota de copyright coherente en
    toda la app.
20. **Dependencias de terceros**: generar y versionar un fichero de licencias.
    Las que importan por obligación de atribución incluyen `lucide-react`,
    `@vladmandic/face-api` y sus pesos de modelo, `framer-motion`, `recharts`,
    `react` y el resto del árbol. Es un `npm` y un commit, pero nadie lo ha hecho.
21. **Tipografías**: si se alojan localmente (sprint L2), verificar que la
    licencia lo permite.
22. **Contenido clínico propio** (las 4R, las 5A, los textos de la guía): dejar
    constancia de que es material de la clínica y bajo qué condiciones aparece.

## Decisiones que necesito de vosotros

1. **Jurisdicción aplicable.** Bloquea la redacción de L2 y L3.
2. **Qué se cobra y cuándo** (L4). Hoy nada.
3. **Sentry Replay: enmascarar o apagar.** Es la exposición más directa de datos
   clínicos que hay abierta ahora mismo.
4. **Si se abre la CSP a Stripe**, o si el cobro se mueve fuera de la PWA.

## Orden sugerido

L1 antes que nada: es barato, es el cimiento de los otros cinco y hoy hay
aceptaciones entrando al sistema sin que nadie haya confirmado que se guardan
enteras. Después L2 y L3 juntos, que comparten la pantalla de textos legales
versionados. L4 cuando haya algo que cobrar. L5 puede ir en paralelo desde el
primer día: no depende de código, depende de archivar papeles.
