import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AccessibilityProvider, useAccessibility } from '@/context/AccessibilityContext';

function AppStack() {
  const { colors, settings } = useAccessibility();

  return (
    <>
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
    </>
  );
}

export default function RootLayout() {
  return (
    <AccessibilityProvider>
      <AppStack />
    </AccessibilityProvider>
  );
}
