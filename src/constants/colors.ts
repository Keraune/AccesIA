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

export const highContrastColors: AppColorScheme = {
  background: '#000000',
  backgroundAlt: '#0B0E11',
  surface: '#111111',
  surfaceElevated: '#1E2329',
  surfaceGlass: 'rgba(0, 0, 0, 0.96)',
  primary: '#FFFFFF',
  primarySoft: '#2B2608',
  primaryDeep: '#000000',
  accent: '#FDE047',
  accentSoft: '#423A0B',
  secondary: '#FFFFFF',
  secondarySoft: '#202630',
  text: '#FFFFFF',
  textMuted: '#EAECEF',
  textSubtle: '#C8CCD3',
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
  overlay: 'rgba(0, 0, 0, 0.88)',
};
