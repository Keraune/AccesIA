import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export type AppRoute =
  | '/'
  | '/lectura'
  | '/asistente'
  | '/subtitulos'
  | '/configuracion'
  | '/modo-simplificado'
  | '/perfil';

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
    route: '/subtitulos',
    label: 'Subtítulos flotantes',
    shortLabel: 'Subtítulos',
    description: 'Configura la burbuja de Android para mostrar subtítulos sobre otras aplicaciones.',
    icon: 'chatbox-ellipses-outline',
    accent: 'accent',
    status: 'Rápido',
    accessibilityHint: 'Abre la configuración de subtítulos flotantes y burbuja del sistema.',
  },
  {
    route: '/lectura',
    label: 'Lectura por voz',
    shortLabel: 'Lectura',
    description: 'Escribe o pega texto para escucharlo con el motor de voz del dispositivo.',
    icon: 'volume-high-outline',
    accent: 'primary',
    status: 'Activo',
    accessibilityHint: 'Abre lectura por voz para escuchar textos y ajustar el ritmo.',
  },
  {
    route: '/asistente',
    label: 'Dictado y comandos',
    shortLabel: 'Voz',
    description: 'Inicia y detén el dictado cuando lo necesites, con respuestas visibles y controladas.',
    icon: 'mic-outline',
    accent: 'secondary',
    status: 'Activo',
    accessibilityHint: 'Abre dictado y comandos por voz.',
  },
  {
    route: '/configuracion',
    label: 'Ajustes accesibles',
    shortLabel: 'Ajustes',
    description: 'Adapta contraste, tamaño de letra, velocidad de lectura, subtítulos y burbuja.',
    icon: 'options-outline',
    accent: 'warning',
    status: 'Personalizable',
    accessibilityHint: 'Abre los ajustes de accesibilidad de AccesIA.',
  },
  {
    route: '/modo-simplificado',
    label: 'Modo simple',
    shortLabel: 'Simple',
    description: 'Reduce opciones visibles y deja acciones grandes para lectura, voz y subtítulos.',
    icon: 'sparkles-outline',
    accent: 'success',
    status: 'Rápido',
    accessibilityHint: 'Abre el modo simple con acciones grandes y directas.',
  },
  {
    route: '/perfil',
    label: 'Perfil personal',
    shortLabel: 'Perfil',
    description: 'Configura tu nombre, correo, foto y preferencia principal de uso.',
    icon: 'person-circle-outline',
    accent: 'primary',
    status: 'Personalizable',
    accessibilityHint: 'Abre tu perfil de usuario en AccesIA.',
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
  appModules[2],
  appModules[1],
  appModules[3],
];
