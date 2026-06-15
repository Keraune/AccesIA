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
  background: '#F8FAFC',
  backgroundAlt: '#EEF4FF',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  surfaceGlass: 'rgba(255, 255, 255, 0.92)',
  primary: '#2563EB',
  primarySoft: '#DBEAFE',
  primaryDeep: '#080F1F',
  accent: '#7C3AED',
  accentSoft: '#EDE9FE',
  secondary: '#06B6D4',
  secondarySoft: '#CFFAFE',
  text: '#0F172A',
  textMuted: '#475569',
  textSubtle: '#64748B',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  success: '#16A34A',
  successSoft: '#DCFCE7',
  warning: '#D97706',
  warningSoft: '#FEF3C7',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  white: '#FFFFFF',
  black: '#000000',
  shadow: 'rgba(15, 23, 42, 0.16)',
  overlay: 'rgba(15, 23, 42, 0.68)',
};

export const highContrastColors: AppColorScheme = {
  background: '#020617',
  backgroundAlt: '#0F172A',
  surface: '#111827',
  surfaceElevated: '#1F2937',
  surfaceGlass: 'rgba(17, 24, 39, 0.96)',
  primary: '#93C5FD',
  primarySoft: '#172554',
  primaryDeep: '#000000',
  accent: '#FDE047',
  accentSoft: '#423A0B',
  secondary: '#67E8F9',
  secondarySoft: '#083344',
  text: '#FFFFFF',
  textMuted: '#E2E8F0',
  textSubtle: '#CBD5E1',
  border: '#F8FAFC',
  borderStrong: '#FFFFFF',
  success: '#86EFAC',
  successSoft: '#14532D',
  warning: '#FDE68A',
  warningSoft: '#422006',
  danger: '#FCA5A5',
  dangerSoft: '#450A0A',
  white: '#FFFFFF',
  black: '#000000',
  shadow: 'rgba(253, 224, 71, 0.2)',
  overlay: 'rgba(0, 0, 0, 0.86)',
};
