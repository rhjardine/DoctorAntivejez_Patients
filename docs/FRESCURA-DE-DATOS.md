# Cuándo ve el paciente los cambios del médico

Documento para el equipo clínico. Explica, sin tecnicismos, en qué momento una
actualización hecha en la aplicación web del médico aparece en la PWA del
paciente, y en qué momento **no** aparece todavía.

## La regla, en una frase

La PWA guarda los datos del paciente durante **60 segundos** desde la última vez
que los pidió. Dentro de esa ventana muestra lo que ya tenía; pasada la ventana,
vuelve a preguntar al servidor.

## Qué significa en la práctica

| Situación | ¿Ve el cambio? |
|---|---|
| El paciente pulsa **recargar** (icono ⟳ de la cabecera) | **Sí, al instante** |
| El paciente **cierra la app y vuelve a abrirla**, y había pasado más de 1 minuto | **Sí** |
| El paciente **vuelve a entrar con sus credenciales** | **Sí, siempre** |
| El paciente navega por la app y había pasado más de 1 minuto | **Sí** |
| Cualquiera de los anteriores **dentro del primer minuto** | **No todavía** — verá la versión anterior hasta que pase el minuto |

## La indicación para el médico

Si acaba de modificar la guía y quiere comprobarla en el teléfono del paciente
en ese mismo acto, pídale que **pulse el botón de recargar** de la cabecera. Es
inmediato y no depende de ningún tiempo de espera.

Esperar un minuto y volver a entrar también funciona, pero el botón es el camino
directo.

## Por qué existe esa espera

El servidor de la historia clínica ha tenido caídas. Sin esta ventana, cada
pantalla que abre el paciente vuelve a pedir el expediente completo, y cuando el
servidor está sobrecargado eso lo empeora. Un minuto es el equilibrio: corta las
peticiones repetidas sin que una indicación clínica se quede esperando.

Antes eran **cinco minutos**, y además la espera sobrevivía al cierre de la app:
el paciente podía cerrarla, volver a abrirla y seguir viendo la guía anterior sin
que se emitiera una sola petición. Ese era el comportamiento que motivó este
cambio.

## Lo que este documento NO cubre

Si el paciente **vuelve a entrar con sus credenciales** y aun así no ve el
cambio, no es la espera de 60 segundos: en ese caso la PWA sí pregunta al
servidor y muestra lo que el servidor le responda. Si lo que llega es la versión
antigua, el problema está antes —en la propagación desde la aplicación web del
médico— y debe investigarse ahí, no en la PWA.
