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
  status: 'Activo' | 'Personalizable' | 'Rápido';
  accessibilityHint: string;
};

export const appModules: AppModule[] = [
  {
    route: '/lectura',
    label: 'Lectura inteligente',
    shortLabel: 'Lectura',
    description: 'Pega o revisa un texto, escúchalo en voz alta, controla velocidad, pausa y tamaño de letra.',
    icon: 'volume-high-outline',
    accent: 'primary',
    status: 'Activo',
    accessibilityHint: 'Abre lectura inteligente para escuchar textos y ajustar la lectura.',
  },
  {
    route: '/asistente',
    label: 'Asistente por voz',
    shortLabel: 'Voz',
    description: 'Dicta una acción, confirma lo entendido y recibe una respuesta visible y hablada.',
    icon: 'mic-outline',
    accent: 'secondary',
    status: 'Activo',
    accessibilityHint: 'Abre el asistente por voz para dictar comandos y recibir respuestas.',
  },
  {
    route: '/subtitulos',
    label: 'Subtítulos flotantes',
    shortLabel: 'Subtítulos',
    description: 'Activa una ventana flotante que muestra subtítulos sobre videos, clases, música o audio cercano.',
    icon: 'chatbox-ellipses-outline',
    accent: 'accent',
    status: 'Rápido',
    accessibilityHint: 'Abre subtítulos flotantes para contenido con audio.',
  },
  {
    route: '/configuracion',
    label: 'Ajustes accesibles',
    shortLabel: 'Ajustes',
    description: 'Configura contraste, letra, lector de pantalla, velocidad de voz, perfiles y accesos rápidos.',
    icon: 'options-outline',
    accent: 'warning',
    status: 'Personalizable',
    accessibilityHint: 'Abre los ajustes de accesibilidad de AccesIA.',
  },
  {
    route: '/modo-simplificado',
    label: 'Modo simple',
    shortLabel: 'Simple',
    description: 'Reduce distracciones y deja cuatro acciones grandes: escuchar, hablar, subtitular y pedir ayuda.',
    icon: 'sparkles-outline',
    accent: 'success',
    status: 'Rápido',
    accessibilityHint: 'Abre el modo simple con acciones grandes y directas.',
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
    status: 'Activo',
    accessibilityHint: 'Vuelve a la pantalla de inicio.',
  },
  appModules[0],
  appModules[1],
  appModules[2],
  appModules[3],
];
