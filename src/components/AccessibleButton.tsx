import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { radius, spacing, touchTarget } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';
import type { AppIconName } from '@/data/appModules';

type AccessibleButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'dark';

type AccessibleButtonProps = {
  title: string;
  description?: string;
  icon?: AppIconName;
  iconPosition?: 'left' | 'right';
  variant?: AccessibleButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export function AccessibleButton({
  title,
  description,
  icon,
  iconPosition = 'left',
  variant = 'primary',
  disabled = false,
  fullWidth = true,
  onPress,
  style,
  titleStyle,
  accessibilityLabel,
  accessibilityHint,
}: AccessibleButtonProps) {
  const { colors, fontMultiplier, settings } = useAccessibility();

  const variantStyle = {
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      textColor: settings.highContrast ? colors.background : colors.white,
      iconBackground: 'rgba(255,255,255,0.14)',
    },
    secondary: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      textColor: colors.text,
      iconBackground: colors.surfaceElevated,
    },
    accent: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
      textColor: settings.highContrast ? colors.background : colors.white,
      iconBackground: 'rgba(255,255,255,0.18)',
    },
    ghost: {
      backgroundColor: colors.surfaceElevated,
      borderColor: colors.border,
      textColor: colors.text,
      iconBackground: colors.surface,
    },
    dark: {
      backgroundColor: colors.primaryDeep,
      borderColor: colors.primaryDeep,
      textColor: colors.white,
      iconBackground: 'rgba(255,255,255,0.12)',
    },
  }[variant];

  const iconElement = icon ? (
    <View style={[styles.iconWrap, { backgroundColor: variantStyle.iconBackground }]}> 
      <Ionicons color={variantStyle.textColor} name={icon} size={20} />
    </View>
  ) : null;

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        description ? styles.buttonWithDescription : null,
        {
          width: fullWidth ? '100%' : undefined,
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          opacity: disabled ? 0.55 : pressed ? 0.86 : 1,
          shadowColor: variant === 'secondary' || variant === 'ghost' ? colors.shadow : variantStyle.backgroundColor,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        style,
      ]}
    >
      {iconPosition === 'left' ? iconElement : null}
      <View style={styles.textGroup}>
        <Text
          style={[
            styles.title,
            {
              color: variantStyle.textColor,
              fontSize: fontSizes.md * fontMultiplier,
              lineHeight: lineHeights.md * fontMultiplier,
            },
            titleStyle,
          ]}
        >
          {title}
        </Text>
        {description ? (
          <Text
            style={[
              styles.description,
              {
                color: variantStyle.textColor,
                fontSize: fontSizes.sm * fontMultiplier,
                lineHeight: lineHeights.sm * fontMultiplier,
              },
            ]}
          >
            {description}
          </Text>
        ) : null}
      </View>
      {iconPosition === 'right' ? iconElement : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touchTarget.comfortable,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 4,
  },
  buttonWithDescription: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingVertical: spacing.lg,
  },
  iconWrap: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  textGroup: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontWeight: fontWeights.extraBold,
    textAlign: 'center',
  },
  description: {
    fontWeight: fontWeights.medium,
    opacity: 0.9,
    textAlign: 'center',
  },
});
