# AccesIA

AccesIA es una aplicación móvil de asistencia accesible para Android. Su objetivo es ayudar al usuario a leer, escuchar, subtitular contenido, usar comandos de voz y acceder rápidamente a funciones del dispositivo.

## Enfoque del producto

AccesIA combina una app React Native/Expo con módulos nativos Android. La aplicación no intenta simular accesibilidad: prepara permisos reales, servicios nativos y accesos de sistema para que el usuario pueda controlar partes del dispositivo de forma segura.

## Funciones principales

- Burbuja flotante de Android con controles rápidos.
- Subtítulos flotantes con estilos tipo video: oscuro, claro, alto contraste y compacto.
- Lectura accesible con escritura, pegado de texto, pausa, reanudación, velocidad, voces y textos frecuentes.
- Reconocimiento de voz nativo Android mediante `SpeechRecognizer`.
- Comandos para abrir apps instaladas, por ejemplo: `abrir YouTube`, `abrir WhatsApp`, `abrir Chrome`.
- Servicio de accesibilidad para acciones globales como Inicio, Atrás, Recientes, Notificaciones y Ajustes rápidos.
- Accesos a ajustes Android para tamaño de letra, pantalla, subtítulos del sistema y accesibilidad.
- Tema visual más limpio, inspirado en interfaces financieras modernas: acciones directas, listas claras y menos bloques cuadrados.

## Permisos y servicios Android

AccesIA usa:

```text
SYSTEM_ALERT_WINDOW
RECORD_AUDIO
AccessibilityService
```

El permiso `SYSTEM_ALERT_WINDOW` permite mostrar la burbuja sobre otras aplicaciones. El permiso `RECORD_AUDIO` permite comandos por voz. El `AccessibilityService` debe ser activado manualmente por el usuario desde Ajustes de Android para ejecutar acciones globales.

Ruta recomendada:

```text
Ajustes → Accesibilidad → AccesIA → Activar
```

## Comandos de voz incluidos

```text
abrir YouTube
abrir WhatsApp
abrir Chrome
abrir cámara
activar subtítulos
pausar subtítulos
detener subtítulos
aumentar letra
abrir lectura
abrir ajustes
activar alto contraste
abrir modo simple
ir a inicio
atrás
abrir recientes
abrir notificaciones
abrir ajustes rápidos
abrir ajustes de pantalla
abrir subtítulos del sistema
activar servicio de accesibilidad
```

## Limitaciones técnicas reales

Android protege los ajustes globales del dispositivo. Una app normal no debe cambiar silenciosamente configuraciones del sistema como tamaño de letra global o contraste del sistema sin interacción del usuario. Por eso AccesIA abre las pantallas oficiales de Android cuando se requiere modificar esos valores. Las acciones globales sí pueden ejecutarse cuando el usuario activa el servicio de accesibilidad.

La captura real de audio interno para subtítulos requiere integración adicional con `MediaProjection` y `AudioPlaybackCapture`. Android exige consentimiento del usuario y algunas aplicaciones pueden bloquear la captura de su audio.

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
