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
  const { colors, fontMultiplier, preferredFontFamily } = useAccessibility();
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
          style={[styles.brandMark, { backgroundColor: colors.primaryDeep }]}
        >
          <Image source={appIcon} style={styles.brandImage} />
        </View>

        <View style={styles.textContainer}>
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              {
                color: colors.text,
                fontSize: fontSizes.lg * fontMultiplier,
                lineHeight: lineHeights.lg * fontMultiplier,
                fontFamily: preferredFontFamily,
              },
            ]}
          >
            {title}
          </Text>
          <Text
            numberOfLines={1}
            style={[
              styles.subtitle,
              {
                color: colors.textMuted,
                fontSize: fontSizes.xs * fontMultiplier,
                lineHeight: lineHeights.xs * fontMultiplier,
                fontFamily: preferredFontFamily,
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
            styles.iconButton,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              opacity: pressed ? 0.78 : 1,
            },
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.initials,
              {
                color: colors.text,
                fontSize: fontSizes.xs * fontMultiplier,
                lineHeight: lineHeights.xs * fontMultiplier,
                fontFamily: preferredFontFamily,
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
              styles.iconButton,
              {
                backgroundColor: colors.accent,
                borderColor: colors.accent,
                opacity: pressed ? 0.78 : 1,
              },
            ]}
          >
            <Ionicons color={colors.black} name="settings-outline" size={20} />
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
    marginBottom: spacing.xl,
  },
  brandGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 0,
  },
  brandMark: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  brandImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontWeight: fontWeights.black,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontWeight: fontWeights.medium,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: touchTarget.minimum,
    height: touchTarget.minimum,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.pill,
  },
  initials: {
    fontWeight: fontWeights.black,
  },
});
