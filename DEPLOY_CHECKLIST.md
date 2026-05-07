# Doctor Antivejez PWA — Checklist Pre-Demo Stakeholders
## Estado: 2026-03-22

### Icono PWA
- [x] icon-192.png existe en /public y en /dist
- [x] icon-512.png existe en /public y en /dist
- [x] manifest.webmanifest tiene 4 entries de icon (any + maskable × 2)
- [x] index.html tiene apple-touch-icon meta tags

### Flujo Público (Funnel)
- [x] /longevidad carga correctamente sin login
- [x] Test 45 preguntas — las 5 grupos funcionan
- [x] Botón volver funciona en /test
- [x] Modal de confirmación aparece al volver con progreso
- [x] AgeBot Facial — botón volver funciona
- [x] /resultado muestra gauge y dimensiones
- [x] Lead capture form en /resultado funciona
- [x] /consulta tipo=basica muestra formulario correcto
- [x] /consulta tipo=profunda muestra formulario + pago simulado
- [x] Pantalla de confirmación muestra botón WhatsApp

### Red Médica
- [x] /medicos carga con los 5 perfiles
- [x] Filtro por país funciona
- [x] Médicos placeholder muestran badge "Próximamente"
- [x] Dr. Méndez tiene badge "Fundador"
- [x] Botón "Agendar" redirige a /consulta con doctorId correcto

### Narrativa de Tiers
- [x] "Programa de Optimización" reemplaza "Consulta Básica"
- [x] "Acompañamiento Médico" reemplaza "Consulta Profunda"
- [x] Cero menciones a "Consulta Virtual Básica" en código
- [x] Cero menciones a "Longevity VIP" en páginas públicas

### Anti-Churn
- [x] PulsoMatinoCard aparece en HomePage tab Mi Guía
- [x] BioStreakWidget muestra racha correctamente
- [x] OnboardingSlim se activa para leads del funnel
- [x] BioStreak se registra correctamente en localStorage

### Build
- [x] npm run build sin errores TypeScript
- [x] npm run build completa en < 30 segundos (Completado en ~11s)
- [!] No hay warnings de chunk size > 500kb

***

## Reporte de Anomalías [!]

- **Chunk Size Warning:** Durante el proceso de build, Vite emite una alerta indicando que `index-[hash].js` supera los 500kB (específicamente alrededor de ~701kB minificado, aunque ~213kB comprimido por gzip). Esto no impide que la aplicación funcione y se debe primordialmente a los grandes imports empaquetados juntos (React, framer-motion, lucide-react y pdfmake). 
**Recomendación:** Para futuras optimizaciones, se podría implementar `manualChunks` en Vite para separar dependencias pesadas como el generador de PDF.
