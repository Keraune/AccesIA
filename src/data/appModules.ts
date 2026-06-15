import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export type AppRoute =
  | '/'
  | '/lectura'
  | '/asistente'
  | '/subtitulos'
  | '/configuracion'
  | '/modo-simplificado';

export type AppIconName = ComponentProps<typeof Ionicons>['name'];

export type AppModule = {
  route: AppRoute;
  label: string;
  shortLabel: string;
  description: string;
  icon: AppIconName;
  accent: 'primary' | 'secondary' | 'accent' | 'success' | 'warning';
  status: 'Implementado' | 'Simulado' | 'Base lista';
  accessibilityHint: string;
};

export const appModules: AppModule[] = [
  {
    route: '/lectura',
    label: 'Lectura inteligente',
    shortLabel: 'Lectura',
    description: 'Escucha textos, aumenta la letra y cambia el contraste sin perder el contexto.',
    icon: 'book-outline',
    accent: 'primary',
    status: 'Implementado',
    accessibilityHint: 'Abre el módulo de lectura de información.',
  },
  {
    route: '/asistente',
    label: 'Asistente de voz',
    shortLabel: 'Voz',
    description: 'Reconoce o simula comandos hablados con confirmación visual y auditiva.',
    icon: 'mic-outline',
    accent: 'secondary',
    status: 'Implementado',
    accessibilityHint: 'Abre el módulo de asistente de voz.',
  },
  {
    route: '/subtitulos',
    label: 'Subtítulos automáticos',
    shortLabel: 'Subtítulos',
    description: 'Muestra subtítulos grandes, descripciones y controles accesibles para contenido con audio.',
    icon: 'chatbubbles-outline',
    accent: 'accent',
    status: 'Implementado',
    accessibilityHint: 'Abre el módulo de subtítulos automáticos.',
  },
  {
    route: '/configuracion',
    label: 'Accesibilidad',
    shortLabel: 'Ajustes',
    description: 'Personaliza contraste, letra, subtítulos, comandos y lector de pantalla.',
    icon: 'options-outline',
    accent: 'warning',
    status: 'Implementado',
    accessibilityHint: 'Abre la configuración de accesibilidad.',
  },
  {
    route: '/modo-simplificado',
    label: 'Modo simplificado',
    shortLabel: 'Simple',
    description: 'Reduce opciones y muestra cuatro acciones esenciales con botones grandes.',
    icon: 'sparkles-outline',
    accent: 'success',
    status: 'Implementado',
    accessibilityHint: 'Abre el modo cognitivo simplificado.',
  },
];

export const bottomMenuModules: AppModule[] = [
  {
    route: '/',
    label: 'Inicio',
    shortLabel: 'Inicio',
    description: 'Volver a la pantalla principal.',
    icon: 'home-outline',
    accent: 'primary',
    status: 'Implementado',
    accessibilityHint: 'Vuelve a la pantalla de inicio.',
  },
  appModules[0],
  appModules[1],
  appModules[2],
  appModules[3],
];
