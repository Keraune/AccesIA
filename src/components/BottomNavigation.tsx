import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';
import { bottomMenuModules } from '@/data/appModules';

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, fontMultiplier, preferredFontFamily, settings } = useAccessibility();
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
          paddingBottom: Math.max(insets.bottom, spacing.md),
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View style={styles.shell}>
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
                  opacity: pressed ? 0.78 : 1,
                },
              ]}
            >
              <View
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={[
                  styles.activeIndicator,
                  { backgroundColor: selected ? colors.accent : 'transparent' },
                ]}
              />
              <Ionicons
                color={selected ? colors.text : colors.textSubtle}
                name={iconName as typeof item.icon}
                size={selected ? 22 : 21}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  {
                    color: selected ? colors.text : colors.textSubtle,
                    fontSize: fontSizes.xs * fontMultiplier,
                    lineHeight: lineHeights.xs * fontMultiplier,
                    fontFamily: preferredFontFamily,
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
    borderTopWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 10,
    zIndex: 60,
  },
  shell: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flex: 1,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: radius.md,
    paddingHorizontal: 2,
  },
  activeIndicator: {
    width: 22,
    height: 3,
    borderRadius: radius.pill,
    marginBottom: spacing.xs,
  },
  label: {
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
});
