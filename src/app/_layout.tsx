import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { AccessibilityProvider, useAccessibility } from '@/context/AccessibilityContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { startAndroidFloatingAssistant } from '@/services/systemOverlay';

function AppStack() {
  const {
    captionFontMultiplier,
    colors,
    liveCaptionSource,
    settings,
    startLiveCaptions,
  } = useAccessibility();
  const autoStartAttempted = useRef(false);
  const statusStyle: 'light' | 'dark' = settings.themeMode === 'dark' || settings.themeMode === 'highContrast' || settings.highContrast
    ? 'light'
    : 'dark';

  useEffect(() => {
    if (!settings.autoStartBubble || autoStartAttempted.current) return;
    autoStartAttempted.current = true;

    async function openBubble() {
      const result = await startAndroidFloatingAssistant({
        source: liveCaptionSource,
        theme: settings.captionTheme,
        scale: captionFontMultiplier,
        captionPosition: settings.captionPosition,
        captionLanguage: settings.captionLanguage,
        bubbleSize: settings.bubbleSize,
        initialPosition: settings.bubblePosition,
        minimize: false,
        requestPermissionIfMissing: false,
      });

      if (result.started) {
        startLiveCaptions(liveCaptionSource);
      }
    }

    void openBubble();
  }, [captionFontMultiplier, liveCaptionSource, settings, startLiveCaptions]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={statusStyle} backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          animation: settings.reduceMotion ? 'none' : 'slide_from_right',
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ProfileProvider>
      <AccessibilityProvider>
        <AppStack />
      </AccessibilityProvider>
    </ProfileProvider>
  );
}
