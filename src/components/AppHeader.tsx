import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, touchTarget } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  showSettings?: boolean;
};

export function AppHeader({
  title = 'AccesIA',
  subtitle = 'Asistencia digital inclusiva',
  showSettings = true,
}: AppHeaderProps) {
  const router = useRouter();
  const { colors, fontMultiplier, settings } = useAccessibility();

  return (
    <View
      accessible
      accessibilityLabel={`${title}. ${subtitle}`}
      style={styles.container}
    >
      <View style={styles.brandGroup}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={[
            styles.brandMark,
            {
              backgroundColor: settings.highContrast ? colors.accent : colors.primaryDeep,
              borderColor: settings.highContrast ? colors.border : 'rgba(255,255,255,0.22)',
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Ionicons
            color={settings.highContrast ? colors.background : colors.white}
            name="accessibility-outline"
            size={28}
          />
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontSize: fontSizes.xl * fontMultiplier,
                lineHeight: lineHeights.xl * fontMultiplier,
              },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textMuted,
                fontSize: fontSizes.sm * fontMultiplier,
                lineHeight: lineHeights.sm * fontMultiplier,
              },
            ]}
          >
            {subtitle}
          </Text>
        </View>
      </View>

      {showSettings ? (
        <Pressable
          accessibilityHint="Abre la configuración de accesibilidad."
          accessibilityLabel="Abrir configuración"
          accessibilityRole="button"
          onPress={() => router.push('/configuracion' as never)}
          style={({ pressed }) => [
            styles.settingsButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.78 : 1,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Ionicons color={colors.text} name="settings-outline" size={22} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  brandGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  brandMark: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 5,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: fontWeights.black,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontWeight: fontWeights.medium,
  },
  settingsButton: {
    width: touchTarget.comfortable,
    height: touchTarget.comfortable,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 3,
  },
});
