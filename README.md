# AccesIA

AccesIA es una aplicación móvil de asistencia accesible para Android. Su objetivo es ayudar al usuario a leer, escuchar, subtitular contenido, usar comandos de voz y acceder rápidamente a funciones del dispositivo.

## Enfoque del producto

AccesIA combina React Native, Expo y módulos nativos Android. La aplicación está pensada como una herramienta de accesibilidad real: prepara permisos, servicios nativos, burbuja flotante, comandos de voz y accesos a ajustes oficiales del sistema para adaptar el dispositivo de forma segura.

## Funciones principales

- Burbuja flotante de Android con controles rápidos.
- Subtítulos flotantes con estilos tipo video: oscuro, claro, alto contraste y compacto.
- Configuración avanzada de subtítulos: posición, tamaño, idioma, estilo y opción de mantenerlos siempre visibles.
- Lectura accesible con escritura, pegado de texto, pausa, reanudación, velocidad, voces y textos frecuentes.
- Reconocimiento de voz nativo Android mediante `SpeechRecognizer`.
- Comandos para abrir apps instaladas, por ejemplo: `abrir YouTube`, `abrir WhatsApp`, `abrir Chrome`.
- Servicio de accesibilidad para acciones globales como Inicio, Atrás, Recientes, Notificaciones y Ajustes rápidos.
- Accesos a ajustes Android para tamaño de letra, pantalla, subtítulos del sistema y accesibilidad.
- Ajustes visuales internos: tema claro, oscuro, alto contraste, tamaño de letra, estilo tipográfico, tamaño de botones y reducción de movimiento.
- Interfaz inspirada en aplicaciones financieras modernas: listas limpias, acciones directas, menos bloques cuadrados y mejor jerarquía visual.

## Configuración avanzada

Desde **Ajustes** puedes modificar:

```text
Tema claro / oscuro / alto contraste
Tamaño de letra de AccesIA
Estilo tipográfico
Tamaño de botones
Reducir movimiento
Subtítulos siempre visibles
Burbuja al abrir la app
Posición de subtítulos
Tamaño y estilo de subtítulos
Velocidad de lectura
Compatibilidad con lectores de pantalla
```

Las preferencias se guardan localmente. En Android nativo se usan `SharedPreferences` mediante el módulo `AccesiaStorage`.

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

## Instalación y Play Protect

Play Protect puede mostrar advertencias cuando instalas manualmente una APK que no viene de Google Play, especialmente si la app usa permisos sensibles como superposición, micrófono o servicio de accesibilidad. AccesIA no solicita permisos de almacenamiento externo y el servicio de accesibilidad está configurado para acciones globales solicitadas por el usuario, sin leer el contenido de otras ventanas.

Para pruebas internas se recomienda compilar una APK de release firmada:

```bash
npm install
npx expo prebuild --platform android --clean
eas build --platform android --profile preview
```

Si compilas localmente:

```bash
cd android
./gradlew assembleRelease
```

Instala el APK desde una fuente permitida por Android:

```text
Ajustes → Seguridad y privacidad → Instalar apps desconocidas → Permitir para tu gestor de archivos o navegador
```

No uses una APK debug para validar con usuarios finales. Para distribución real, genera un AAB de producción y súbelo a Google Play para que pase revisión y firma oficial.
