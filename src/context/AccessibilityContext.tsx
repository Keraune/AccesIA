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
export type CaptionThemeMode = 'dark' | 'light' | 'highContrast' | 'compact';
export type CaptionPositionMode = 'top' | 'center' | 'bottom';
export type CaptionLanguageMode = 'es-PE' | 'es-ES' | 'en-US' | 'auto';
export type LiveCaptionStatus = 'inactive' | 'waitingPermission' | 'listening' | 'captioning' | 'paused' | 'permissionError';
export type OverlayBubbleSize = 'compact' | 'standard' | 'large';
export type OverlayBubblePosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

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
  captionPosition: CaptionPositionMode;
  captionLanguage: CaptionLanguageMode;
  bubbleSize: OverlayBubbleSize;
  bubblePosition: OverlayBubblePosition;
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
  liveCaptionStatus: LiveCaptionStatus;
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
  setCaptionPosition: (position: CaptionPositionMode) => void;
  setCaptionLanguage: (language: CaptionLanguageMode) => void;
  setLiveCaptionStatus: (status: LiveCaptionStatus) => void;
  setBubbleSize: (size: OverlayBubbleSize) => void;
  setBubblePosition: (position: OverlayBubblePosition) => void;
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
  captionPosition: 'bottom',
  captionLanguage: 'es-PE',
  bubbleSize: 'standard',
  bubblePosition: 'topRight',
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
  captionPosition: 'posición de subtítulos',
  captionLanguage: 'idioma de subtítulos',
  bubbleSize: 'tamaño de burbuja',
  bubblePosition: 'posición inicial de la burbuja',
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
  return value === 'dark' || value === 'light' || value === 'highContrast' || value === 'compact';
}

function isCaptionPositionMode(value: unknown): value is CaptionPositionMode {
  return value === 'top' || value === 'center' || value === 'bottom';
}

function isCaptionLanguageMode(value: unknown): value is CaptionLanguageMode {
  return value === 'es-PE' || value === 'es-ES' || value === 'en-US' || value === 'auto';
}

function isOverlayBubbleSize(value: unknown): value is OverlayBubbleSize {
  return value === 'compact' || value === 'standard' || value === 'large';
}

function isOverlayBubblePosition(value: unknown): value is OverlayBubblePosition {
  return value === 'topLeft' || value === 'topRight' || value === 'bottomLeft' || value === 'bottomRight';
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
    captionPosition: isCaptionPositionMode(rawSettings.captionPosition)
      ? rawSettings.captionPosition
      : defaultSettings.captionPosition,
    captionLanguage: isCaptionLanguageMode(rawSettings.captionLanguage)
      ? rawSettings.captionLanguage
      : defaultSettings.captionLanguage,
    bubbleSize: isOverlayBubbleSize(rawSettings.bubbleSize)
      ? rawSettings.bubbleSize
      : defaultSettings.bubbleSize,
    bubblePosition: isOverlayBubblePosition(rawSettings.bubblePosition)
      ? rawSettings.bubblePosition
      : defaultSettings.bubblePosition,
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
  const [liveCaptionStatus, setLiveCaptionStatusState] = useState<LiveCaptionStatus>('inactive');
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
      setLiveCaptionStatusState(enabled ? 'listening' : 'inactive');
      updateSettings(
        { subtitlesEnabled: enabled },
        enabled ? 'Subtítulos flotantes activados.' : 'Subtítulos flotantes desactivados.',
      );
    };

    const startLiveCaptions = (source?: LiveCaptionSource) => {
      if (source) {
        setLiveCaptionSourceState(source);
      }
      setLiveCaptionsActiveState(true);
      setLiveCaptionStatusState('listening');
      updateSettings({ subtitlesEnabled: true }, 'Subtítulos flotantes activados.');
    };

    const stopLiveCaptions = () => {
      setLiveCaptionsActiveState(false);
      setLiveCaptionStatusState('inactive');
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
      liveCaptionStatus,
      setHighContrast: (enabled) => updateSettings({ highContrast: enabled }),
      setSimplifiedMode: (enabled) => updateSettings({ simplifiedMode: enabled }),
      setSubtitlesEnabled: (enabled) => {
        setLiveCaptionsActiveState(enabled);
        setLiveCaptionStatusState(enabled ? 'listening' : 'inactive');
        updateSettings({ subtitlesEnabled: enabled });
      },
      setVoiceCommandsEnabled: (enabled) => updateSettings({ voiceCommandsEnabled: enabled }),
      setQuickAccessEnabled: (enabled) => updateSettings({ quickAccessEnabled: enabled }),
      setScreenReaderSupportEnabled: (enabled) => updateSettings({ screenReaderSupportEnabled: enabled }),
      setFontScale: (mode) => updateSettings({ fontScale: mode }),
      setReadingSpeed: (speed) => updateSettings({ readingSpeed: speed }),
      setCaptionSize: (captionSize) => updateSettings({ captionSize }),
      setCaptionTheme: (captionTheme) => updateSettings({ captionTheme }),
      setCaptionPosition: (captionPosition) => updateSettings({ captionPosition }),
      setCaptionLanguage: (captionLanguage) => updateSettings({ captionLanguage }),
      setLiveCaptionStatus: (status) => {
        setLiveCaptionStatusState(status);
        if (status === 'inactive') {
          setLiveCaptionsActiveState(false);
          updateSettings({ subtitlesEnabled: false }, 'Subtítulos flotantes detenidos.');
          return;
        }
        setLiveCaptionsActiveState(status !== 'permissionError');
        if (status !== 'permissionError') {
          updateSettings({ subtitlesEnabled: true }, 'Estado de subtítulos actualizado.');
        }
      },
      setBubbleSize: (bubbleSize) => updateSettings({ bubbleSize }, 'Se actualizó el tamaño de la burbuja.'),
      setBubblePosition: (bubblePosition) => updateSettings({ bubblePosition }, 'Se actualizó la posición inicial de la burbuja.'),
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
        setLiveCaptionStatusState('inactive');
        setLiveCaptionSourceState('device');
        setLastChangeLabel('Se restablecieron las preferencias accesibles.');
      },
    };
  }, [lastChangeLabel, liveCaptionSource, liveCaptionStatus, liveCaptionsActive, settings, updateSettings]);

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
