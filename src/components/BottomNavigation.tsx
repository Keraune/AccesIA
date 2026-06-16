import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, spacing, touchTarget } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';
import { bottomMenuModules } from '@/data/appModules';

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, fontMultiplier, settings } = useAccessibility();
  const insets = useSafeAreaInsets();

  if (settings.simplifiedMode) {
    return null;
  }

  return (
    <View
      accessibilityLabel="Menú principal inferior"
      style={[
        styles.safeDock,
        {
          paddingBottom: Math.max(insets.bottom, spacing.xl),
          backgroundColor: colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.shell,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        {bottomMenuModules.map((item) => {
          const selected = pathname === item.route;
          const iconName = selected ? item.icon.replace('-outline', '') : item.icon;

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
                    ? colors.primaryDeep
                    : pressed
                      ? colors.surfaceElevated
                      : 'transparent',
                  opacity: pressed ? 0.84 : 1,
                },
              ]}
            >
              <Ionicons
                color={selected ? colors.white : colors.textMuted}
                name={iconName as typeof item.icon}
                size={22}
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
    </View>
  );
}

const styles = StyleSheet.create({
  safeDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    zIndex: 60,
  },
  shell: {
    minHeight: 78,
    flexDirection: 'row',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.xxl,
    padding: spacing.sm,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
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
  label: {
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
});
