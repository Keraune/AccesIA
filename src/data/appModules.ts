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
  status: 'Disponible' | 'Personalizable' | 'Esencial';
  accessibilityHint: string;
};

export const appModules: AppModule[] = [
  {
    route: '/lectura',
    label: 'Lectura accesible',
    shortLabel: 'Lectura',
    description: 'Escucha textos, regula la velocidad de lectura y adapta el tamaño de letra.',
    icon: 'volume-high-outline',
    accent: 'primary',
    status: 'Disponible',
    accessibilityHint: 'Abre la lectura accesible para escuchar textos y ajustar la lectura.',
  },
  {
    route: '/asistente',
    label: 'Asistente por voz',
    shortLabel: 'Voz',
    description: 'Dicta una indicación, confirma lo entendido y recibe una respuesta clara.',
    icon: 'mic-outline',
    accent: 'secondary',
    status: 'Disponible',
    accessibilityHint: 'Abre el asistente por voz para dictar comandos y recibir respuestas.',
  },
  {
    route: '/subtitulos',
    label: 'Subtítulos y multimedia',
    shortLabel: 'Subtítulos',
    description: 'Visualiza subtítulos, descripciones de contenido y controles de reproducción accesibles.',
    icon: 'chatbubbles-outline',
    accent: 'accent',
    status: 'Disponible',
    accessibilityHint: 'Abre el módulo multimedia con subtítulos y descripciones accesibles.',
  },
  {
    route: '/configuracion',
    label: 'Ajustes de accesibilidad',
    shortLabel: 'Ajustes',
    description: 'Configura contraste, letra, lector de pantalla, velocidad de voz y accesos rápidos.',
    icon: 'options-outline',
    accent: 'warning',
    status: 'Personalizable',
    accessibilityHint: 'Abre los ajustes de accesibilidad de AccesIA.',
  },
  {
    route: '/modo-simplificado',
    label: 'Modo simplificado',
    shortLabel: 'Simple',
    description: 'Usa una pantalla con cuatro acciones grandes para reducir distracciones.',
    icon: 'sparkles-outline',
    accent: 'success',
    status: 'Esencial',
    accessibilityHint: 'Abre el modo simplificado con acciones grandes y directas.',
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
    status: 'Disponible',
    accessibilityHint: 'Vuelve a la pantalla de inicio.',
  },
  appModules[0],
  appModules[1],
  appModules[2],
  appModules[3],
];
