# AccesIA

AccesIA es una aplicación móvil de asistencia accesible. Su objetivo principal es ayudar al usuario a leer contenido, dictar acciones, activar subtítulos visibles y adaptar la interfaz según sus necesidades visuales, auditivas, motoras o cognitivas.

## Funciones principales

- Lectura accesible de textos con síntesis de voz.
- Asistente por voz para dictar acciones y recibir confirmación.
- Subtítulos flotantes mediante burbuja de Android.
- Burbuja flotante de Android para mostrar AccesIA sobre otras aplicaciones.
- Configuración de letra, contraste, tamaño de subtítulos y tema visual.
- Perfil local con nombre, correo, foto y preferencia de uso.
- Modo simplificado con acciones grandes y directas.

## Burbuja flotante Android

La función tipo burbuja usa el permiso de Android **Mostrar sobre otras apps** (`SYSTEM_ALERT_WINDOW`). Al activarla, AccesIA inicia una burbuja arrastrable que puede permanecer visible al salir de la aplicación. Al tocarla se despliega un panel con subtítulos y controles rápidos.

Ruta dentro de la app:

```text
Configuración → Burbuja flotante Android → Dar permiso → Activar burbuja
```

También puede abrirse desde:

```text
Subtítulos → Activar burbuja
Inicio → Abrir burbuja
```

## Voz y dictado

El módulo de voz permite iniciar y detener la escucha manualmente. Las acciones reconocidas se configuran desde `src/data/voiceActions.ts`, por lo que se pueden ampliar sin mezclar comandos dentro de la interfaz. La pantalla incluye selección de asistente, lectura de respuestas, entrada manual alternativa e historial local de comandos recientes.

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

## Importante sobre subtítulos de audio interno

La pantalla y la burbuja flotante preparan el flujo de subtítulos. La captura real del audio interno del dispositivo requiere integración nativa adicional con MediaProjection y AudioPlaybackCapture. Android exige consentimiento del usuario y algunas aplicaciones pueden bloquear que su audio sea capturado. Esta versión deja la experiencia, permisos base y arquitectura listos para continuar con esa integración.

## Ejecutar en web

```bash
npm install
npm run web
```

## Generar APK para Android

```bash
eas build --platform android --profile preview
```

Para instalar manualmente, descarga el APK generado por EAS e instálalo en el dispositivo Android.
