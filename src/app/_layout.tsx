import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { AccessibilityProvider, useAccessibility } from '@/context/AccessibilityContext';
import { ProfileProvider } from '@/context/ProfileContext';

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
