export type AppColorScheme = {
  background: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
  white: string;
  shadow: string;
};

export const lightColors: AppColorScheme = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  primary: '#134E4A',
  primarySoft: '#D9F0EE',
  accent: '#D97706',
  accentSoft: '#FEF3C7',
  text: '#0F172A',
  textMuted: '#475569',
  border: '#CBD5E1',
  success: '#15803D',
  warning: '#B45309',
  danger: '#B91C1C',
  white: '#FFFFFF',
  shadow: 'rgba(15, 23, 42, 0.12)',
};

export const highContrastColors: AppColorScheme = {
  background: '#050505',
  surface: '#111111',
  surfaceElevated: '#1F1F1F',
  primary: '#F8FAFC',
  primarySoft: '#2A2A2A',
  accent: '#FACC15',
  accentSoft: '#3A3004',
  text: '#FFFFFF',
  textMuted: '#E5E7EB',
  border: '#F8FAFC',
  success: '#86EFAC',
  warning: '#FDE68A',
  danger: '#FCA5A5',
  white: '#FFFFFF',
  shadow: 'rgba(250, 204, 21, 0.16)',
};
