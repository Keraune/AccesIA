export type AppColorScheme = {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceElevated: string;
  surfaceGlass: string;
  primary: string;
  primarySoft: string;
  primaryDeep: string;
  accent: string;
  accentSoft: string;
  secondary: string;
  secondarySoft: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  border: string;
  borderStrong: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  white: string;
  black: string;
  shadow: string;
  overlay: string;
};

export const lightColors: AppColorScheme = {
  background: '#FFFFFF',
  backgroundAlt: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceElevated: '#F7F7F8',
  surfaceGlass: 'rgba(255, 255, 255, 0.96)',
  primary: '#181A20',
  primarySoft: '#FFF6D6',
  primaryDeep: '#0B0E11',
  accent: '#F0B90B',
  accentSoft: '#FFF3C4',
  secondary: '#1E2329',
  secondarySoft: '#EEF0F2',
  text: '#181A20',
  textMuted: '#474D57',
  textSubtle: '#707A8A',
  border: '#EAECEF',
  borderStrong: '#C8CCD3',
  success: '#0ECB81',
  successSoft: '#E7F9F1',
  warning: '#F0B90B',
  warningSoft: '#FFF3C4',
  danger: '#F6465D',
  dangerSoft: '#FEECEF',
  white: '#FFFFFF',
  black: '#000000',
  shadow: 'rgba(24, 26, 32, 0.12)',
  overlay: 'rgba(11, 14, 17, 0.7)',
};

export const darkColors: AppColorScheme = {
  background: '#0B0E11',
  backgroundAlt: '#11161C',
  surface: '#181A20',
  surfaceElevated: '#1E2329',
  surfaceGlass: 'rgba(24, 26, 32, 0.96)',
  primary: '#F0B90B',
  primarySoft: '#2B2608',
  primaryDeep: '#000000',
  accent: '#F0B90B',
  accentSoft: '#2B2608',
  secondary: '#FFFFFF',
  secondarySoft: '#202630',
  text: '#F5F5F5',
  textMuted: '#B7BDC6',
  textSubtle: '#848E9C',
  border: '#2B3139',
  borderStrong: '#5E6673',
  success: '#0ECB81',
  successSoft: '#063D29',
  warning: '#F0B90B',
  warningSoft: '#423A0B',
  danger: '#F6465D',
  dangerSoft: '#4A0710',
  white: '#FFFFFF',
  black: '#000000',
  shadow: 'rgba(0, 0, 0, 0.36)',
  overlay: 'rgba(0, 0, 0, 0.82)',
};

export const highContrastColors: AppColorScheme = {
  background: '#000000',
  backgroundAlt: '#0B0E11',
  surface: '#050505',
  surfaceElevated: '#111111',
  surfaceGlass: 'rgba(0, 0, 0, 0.96)',
  primary: '#FFFFFF',
  primarySoft: '#2B2608',
  primaryDeep: '#000000',
  accent: '#FDE047',
  accentSoft: '#423A0B',
  secondary: '#FFFFFF',
  secondarySoft: '#202630',
  text: '#FFFFFF',
  textMuted: '#F5F5F5',
  textSubtle: '#EAECEF',
  border: '#FFFFFF',
  borderStrong: '#FFFFFF',
  success: '#58F0A7',
  successSoft: '#063D29',
  warning: '#FDE047',
  warningSoft: '#423A0B',
  danger: '#FF7A8A',
  dangerSoft: '#4A0710',
  white: '#FFFFFF',
  black: '#000000',
  shadow: 'rgba(253, 224, 71, 0.25)',
  overlay: 'rgba(0, 0, 0, 0.9)',
};
