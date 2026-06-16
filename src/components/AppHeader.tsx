import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, touchTarget } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';
import { useProfile } from '@/context/ProfileContext';

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  showSettings?: boolean;
};

const appIcon = require('../../assets/images/icon.png');

export function AppHeader({
  title = 'AccesIA',
  subtitle = 'Asistencia digital inclusiva',
  showSettings = true,
}: AppHeaderProps) {
  const router = useRouter();
  const { colors, fontMultiplier } = useAccessibility();
  const { initials, profile } = useProfile();

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
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Image source={appIcon} style={styles.brandImage} />
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

      <View style={styles.actionsRow}>
        <Pressable
          accessibilityHint="Abre tu perfil de AccesIA."
          accessibilityLabel={`Abrir perfil de ${profile.name}`}
          accessibilityRole="button"
          onPress={() => router.push('/perfil' as never)}
          style={({ pressed }) => [
            styles.profileButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.78 : 1,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Text
            style={[
              styles.initials,
              {
                color: colors.text,
                fontSize: fontSizes.xs * fontMultiplier,
                lineHeight: lineHeights.xs * fontMultiplier,
              },
            ]}
          >
            {initials}
          </Text>
        </Pressable>

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
    padding: 3,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 5,
  },
  brandImage: {
    width: '100%',
    height: '100%',
    borderRadius: radius.md,
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
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  settingsButton: {
    width: touchTarget.comfortable,
    height: touchTarget.comfortable,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 3,
  },
  profileButton: {
    width: touchTarget.comfortable,
    height: touchTarget.comfortable,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 3,
  },
  initials: {
    fontWeight: fontWeights.black,
  },
});
