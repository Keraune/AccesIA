import { Ionicons } from '@expo/vector-icons';
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
        styles.floatingShell,
        {
          backgroundColor: colors.surfaceGlass,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      {bottomMenuModules.map((item) => {
        const selected = pathname === item.route;
        const iconName = selected
          ? item.icon.replace('-outline', '')
          : item.icon;

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
              selected ? styles.selectedItem : null,
              {
                backgroundColor: selected
                  ? colors.primaryDeep
                  : pressed
                    ? colors.surfaceElevated
                    : 'transparent',
                opacity: pressed ? 0.82 : 1,
              },
            ]}
          >
            <Ionicons
              color={selected ? colors.white : colors.textMuted}
              name={iconName as typeof item.icon}
              size={20}
            />
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                {
                  color: selected ? colors.white : colors.textMuted,
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
  floatingShell: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.md,
    flexDirection: 'row',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.xxl,
    padding: spacing.sm,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.24,
    shadowRadius: 32,
    elevation: 14,
  },
  item: {
    minHeight: touchTarget.minimum,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  selectedItem: {
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  label: {
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
});
