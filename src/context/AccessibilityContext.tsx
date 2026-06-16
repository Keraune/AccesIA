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
export type LiveCaptionSource = 'device' | 'video' | 'music' | 'classroom';
export type CaptionSizeMode = 'medium' | 'large' | 'extraLarge';
export type CaptionThemeMode = 'dark' | 'blue' | 'light';

export type AccessibilitySettings = {
  highContrast: boolean;
  simplifiedMode: boolean;
  subtitlesEnabled: boolean;
  voiceCommandsEnabled: boolean;
  quickAccessEnabled: boolean;
  screenReaderSupportEnabled: boolean;
  fontScale: FontScaleMode;
  readingSpeed: ReadingSpeedMode;
  captionSize: CaptionSizeMode;
  captionTheme: CaptionThemeMode;
};

type AccessibilityContextValue = {
  settings: AccessibilitySettings;
  colors: AppColorScheme;
  fontMultiplier: number;
  captionFontMultiplier: number;
  activeSettingsCount: number;
  lastChangeLabel: string;
  liveCaptionsActive: boolean;
  liveCaptionSource: LiveCaptionSource;
  setHighContrast: (enabled: boolean) => void;
  setSimplifiedMode: (enabled: boolean) => void;
  setSubtitlesEnabled: (enabled: boolean) => void;
  setVoiceCommandsEnabled: (enabled: boolean) => void;
  setQuickAccessEnabled: (enabled: boolean) => void;
  setScreenReaderSupportEnabled: (enabled: boolean) => void;
  setFontScale: (mode: FontScaleMode) => void;
  setReadingSpeed: (speed: ReadingSpeedMode) => void;
  setCaptionSize: (size: CaptionSizeMode) => void;
  setCaptionTheme: (theme: CaptionThemeMode) => void;
  setLiveCaptionSource: (source: LiveCaptionSource) => void;
  setLiveCaptionsActive: (enabled: boolean) => void;
  startLiveCaptions: (source?: LiveCaptionSource) => void;
  stopLiveCaptions: () => void;
  increaseFontScale: () => void;
  decreaseFontScale: () => void;
  applySettings: (partialSettings: Partial<AccessibilitySettings>, label?: string) => void;
  resetSettings: () => void;
};

const storageKey = 'accesia-accessibility-settings';
const liveCaptionStorageKey = 'accesia-live-caption-source';

const fontScaleMultipliers: Record<FontScaleMode, number> = {
  standard: 1,
  large: 1.15,
  extraLarge: 1.3,
};

const captionScaleMultipliers: Record<CaptionSizeMode, number> = {
  medium: 1,
  large: 1.18,
  extraLarge: 1.36,
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
  captionSize: 'large',
  captionTheme: 'dark',
};

const settingLabels: Partial<Record<keyof AccessibilitySettings, string>> = {
  highContrast: 'alto contraste',
  simplifiedMode: 'modo simplificado',
  subtitlesEnabled: 'subtítulos flotantes',
  voiceCommandsEnabled: 'comandos de voz',
  quickAccessEnabled: 'accesos rápidos',
  screenReaderSupportEnabled: 'compatibilidad con lectores de pantalla',
  fontScale: 'tamaño de letra',
  readingSpeed: 'velocidad de lectura',
  captionSize: 'tamaño de subtítulos',
  captionTheme: 'diseño de subtítulos',
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

function isCaptionSizeMode(value: unknown): value is CaptionSizeMode {
  return value === 'medium' || value === 'large' || value === 'extraLarge';
}

function isCaptionThemeMode(value: unknown): value is CaptionThemeMode {
  return value === 'dark' || value === 'blue' || value === 'light';
}

function isLiveCaptionSource(value: unknown): value is LiveCaptionSource {
  return value === 'device' || value === 'video' || value === 'music' || value === 'classroom';
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
    captionSize: isCaptionSizeMode(rawSettings.captionSize)
      ? rawSettings.captionSize
      : defaultSettings.captionSize,
    captionTheme: isCaptionThemeMode(rawSettings.captionTheme)
      ? rawSettings.captionTheme
      : defaultSettings.captionTheme,
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

function loadInitialCaptionSource(): LiveCaptionSource {
  const storage = getStorage();
  if (!storage) return 'device';

  try {
    const savedSource = storage.getItem(liveCaptionStorageKey);
    return isLiveCaptionSource(savedSource) ? savedSource : 'device';
  } catch {
    return 'device';
  }
}

function getChangeLabel(partialSettings: Partial<AccessibilitySettings>) {
  const firstKey = Object.keys(partialSettings)[0] as keyof AccessibilitySettings | undefined;
  return firstKey ? `Se actualizó ${settingLabels[firstKey] ?? 'una preferencia'}.` : 'Preferencias actualizadas.';
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<AccessibilitySettings>(loadInitialSettings);
  const [lastChangeLabel, setLastChangeLabel] = useState('AccesIA está lista para ayudarte.');
  const [liveCaptionsActive, setLiveCaptionsActiveState] = useState(false);
  const [liveCaptionSource, setLiveCaptionSourceState] = useState<LiveCaptionSource>(loadInitialCaptionSource);

  useEffect(() => {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(storageKey, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(liveCaptionStorageKey, liveCaptionSource);
  }, [liveCaptionSource]);

  useEffect(() => {
    setLiveCaptionsActiveState(settings.subtitlesEnabled);
  }, [settings.subtitlesEnabled]);

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
    const captionFontMultiplier = captionScaleMultipliers[settings.captionSize];
    const currentFontIndex = fontScaleOrder.indexOf(settings.fontScale);
    const activeSettingsCount = [
      settings.highContrast,
      settings.simplifiedMode,
      settings.subtitlesEnabled,
      settings.voiceCommandsEnabled,
      settings.quickAccessEnabled,
      settings.screenReaderSupportEnabled,
    ].filter(Boolean).length;

    const setLiveCaptionSource = (source: LiveCaptionSource) => {
      setLiveCaptionSourceState(source);
      setLastChangeLabel('Se cambió la fuente de subtítulos.');
    };

    const setLiveCaptionsActive = (enabled: boolean) => {
      setLiveCaptionsActiveState(enabled);
      updateSettings({ subtitlesEnabled: enabled }, enabled ? 'Subtítulos flotantes activados.' : 'Subtítulos flotantes desactivados.');
    };

    const startLiveCaptions = (source?: LiveCaptionSource) => {
      if (source) {
        setLiveCaptionSourceState(source);
      }
      setLiveCaptionsActiveState(true);
      updateSettings({ subtitlesEnabled: true }, 'Subtítulos flotantes activados.');
    };

    const stopLiveCaptions = () => {
      setLiveCaptionsActiveState(false);
      updateSettings({ subtitlesEnabled: false }, 'Subtítulos flotantes detenidos.');
    };

    return {
      settings,
      colors: settings.highContrast ? highContrastColors : lightColors,
      fontMultiplier,
      captionFontMultiplier,
      activeSettingsCount,
      lastChangeLabel,
      liveCaptionsActive,
      liveCaptionSource,
      setHighContrast: (enabled) => updateSettings({ highContrast: enabled }),
      setSimplifiedMode: (enabled) => updateSettings({ simplifiedMode: enabled }),
      setSubtitlesEnabled: (enabled) => {
        setLiveCaptionsActiveState(enabled);
        updateSettings({ subtitlesEnabled: enabled });
      },
      setVoiceCommandsEnabled: (enabled) => updateSettings({ voiceCommandsEnabled: enabled }),
      setQuickAccessEnabled: (enabled) => updateSettings({ quickAccessEnabled: enabled }),
      setScreenReaderSupportEnabled: (enabled) => updateSettings({ screenReaderSupportEnabled: enabled }),
      setFontScale: (mode) => updateSettings({ fontScale: mode }),
      setReadingSpeed: (speed) => updateSettings({ readingSpeed: speed }),
      setCaptionSize: (captionSize) => updateSettings({ captionSize }),
      setCaptionTheme: (captionTheme) => updateSettings({ captionTheme }),
      setLiveCaptionSource,
      setLiveCaptionsActive,
      startLiveCaptions,
      stopLiveCaptions,
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
        setLiveCaptionsActiveState(false);
        setLiveCaptionSourceState('device');
        setLastChangeLabel('Se restablecieron las preferencias accesibles.');
      },
    };
  }, [lastChangeLabel, liveCaptionSource, liveCaptionsActive, settings, updateSettings]);

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
