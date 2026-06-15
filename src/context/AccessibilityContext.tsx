import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';

import {
  AppColorScheme,
  highContrastColors,
  lightColors,
} from '@/constants/colors';

export type FontScaleMode = 'standard' | 'large' | 'extraLarge';
export type ReadingSpeedMode = 0.75 | 1 | 1.25 | 1.5;

export type AccessibilitySettings = {
  highContrast: boolean;
  simplifiedMode: boolean;
  subtitlesEnabled: boolean;
  voiceCommandsEnabled: boolean;
  quickAccessEnabled: boolean;
  screenReaderSupportEnabled: boolean;
  fontScale: FontScaleMode;
  readingSpeed: ReadingSpeedMode;
};

type AccessibilityContextValue = {
  settings: AccessibilitySettings;
  colors: AppColorScheme;
  fontMultiplier: number;
  activeSettingsCount: number;
  lastChangeLabel: string;
  setHighContrast: (enabled: boolean) => void;
  setSimplifiedMode: (enabled: boolean) => void;
  setSubtitlesEnabled: (enabled: boolean) => void;
  setVoiceCommandsEnabled: (enabled: boolean) => void;
  setQuickAccessEnabled: (enabled: boolean) => void;
  setScreenReaderSupportEnabled: (enabled: boolean) => void;
  setFontScale: (mode: FontScaleMode) => void;
  setReadingSpeed: (speed: ReadingSpeedMode) => void;
  increaseFontScale: () => void;
  decreaseFontScale: () => void;
  applySettings: (partialSettings: Partial<AccessibilitySettings>, label?: string) => void;
  resetSettings: () => void;
};

const storageKey = 'accesia-accessibility-settings';

const fontScaleMultipliers: Record<FontScaleMode, number> = {
  standard: 1,
  large: 1.15,
  extraLarge: 1.3,
};

const fontScaleOrder: FontScaleMode[] = ['standard', 'large', 'extraLarge'];

export const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  simplifiedMode: false,
  subtitlesEnabled: false,
  voiceCommandsEnabled: false,
  quickAccessEnabled: true,
  screenReaderSupportEnabled: true,
  fontScale: 'standard',
  readingSpeed: 1,
};

const settingLabels: Partial<Record<keyof AccessibilitySettings, string>> = {
  highContrast: 'alto contraste',
  simplifiedMode: 'modo simplificado',
  subtitlesEnabled: 'subtítulos automáticos',
  voiceCommandsEnabled: 'comandos de voz',
  quickAccessEnabled: 'accesos rápidos',
  screenReaderSupportEnabled: 'compatibilidad con lectores de pantalla',
  fontScale: 'tamaño de letra',
  readingSpeed: 'velocidad de lectura',
};

type StorageGlobal = typeof globalThis & {
  localStorage?: {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
  };
};

function getStorage() {
  if (Platform.OS !== 'web') return null;
  return (globalThis as StorageGlobal).localStorage ?? null;
}

function isFontScaleMode(value: unknown): value is FontScaleMode {
  return value === 'standard' || value === 'large' || value === 'extraLarge';
}

function isReadingSpeedMode(value: unknown): value is ReadingSpeedMode {
  return value === 0.75 || value === 1 || value === 1.25 || value === 1.5;
}

function normalizeSettings(rawSettings: Partial<AccessibilitySettings>) {
  return {
    ...defaultSettings,
    ...rawSettings,
    fontScale: isFontScaleMode(rawSettings.fontScale)
      ? rawSettings.fontScale
      : defaultSettings.fontScale,
    readingSpeed: isReadingSpeedMode(rawSettings.readingSpeed)
      ? rawSettings.readingSpeed
      : defaultSettings.readingSpeed,
  } satisfies AccessibilitySettings;
}

function loadInitialSettings() {
  const storage = getStorage();
  if (!storage) return defaultSettings;

  try {
    const savedSettings = storage.getItem(storageKey);
    if (!savedSettings) return defaultSettings;
    return normalizeSettings(JSON.parse(savedSettings) as Partial<AccessibilitySettings>);
  } catch {
    return defaultSettings;
  }
}

function getChangeLabel(partialSettings: Partial<AccessibilitySettings>) {
  const firstKey = Object.keys(partialSettings)[0] as keyof AccessibilitySettings | undefined;
  return firstKey ? `Se actualizó ${settingLabels[firstKey] ?? 'una preferencia'}.` : 'Preferencias actualizadas.';
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null,
);

export function AccessibilityProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<AccessibilitySettings>(loadInitialSettings);
  const [lastChangeLabel, setLastChangeLabel] = useState('Configuración lista para personalizar la experiencia.');

  useEffect(() => {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(storageKey, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback(
    (partialSettings: Partial<AccessibilitySettings>, label?: string) => {
      setSettings((current) => normalizeSettings({
        ...current,
        ...partialSettings,
      }));
      setLastChangeLabel(label ?? getChangeLabel(partialSettings));
    },
    [],
  );

  const value = useMemo<AccessibilityContextValue>(() => {
    const fontMultiplier = fontScaleMultipliers[settings.fontScale];
    const currentFontIndex = fontScaleOrder.indexOf(settings.fontScale);
    const activeSettingsCount = [
      settings.highContrast,
      settings.simplifiedMode,
      settings.subtitlesEnabled,
      settings.voiceCommandsEnabled,
      settings.quickAccessEnabled,
      settings.screenReaderSupportEnabled,
    ].filter(Boolean).length;

    return {
      settings,
      colors: settings.highContrast ? highContrastColors : lightColors,
      fontMultiplier,
      activeSettingsCount,
      lastChangeLabel,
      setHighContrast: (enabled) => updateSettings({ highContrast: enabled }),
      setSimplifiedMode: (enabled) => updateSettings({ simplifiedMode: enabled }),
      setSubtitlesEnabled: (enabled) => updateSettings({ subtitlesEnabled: enabled }),
      setVoiceCommandsEnabled: (enabled) => updateSettings({ voiceCommandsEnabled: enabled }),
      setQuickAccessEnabled: (enabled) => updateSettings({ quickAccessEnabled: enabled }),
      setScreenReaderSupportEnabled: (enabled) => updateSettings({ screenReaderSupportEnabled: enabled }),
      setFontScale: (mode) => updateSettings({ fontScale: mode }),
      setReadingSpeed: (speed) => updateSettings({ readingSpeed: speed }),
      increaseFontScale: () => {
        const nextIndex = Math.min(currentFontIndex + 1, fontScaleOrder.length - 1);
        updateSettings({ fontScale: fontScaleOrder[nextIndex] }, 'Se aumentó el tamaño de letra.');
      },
      decreaseFontScale: () => {
        const nextIndex = Math.max(currentFontIndex - 1, 0);
        updateSettings({ fontScale: fontScaleOrder[nextIndex] }, 'Se redujo el tamaño de letra.');
      },
      applySettings: updateSettings,
      resetSettings: () => {
        setSettings(defaultSettings);
        setLastChangeLabel('Se restablecieron las preferencias accesibles.');
      },
    };
  }, [lastChangeLabel, settings, updateSettings]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider.');
  }

  return context;
}
