import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  AppColorScheme,
  highContrastColors,
  lightColors,
} from "@/constants/colors";

export type FontScaleMode = "standard" | "large" | "extraLarge";

export type AccessibilitySettings = {
  highContrast: boolean;
  simplifiedMode: boolean;
  subtitlesEnabled: boolean;
  voiceCommandsEnabled: boolean;
  quickAccessEnabled: boolean;
  screenReaderSupportEnabled: boolean;
  fontScale: FontScaleMode;
};

type AccessibilityContextValue = {
  settings: AccessibilitySettings;
  colors: AppColorScheme;
  fontMultiplier: number;
  setHighContrast: (enabled: boolean) => void;
  setSimplifiedMode: (enabled: boolean) => void;
  setSubtitlesEnabled: (enabled: boolean) => void;
  setVoiceCommandsEnabled: (enabled: boolean) => void;
  setQuickAccessEnabled: (enabled: boolean) => void;
  setScreenReaderSupportEnabled: (enabled: boolean) => void;
  setFontScale: (mode: FontScaleMode) => void;
  increaseFontScale: () => void;
  decreaseFontScale: () => void;
};

const fontScaleMultipliers: Record<FontScaleMode, number> = {
  standard: 1,
  large: 1.15,
  extraLarge: 1.3,
};

const fontScaleOrder: FontScaleMode[] = ["standard", "large", "extraLarge"];

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  simplifiedMode: false,
  subtitlesEnabled: false,
  voiceCommandsEnabled: false,
  quickAccessEnabled: true,
  screenReaderSupportEnabled: true,
  fontScale: "standard",
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null,
);

export function AccessibilityProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] =
    useState<AccessibilitySettings>(defaultSettings);

  const updateSettings = useCallback(
    (partialSettings: Partial<AccessibilitySettings>) => {
      setSettings((current) => ({
        ...current,
        ...partialSettings,
      }));
    },
    [],
  );

  const value = useMemo<AccessibilityContextValue>(() => {
    const fontMultiplier = fontScaleMultipliers[settings.fontScale];
    const currentFontIndex = fontScaleOrder.indexOf(settings.fontScale);

    return {
      settings,
      colors: settings.highContrast ? highContrastColors : lightColors,
      fontMultiplier,
      setHighContrast: (enabled) => updateSettings({ highContrast: enabled }),
      setSimplifiedMode: (enabled) =>
        updateSettings({ simplifiedMode: enabled }),
      setSubtitlesEnabled: (enabled) =>
        updateSettings({ subtitlesEnabled: enabled }),
      setVoiceCommandsEnabled: (enabled) =>
        updateSettings({ voiceCommandsEnabled: enabled }),
      setQuickAccessEnabled: (enabled) =>
        updateSettings({ quickAccessEnabled: enabled }),
      setScreenReaderSupportEnabled: (enabled) =>
        updateSettings({ screenReaderSupportEnabled: enabled }),
      setFontScale: (mode) => updateSettings({ fontScale: mode }),
      increaseFontScale: () => {
        const nextIndex = Math.min(
          currentFontIndex + 1,
          fontScaleOrder.length - 1,
        );
        updateSettings({ fontScale: fontScaleOrder[nextIndex] });
      },
      decreaseFontScale: () => {
        const nextIndex = Math.max(currentFontIndex - 1, 0);
        updateSettings({ fontScale: fontScaleOrder[nextIndex] });
      },
    };
  }, [settings, updateSettings]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error(
      "useAccessibility must be used within AccessibilityProvider.",
    );
  }

  return context;
}
