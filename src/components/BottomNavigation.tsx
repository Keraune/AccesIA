import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, touchTarget } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';
import { bottomMenuModules } from '@/data/appModules';

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, fontMultiplier, settings } = useAccessibility();

  if (settings.simplifiedMode) {
    return null;
  }

  return (
    <View
      accessibilityLabel="Menú principal inferior"
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      {bottomMenuModules.map((item) => {
        const selected = pathname === item.route;

        return (
          <Pressable
            accessibilityHint={item.accessibilityHint}
            accessibilityLabel={item.shortLabel}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={item.route}
            onPress={() => router.push(item.route as never)}
            style={({ pressed }) => [
              styles.item,
              {
                backgroundColor: selected
                  ? colors.primary
                  : pressed
                    ? colors.surfaceElevated
                    : 'transparent',
                borderColor: selected ? colors.primary : 'transparent',
              },
            ]}
          >
            <Text
              style={[
                styles.symbol,
                {
                  color: selected
                    ? settings.highContrast
                      ? colors.background
                      : colors.white
                    : colors.textMuted,
                  fontSize: fontSizes.xs * fontMultiplier,
                  lineHeight: lineHeights.xs * fontMultiplier,
                },
              ]}
            >
              {item.symbol}
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                {
                  color: selected
                    ? settings.highContrast
                      ? colors.background
                      : colors.white
                    : colors.textMuted,
                  fontSize: fontSizes.xs * fontMultiplier,
                  lineHeight: lineHeights.xs * fontMultiplier,
                },
              ]}
            >
              {item.shortLabel}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.xs,
    borderTopWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  item: {
    minHeight: touchTarget.minimum,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  symbol: {
    fontWeight: fontWeights.extraBold,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  label: {
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
});
