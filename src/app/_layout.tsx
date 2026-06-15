import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { LiveCaptionOverlay } from '@/components/LiveCaptionOverlay';
import { AccessibilityProvider, useAccessibility } from '@/context/AccessibilityContext';

function AppStack() {
  const { colors, settings } = useAccessibility();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={settings.highContrast ? 'light' : 'dark'} backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      />
      <LiveCaptionOverlay />
    </View>
  );
}

export default function RootLayout() {
  return (
    <AccessibilityProvider>
      <AppStack />
    </AccessibilityProvider>
  );
}
