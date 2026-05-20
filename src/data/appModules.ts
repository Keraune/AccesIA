export type AppRoute =
  | '/'
  | '/lectura'
  | '/asistente'
  | '/subtitulos'
  | '/configuracion'
  | '/modo-simplificado';

export type AppModule = {
  route: AppRoute;
  label: string;
  shortLabel: string;
  description: string;
  symbol: string;
  accessibilityHint: string;
};

export const appModules: AppModule[] = [
  {
    route: '/lectura',
    label: 'Lectura de información',
    shortLabel: 'Lectura',
    description: 'Escucha textos, aumenta la letra y cambia el contraste.',
    symbol: 'LE',
    accessibilityHint: 'Abre el módulo de lectura de información.',
  },
  {
    route: '/asistente',
    label: 'Asistente de voz',
    shortLabel: 'Voz',
    description: 'Simula comandos hablados y respuestas accesibles.',
    symbol: 'VO',
    accessibilityHint: 'Abre el módulo de asistente de voz.',
  },
  {
    route: '/subtitulos',
    label: 'Subtítulos automáticos',
    shortLabel: 'Subtítulos',
    description: 'Muestra subtítulos y alertas visuales para contenido con audio.',
    symbol: 'ST',
    accessibilityHint: 'Abre el módulo de subtítulos automáticos.',
  },
  {
    route: '/configuracion',
    label: 'Configuración de accesibilidad',
    shortLabel: 'Ajustes',
    description: 'Personaliza contraste, tamaño de letra, subtítulos y modo simple.',
    symbol: 'CF',
    accessibilityHint: 'Abre la configuración de accesibilidad.',
  },
  {
    route: '/modo-simplificado',
    label: 'Modo simplificado',
    shortLabel: 'Simple',
    description: 'Reduce opciones y muestra acciones esenciales.',
    symbol: 'MS',
    accessibilityHint: 'Abre el modo cognitivo simplificado.',
  },
];

export const bottomMenuModules: AppModule[] = [
  {
    route: '/',
    label: 'Inicio',
    shortLabel: 'Inicio',
    description: 'Volver a la pantalla principal.',
    symbol: 'IN',
    accessibilityHint: 'Vuelve a la pantalla de inicio.',
  },
  appModules[0],
  appModules[1],
  appModules[2],
  appModules[3],
];
