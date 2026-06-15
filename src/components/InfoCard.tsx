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
  const { colors, fontMultiplier } = useAccessibility();

  const backgroundColor = {
    default: colors.surface,
    accent: colors.accentSoft,
    primary: colors.primarySoft,
    secondary: colors.secondarySoft,
    warning: colors.warningSoft,
    danger: colors.dangerSoft,
    success: colors.successSoft,
  }[tone];

  const borderColor = {
    default: colors.border,
    accent: colors.accent,
    primary: colors.primary,
    secondary: colors.secondary,
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 10 },
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
  text: {
    fontWeight: fontWeights.regular,
  },
});
