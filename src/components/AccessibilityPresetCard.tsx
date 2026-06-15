import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconBadge } from '@/components/IconBadge';
import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';
import type { AccessibilityPreset } from '@/data/accessibilityPresets';

type AccessibilityPresetCardProps = {
  preset: AccessibilityPreset;
  onApply: () => void;
};

export function AccessibilityPresetCard({ preset, onApply }: AccessibilityPresetCardProps) {
  const { colors, fontMultiplier } = useAccessibility();

  return (
    <Pressable
      accessibilityHint={`Aplica el perfil ${preset.title}.`}
      accessibilityLabel={`${preset.title}. ${preset.description}`}
      accessibilityRole="button"
      onPress={onApply}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.86 : 1,
          shadowColor: colors.shadow,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      <IconBadge icon={preset.icon} size="sm" tone={preset.tone} />
      <View style={styles.textBlock}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontSize: fontSizes.md * fontMultiplier,
              lineHeight: lineHeights.md * fontMultiplier,
            },
          ]}
        >
          {preset.title}
        </Text>
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
          {preset.description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 210,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
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
