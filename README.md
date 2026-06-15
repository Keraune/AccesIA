# AccesIA

AccesIA es una aplicación móvil de asistencia digital inclusiva. Su objetivo es ayudar al usuario a leer información, dictar acciones, comprender contenido con audio y adaptar la interfaz según sus necesidades visuales, auditivas, motoras o cognitivas.

## Qué ofrece la aplicación

- Lectura accesible de textos con síntesis de voz, pausa, reanudación y control de velocidad.
- Asistente por voz para dictar acciones y recibir confirmación visual y auditiva.
- Subtítulos flotantes activables desde cualquier pantalla para contenido con audio, videos, clases, música o conversaciones cercanas.
- Ajustes de accesibilidad: alto contraste, tamaño de letra, velocidad de lectura, modo simplificado, accesos rápidos y soporte para lectores de pantalla.
- Modo simplificado con acciones grandes y directas.

## Cómo se usa

AccesIA se usa principalmente como una aplicación abierta por el usuario cuando necesita apoyo. No depende de estar funcionando permanentemente en segundo plano. Para proteger privacidad y batería, las herramientas sensibles como micrófono y subtítulos se activan con una acción visible del usuario.

## Tecnología

- React Native
- Expo
- TypeScript
- Expo Router
- API de síntesis de voz disponible en web
- Propiedades de accesibilidad nativas de React Native

## Ejecutar el proyecto

```bash
npm install
npm run web
```

También puede ejecutarse con Expo:

```bash
npx expo start
```

## Estructura principal

```text
src/app
Pantallas principales de la aplicación.

src/components
Componentes reutilizables: botones, tarjetas, encabezados, navegación e interruptores.

src/context
Estado global de accesibilidad.

src/constants
Colores, tipografía y reglas de diseño.

src/services
Servicios de voz y reconocimiento cuando el entorno lo permite.
```
