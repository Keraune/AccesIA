import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AppColorScheme,
  darkColors,
  highContrastColors,
  lightColors,
} from '@/constants/colors';
import { getLocalItem, setLocalItem } from '@/services/localStorage';

export type AppThemeMode = 'light' | 'dark' | 'highContrast';
export type FontScaleMode = 'standard' | 'large' | 'extraLarge';
export type FontStyleMode = 'system' | 'rounded' | 'mono';
export type ButtonSizeMode = 'compact' | 'comfortable' | 'large';
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
  themeMode: AppThemeMode;
  highContrast: boolean;
  simplifiedMode: boolean;
  subtitlesEnabled: boolean;
  subtitlesAlwaysVisible: boolean;
  voiceCommandsEnabled: boolean;
  quickAccessEnabled: boolean;
  screenReaderSupportEnabled: boolean;
  reduceMotion: boolean;
  autoStartBubble: boolean;
  fontScale: FontScaleMode;
  fontStyle: FontStyleMode;
  buttonSize: ButtonSizeMode;
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
  buttonHeight: number;
  buttonPaddingVertical: number;
  preferredFontFamily: string;
  activeSettingsCount: number;
  lastChangeLabel: string;
  liveCaptionsActive: boolean;
  liveCaptionSource: LiveCaptionSource;
  liveCaptionStatus: LiveCaptionStatus;
  setThemeMode: (mode: AppThemeMode) => void;
  setHighContrast: (enabled: boolean) => void;
  setSimplifiedMode: (enabled: boolean) => void;
  setSubtitlesEnabled: (enabled: boolean) => void;
  setSubtitlesAlwaysVisible: (enabled: boolean) => void;
  setVoiceCommandsEnabled: (enabled: boolean) => void;
  setQuickAccessEnabled: (enabled: boolean) => void;
  setScreenReaderSupportEnabled: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  setAutoStartBubble: (enabled: boolean) => void;
  setFontScale: (mode: FontScaleMode) => void;
  setFontStyle: (style: FontStyleMode) => void;
  setButtonSize: (size: ButtonSizeMode) => void;
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
  large: 1.12,
  extraLarge: 1.24,
};

const captionScaleMultipliers: Record<CaptionSizeMode, number> = {
  medium: 1,
  large: 1.16,
  extraLarge: 1.32,
};

const buttonHeights: Record<ButtonSizeMode, number> = {
  compact: 44,
  comfortable: 52,
  large: 62,
};

const buttonPaddings: Record<ButtonSizeMode, number> = {
  compact: 7,
  comfortable: 10,
  large: 14,
};

const fontFamilyByStyle: Record<FontStyleMode, string> = {
  system: 'System',
  rounded: 'sans-serif-medium',
  mono: 'monospace',
};

const fontScaleOrder: FontScaleMode[] = ['standard', 'large', 'extraLarge'];

export const defaultSettings: AccessibilitySettings = {
  themeMode: 'light',
  highContrast: false,
  simplifiedMode: false,
  subtitlesEnabled: false,
  subtitlesAlwaysVisible: false,
  voiceCommandsEnabled: false,
  quickAccessEnabled: true,
  screenReaderSupportEnabled: true,
  reduceMotion: false,
  autoStartBubble: false,
  fontScale: 'standard',
  fontStyle: 'system',
  buttonSize: 'comfortable',
  readingSpeed: 1,
  captionSize: 'large',
  captionTheme: 'dark',
  captionPosition: 'bottom',
  captionLanguage: 'es-PE',
  bubbleSize: 'standard',
  bubblePosition: 'topRight',
};

const settingLabels: Partial<Record<keyof AccessibilitySettings, string>> = {
  themeMode: 'tema visual',
  highContrast: 'alto contraste',
  simplifiedMode: 'modo simplificado',
  subtitlesEnabled: 'subtítulos flotantes',
  subtitlesAlwaysVisible: 'subtítulos siempre visibles',
  voiceCommandsEnabled: 'comandos de voz',
  quickAccessEnabled: 'accesos rápidos',
  screenReaderSupportEnabled: 'compatibilidad con lectores de pantalla',
  reduceMotion: 'reducción de movimiento',
  autoStartBubble: 'burbuja al abrir la app',
  fontScale: 'tamaño de letra',
  fontStyle: 'estilo tipográfico',
  buttonSize: 'tamaño de botones',
  readingSpeed: 'velocidad de lectura',
  captionSize: 'tamaño de subtítulos',
  captionTheme: 'diseño de subtítulos',
  captionPosition: 'posición de subtítulos',
  captionLanguage: 'idioma de subtítulos',
  bubbleSize: 'tamaño de burbuja',
  bubblePosition: 'posición inicial de la burbuja',
};

function isThemeMode(value: unknown): value is AppThemeMode {
  return value === 'light' || value === 'dark' || value === 'highContrast';
}

function isFontScaleMode(value: unknown): value is FontScaleMode {
  return value === 'standard' || value === 'large' || value === 'extraLarge';
}

function isFontStyleMode(value: unknown): value is FontStyleMode {
  return value === 'system' || value === 'rounded' || value === 'mono';
}

function isButtonSizeMode(value: unknown): value is ButtonSizeMode {
  return value === 'compact' || value === 'comfortable' || value === 'large';
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
  const themeMode = isThemeMode(rawSettings.themeMode)
    ? rawSettings.themeMode
    : rawSettings.highContrast
      ? 'highContrast'
      : defaultSettings.themeMode;

  return {
    ...defaultSettings,
    ...rawSettings,
    themeMode,
    highContrast: themeMode === 'highContrast',
    fontScale: isFontScaleMode(rawSettings.fontScale) ? rawSettings.fontScale : defaultSettings.fontScale,
    fontStyle: isFontStyleMode(rawSettings.fontStyle) ? rawSettings.fontStyle : defaultSettings.fontStyle,
    buttonSize: isButtonSizeMode(rawSettings.buttonSize) ? rawSettings.buttonSize : defaultSettings.buttonSize,
    readingSpeed: isReadingSpeedMode(rawSettings.readingSpeed) ? rawSettings.readingSpeed : defaultSettings.readingSpeed,
    captionSize: isCaptionSizeMode(rawSettings.captionSize) ? rawSettings.captionSize : defaultSettings.captionSize,
    captionTheme: isCaptionThemeMode(rawSettings.captionTheme) ? rawSettings.captionTheme : defaultSettings.captionTheme,
    captionPosition: isCaptionPositionMode(rawSettings.captionPosition) ? rawSettings.captionPosition : defaultSettings.captionPosition,
    captionLanguage: isCaptionLanguageMode(rawSettings.captionLanguage) ? rawSettings.captionLanguage : defaultSettings.captionLanguage,
    bubbleSize: isOverlayBubbleSize(rawSettings.bubbleSize) ? rawSettings.bubbleSize : defaultSettings.bubbleSize,
    bubblePosition: isOverlayBubblePosition(rawSettings.bubblePosition) ? rawSettings.bubblePosition : defaultSettings.bubblePosition,
  } satisfies AccessibilitySettings;
}

function getChangeLabel(partialSettings: Partial<AccessibilitySettings>) {
  const firstKey = Object.keys(partialSettings)[0] as keyof AccessibilitySettings | undefined;
  return firstKey ? `Se actualizó ${settingLabels[firstKey] ?? 'una preferencia'}.` : 'Preferencias actualizadas.';
}

function getColors(settings: AccessibilitySettings) {
  if (settings.themeMode === 'highContrast' || settings.highContrast) return highContrastColors;
  if (settings.themeMode === 'dark') return darkColors;
  return lightColors;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [storageHydrated, setStorageHydrated] = useState(false);
  const [lastChangeLabel, setLastChangeLabel] = useState('AccesIA está lista para ayudarte.');
  const [liveCaptionsActive, setLiveCaptionsActiveState] = useState(false);
  const [liveCaptionStatus, setLiveCaptionStatusState] = useState<LiveCaptionStatus>('inactive');
  const [liveCaptionSource, setLiveCaptionSourceState] = useState<LiveCaptionSource>('device');

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      try {
        const [savedSettings, savedSource] = await Promise.all([
          getLocalItem(storageKey),
          getLocalItem(liveCaptionStorageKey),
        ]);

        if (!mounted) return;

        if (savedSettings) {
          setSettings(normalizeSettings(JSON.parse(savedSettings) as Partial<AccessibilitySettings>));
        }

        if (isLiveCaptionSource(savedSource)) {
          setLiveCaptionSourceState(savedSource);
        }
      } catch {
        if (!mounted) return;
      } finally {
        if (mounted) setStorageHydrated(true);
      }
    }

    void loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!storageHydrated) return;
    void setLocalItem(storageKey, JSON.stringify(settings));
  }, [settings, storageHydrated]);

  useEffect(() => {
    if (!storageHydrated) return;
    void setLocalItem(liveCaptionStorageKey, liveCaptionSource);
  }, [liveCaptionSource, storageHydrated]);

  useEffect(() => {
    setLiveCaptionsActiveState(settings.subtitlesEnabled || settings.subtitlesAlwaysVisible);
    if (settings.subtitlesEnabled || settings.subtitlesAlwaysVisible) {
      setLiveCaptionStatusState((current) => current === 'inactive' ? 'listening' : current);
    }
  }, [settings.subtitlesAlwaysVisible, settings.subtitlesEnabled]);

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
    const buttonHeight = buttonHeights[settings.buttonSize];
    const buttonPaddingVertical = buttonPaddings[settings.buttonSize];
    const preferredFontFamily = fontFamilyByStyle[settings.fontStyle];
    const activeSettingsCount = [
      settings.highContrast,
      settings.themeMode === 'dark',
      settings.simplifiedMode,
      settings.subtitlesEnabled,
      settings.subtitlesAlwaysVisible,
      settings.voiceCommandsEnabled,
      settings.quickAccessEnabled,
      settings.screenReaderSupportEnabled,
      settings.reduceMotion,
      settings.autoStartBubble,
    ].filter(Boolean).length;

    const setLiveCaptionSource = (source: LiveCaptionSource) => {
      setLiveCaptionSourceState(source);
      setLastChangeLabel('Se cambió la fuente de subtítulos.');
    };

    const setLiveCaptionsActive = (enabled: boolean) => {
      setLiveCaptionsActiveState(enabled);
      setLiveCaptionStatusState(enabled ? 'listening' : 'inactive');
      updateSettings(
        { subtitlesEnabled: enabled, subtitlesAlwaysVisible: enabled ? settings.subtitlesAlwaysVisible : false },
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
      updateSettings({ subtitlesEnabled: false, subtitlesAlwaysVisible: false }, 'Subtítulos flotantes detenidos.');
    };

    return {
      settings,
      colors: getColors(settings),
      fontMultiplier,
      captionFontMultiplier,
      buttonHeight,
      buttonPaddingVertical,
      preferredFontFamily,
      activeSettingsCount,
      lastChangeLabel,
      liveCaptionsActive,
      liveCaptionSource,
      liveCaptionStatus,
      setThemeMode: (themeMode) => updateSettings({ themeMode, highContrast: themeMode === 'highContrast' }, 'Se cambió el tema visual.'),
      setHighContrast: (enabled) => updateSettings({ highContrast: enabled, themeMode: enabled ? 'highContrast' : 'light' }),
      setSimplifiedMode: (enabled) => updateSettings({ simplifiedMode: enabled }),
      setSubtitlesEnabled: (enabled) => {
        setLiveCaptionsActiveState(enabled || settings.subtitlesAlwaysVisible);
        setLiveCaptionStatusState(enabled || settings.subtitlesAlwaysVisible ? 'listening' : 'inactive');
        updateSettings({ subtitlesEnabled: enabled });
      },
      setSubtitlesAlwaysVisible: (enabled) => {
        setLiveCaptionsActiveState(enabled || settings.subtitlesEnabled);
        setLiveCaptionStatusState(enabled || settings.subtitlesEnabled ? 'listening' : 'inactive');
        updateSettings({ subtitlesAlwaysVisible: enabled, subtitlesEnabled: enabled ? true : settings.subtitlesEnabled });
      },
      setVoiceCommandsEnabled: (enabled) => updateSettings({ voiceCommandsEnabled: enabled }),
      setQuickAccessEnabled: (enabled) => updateSettings({ quickAccessEnabled: enabled }),
      setScreenReaderSupportEnabled: (enabled) => updateSettings({ screenReaderSupportEnabled: enabled }),
      setReduceMotion: (enabled) => updateSettings({ reduceMotion: enabled }),
      setAutoStartBubble: (enabled) => updateSettings({ autoStartBubble: enabled }),
      setFontScale: (mode) => updateSettings({ fontScale: mode }),
      setFontStyle: (fontStyle) => updateSettings({ fontStyle }),
      setButtonSize: (buttonSize) => updateSettings({ buttonSize }),
      setReadingSpeed: (speed) => updateSettings({ readingSpeed: speed }),
      setCaptionSize: (captionSize) => updateSettings({ captionSize }),
      setCaptionTheme: (captionTheme) => updateSettings({ captionTheme }),
      setCaptionPosition: (captionPosition) => updateSettings({ captionPosition }),
      setCaptionLanguage: (captionLanguage) => updateSettings({ captionLanguage }),
      setLiveCaptionStatus: (status) => {
        setLiveCaptionStatusState(status);
        if (status === 'inactive') {
          setLiveCaptionsActiveState(false);
          updateSettings({ subtitlesEnabled: false, subtitlesAlwaysVisible: false }, 'Subtítulos flotantes detenidos.');
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
