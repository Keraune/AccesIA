import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, touchTarget } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';
import { AppModule } from '@/data/appModules';

type ModuleCardProps = {
  module: AppModule;
  compact?: boolean;
};

export function ModuleCard({ module, compact = false }: ModuleCardProps) {
  const router = useRouter();
  const { colors, fontMultiplier, settings } = useAccessibility();

  return (
    <Pressable
      accessibilityHint={module.accessibilityHint}
      accessibilityLabel={module.label}
      accessibilityRole="button"
      onPress={() => router.push(module.route as never)}
      style={({ pressed }) => [
        styles.card,
        compact ? styles.compactCard : null,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.78 : 1,
          shadowColor: colors.shadow,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={[
          styles.symbol,
          {
            backgroundColor: settings.highContrast
              ? colors.accentSoft
              : colors.primarySoft,
            borderColor: settings.highContrast ? colors.accent : colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.symbolText,
            {
              color: settings.highContrast ? colors.accent : colors.primary,
              fontSize: fontSizes.sm * fontMultiplier,
              lineHeight: lineHeights.sm * fontMultiplier,
            },
          ]}
        >
          {module.symbol}
        </Text>
      </View>

      <View style={styles.textBlock}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontSize: fontSizes.lg * fontMultiplier,
              lineHeight: lineHeights.lg * fontMultiplier,
            },
          ]}
        >
          {module.label}
        </Text>
        {!compact ? (
          <Text
            style={[
              styles.description,
              {
                color: colors.textMuted,
                fontSize: fontSizes.sm * fontMultiplier,
                lineHeight: lineHeights.sm * fontMultiplier,
              },
            ]}
          >
            {module.description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 3,
  },
  compactCard: {
    minHeight: touchTarget.large,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  symbol: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  symbolText: {
    fontWeight: fontWeights.extraBold,
    letterSpacing: 0.8,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontWeight: fontWeights.extraBold,
  },
  description: {
    fontWeight: fontWeights.medium,
  },
});
