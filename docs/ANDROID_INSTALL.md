# Instalación Android para pruebas internas

AccesIA usa funciones sensibles de Android: micrófono, superposición sobre otras apps y servicio de accesibilidad. Para pruebas internas usa siempre una APK de release firmada, no una APK debug.

## APK recomendada con EAS

```bash
npm install
npx expo prebuild --platform android --clean
eas build --platform android --profile preview
```

Descarga el APK generado por EAS e instálalo desde el navegador o gestor de archivos autorizado.

## APK local de release

```bash
npm install
npx expo prebuild --platform android --clean
cd android
./gradlew assembleRelease
```

El APK queda en:

```text
android/app/build/outputs/apk/release/app-release.apk
```

## Permitir instalación manual

```text
Ajustes → Seguridad y privacidad → Instalar apps desconocidas → Permitir desde el navegador o gestor de archivos
```

## Activar funciones después de instalar

```text
Ajustes → Accesibilidad → AccesIA → Activar
AccesIA → Subtítulos → Dar permiso de superposición
AccesIA → Voz → Permitir micrófono
```

## Notas de seguridad

- No se solicita acceso de almacenamiento externo.
- El servicio de accesibilidad no pide lectura de contenido de ventanas.
- El servicio de accesibilidad se usa para acciones globales solicitadas por el usuario: Inicio, Atrás, Recientes, Notificaciones y Ajustes rápidos.
- Para distribución real, usa AAB de producción y revisión de Google Play.
