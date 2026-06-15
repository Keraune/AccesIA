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
  background: '#F6F8FB',
  backgroundAlt: '#EDF6F6',
  surface: '#FFFFFF',
  surfaceElevated: '#F2F6F8',
  surfaceGlass: 'rgba(255, 255, 255, 0.88)',
  primary: '#103B46',
  primarySoft: '#DDF3F0',
  primaryDeep: '#071D26',
  accent: '#F59E0B',
  accentSoft: '#FFF2CC',
  secondary: '#0EA5A4',
  secondarySoft: '#D8F7F5',
  text: '#0B1220',
  textMuted: '#4B5F6C',
  textSubtle: '#73828D',
  border: '#DBE6EA',
  borderStrong: '#B9CBD2',
  success: '#138A52',
  successSoft: '#DDF8E9',
  warning: '#B45309',
  warningSoft: '#FEF3C7',
  danger: '#C24135',
  dangerSoft: '#FDE2DF',
  white: '#FFFFFF',
  black: '#000000',
  shadow: 'rgba(7, 29, 38, 0.14)',
  overlay: 'rgba(11, 18, 32, 0.58)',
};

export const highContrastColors: AppColorScheme = {
  background: '#050607',
  backgroundAlt: '#0B0D10',
  surface: '#101316',
  surfaceElevated: '#1A1F24',
  surfaceGlass: 'rgba(16, 19, 22, 0.95)',
  primary: '#FFFFFF',
  primarySoft: '#262B31',
  primaryDeep: '#000000',
  accent: '#FFD166',
  accentSoft: '#40340E',
  secondary: '#7DD3FC',
  secondarySoft: '#0D3140',
  text: '#FFFFFF',
  textMuted: '#E6EDF3',
  textSubtle: '#CBD5E1',
  border: '#EEF2F6',
  borderStrong: '#FFFFFF',
  success: '#86EFAC',
  successSoft: '#123A22',
  warning: '#FDE68A',
  warningSoft: '#3E3109',
  danger: '#FCA5A5',
  dangerSoft: '#3F1616',
  white: '#FFFFFF',
  black: '#000000',
  shadow: 'rgba(255, 209, 102, 0.18)',
  overlay: 'rgba(0, 0, 0, 0.82)',
};
