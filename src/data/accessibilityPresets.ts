import type { AccessibilitySettings } from '@/context/AccessibilityContext';
import type { AppIconName, AppModule } from '@/data/appModules';

export type AccessibilityPreset = {
  id: string;
  title: string;
  description: string;
  icon: AppIconName;
  tone: AppModule['accent'];
  settings: Partial<AccessibilitySettings>;
};

export const accessibilityPresets: AccessibilityPreset[] = [
  {
    id: 'low-vision',
    title: 'Baja visión',
    description: 'Activa contraste fuerte, letra muy grande y lectura por voz más pausada.',
    icon: 'eye-outline',
    tone: 'primary',
    settings: {
      themeMode: 'highContrast',
      highContrast: true,
      fontScale: 'extraLarge',
      buttonSize: 'large',
      quickAccessEnabled: true,
      screenReaderSupportEnabled: true,
      readingSpeed: 0.75,
    },
  },
  {
    id: 'hearing-support',
    title: 'Apoyo auditivo',
    description: 'Prioriza subtítulos, alertas visuales y respuestas escritas.',
    icon: 'ear-outline',
    tone: 'accent',
    settings: {
      subtitlesEnabled: true,
      subtitlesAlwaysVisible: true,
      captionTheme: 'highContrast',
      captionPosition: 'bottom',
      quickAccessEnabled: true,
      screenReaderSupportEnabled: true,
    },
  },
  {
    id: 'motor-access',
    title: 'Acceso motor',
    description: 'Habilita comandos de voz y accesos rápidos para reducir toques.',
    icon: 'hand-left-outline',
    tone: 'secondary',
    settings: {
      voiceCommandsEnabled: true,
      quickAccessEnabled: true,
      buttonSize: 'large',
      autoStartBubble: true,
      fontScale: 'large',
    },
  },
  {
    id: 'cognitive-mode',
    title: 'Modo cognitivo',
    description: 'Simplifica la interfaz y muestra solo acciones esenciales.',
    icon: 'sparkles-outline',
    tone: 'success',
    settings: {
      simplifiedMode: true,
      reduceMotion: true,
      quickAccessEnabled: true,
      fontScale: 'large',
    },
  },
  {
    id: 'older-adult',
    title: 'Adulto mayor',
    description: 'Combina texto grande, menús directos, ayuda clara y lectura lenta.',
    icon: 'accessibility-outline',
    tone: 'warning',
    settings: {
      fontScale: 'extraLarge',
      buttonSize: 'large',
      readingSpeed: 0.75,
      quickAccessEnabled: true,
      screenReaderSupportEnabled: true,
    },
  },
];
