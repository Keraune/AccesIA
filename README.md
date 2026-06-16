# AccesIA

AccesIA es una aplicación móvil de asistencia accesible. Ayuda al usuario a leer contenido, escuchar textos, dictar acciones, activar una burbuja flotante de Android y adaptar la interfaz según necesidades visuales, auditivas, motoras o cognitivas.

## Funciones principales

- Lectura accesible de textos con síntesis de voz del dispositivo.
- Textos frecuentes guardados localmente.
- Selección de velocidad y voz disponible en el sistema.
- Asistente por voz con reconocimiento nativo Android y entrada manual alternativa.
- Subtítulos flotantes mediante burbuja de Android.
- Configuración de letra, contraste, tamaño de subtítulos y tema visual.
- Perfil local con nombre, correo, foto y preferencia de uso.
- Modo simplificado con acciones grandes y directas.

## Burbuja flotante Android

La burbuja usa el permiso **Mostrar sobre otras apps** (`SYSTEM_ALERT_WINDOW`). Al activarla, AccesIA inicia una burbuja arrastrable que puede permanecer visible al salir de la aplicación. Al tocarla se despliega un panel con acciones rápidas.

Acciones del panel:

```text
Subtítulos
Pausar o reanudar
Tamaño
Estilo
Lectura
Cerrar
```

Ruta dentro de la app:

```text
Subtítulos → Dar permiso → Activar burbuja
```

## Voz y dictado

El módulo de voz permite iniciar y detener la escucha manualmente. En Android se agregó un módulo nativo basado en `SpeechRecognizer`, por lo que ya no depende del reconocimiento de voz del navegador. Las acciones reconocidas se configuran desde `src/data/voiceActions.ts`.

Acciones incluidas:

```text
activar subtítulos
pausar subtítulos
detener subtítulos
aumentar letra
abrir lectura
abrir ajustes
activar alto contraste
abrir modo simple
```

El dispositivo debe tener activo un servicio de reconocimiento de voz compatible y permiso de micrófono.

## Lectura accesible

El módulo de lectura permite:

- escribir o pegar texto
- reproducir, pausar, reanudar y detener
- cambiar velocidad
- seleccionar una voz disponible
- guardar textos frecuentes
- cargar o eliminar textos guardados
- limpiar el editor

En Android los textos guardados se almacenan en `SharedPreferences` mediante el módulo nativo `AccesiaStorage`.

## Importante sobre subtítulos de audio interno

La pantalla y la burbuja preparan el flujo de subtítulos. La captura real del audio interno del dispositivo requiere integración adicional con MediaProjection y AudioPlaybackCapture. Android exige consentimiento del usuario y algunas aplicaciones pueden bloquear que su audio sea capturado.

## Ejecutar en desarrollo

```bash
npm install
npx expo prebuild --platform android --clean
npx expo run:android
```

## Generar APK para Android

```bash
eas build --platform android --profile preview
```

Para instalar manualmente, descarga el APK generado por EAS e instálalo en el dispositivo Android.
