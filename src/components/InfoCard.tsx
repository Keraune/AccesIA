import { StyleSheet, Text, View } from 'react-native';

import { IconBadge } from '@/components/IconBadge';
import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';
import type { AppIconName, AppModule } from '@/data/appModules';

type InfoCardTone = 'default' | 'accent' | 'primary' | 'danger' | 'success' | 'secondary' | 'warning';

type InfoCardProps = {
  title: string;
  text: string;
  tone?: InfoCardTone;
  icon?: AppIconName;
};

function resolveTone(tone: InfoCardTone): AppModule['accent'] {
  if (tone === 'secondary') return 'secondary';
  if (tone === 'accent') return 'accent';
  if (tone === 'success') return 'success';
  if (tone === 'warning') return 'warning';
  return 'primary';
}

export function InfoCard({ title, text, tone = 'default', icon }: InfoCardProps) {
  const { colors, fontMultiplier, preferredFontFamily } = useAccessibility();

  const backgroundColor = colors.surface;

  const borderColor = {
    default: colors.border,
    accent: colors.accent,
    primary: colors.accent,
    secondary: colors.border,
    warning: colors.warning,
    danger: colors.danger,
    success: colors.success,
  }[tone];

  const resolvedIcon = icon ?? {
    default: 'information-circle-outline',
    accent: 'sparkles-outline',
    primary: 'shield-checkmark-outline',
    secondary: 'radio-outline',
    warning: 'alert-circle-outline',
    danger: 'warning-outline',
    success: 'checkmark-circle-outline',
  }[tone] as AppIconName;

  return (
    <View
      accessible
      accessibilityLabel={`${title}. ${text}`}
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <IconBadge icon={resolvedIcon} size="sm" tone={resolveTone(tone)} />
      <View style={styles.textBlock}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontSize: fontSizes.md * fontMultiplier,
              lineHeight: lineHeights.md * fontMultiplier,
              fontFamily: preferredFontFamily,
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
              fontSize: fontSizes.sm * fontMultiplier,
              lineHeight: lineHeights.sm * fontMultiplier,
              fontFamily: preferredFontFamily,
            },
          ]}
        >
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderLeftWidth: 4,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontWeight: fontWeights.extraBold,
  },
  text: {
    fontWeight: fontWeights.regular,
  },
});
