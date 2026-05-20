import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';

type InfoCardProps = {
  title: string;
  text: string;
  tone?: 'default' | 'accent' | 'primary' | 'danger' | 'success';
};

export function InfoCard({ title, text, tone = 'default' }: InfoCardProps) {
  const { colors, fontMultiplier } = useAccessibility();

  const backgroundColor = {
    default: colors.surface,
    accent: colors.accentSoft,
    primary: colors.primarySoft,
    danger: colors.surfaceElevated,
    success: colors.surfaceElevated,
  }[tone];

  const borderColor = {
    default: colors.border,
    accent: colors.accent,
    primary: colors.primary,
    danger: colors.danger,
    success: colors.success,
  }[tone];

  return (
    <View
      accessible
      accessibilityLabel={`${title}. ${text}`}
      style={[styles.card, { backgroundColor, borderColor }]}
    >
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
        {title}
      </Text>
      <Text
        style={[
          styles.text,
          {
            color: colors.textMuted,
            fontSize: fontSizes.md * fontMultiplier,
            lineHeight: lineHeights.md * fontMultiplier,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  title: {
    fontWeight: fontWeights.extraBold,
    marginBottom: spacing.xs,
  },
  text: {
    fontWeight: fontWeights.regular,
  },
});
