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
  const { buttonHeight, buttonPaddingVertical, colors, fontMultiplier, preferredFontFamily, settings } = useAccessibility();

  const primaryTextColor = settings.themeMode === 'light' && !settings.highContrast ? colors.white : colors.black;
  const accentTextColor = colors.black;

  const variantStyle = {
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      textColor: primaryTextColor,
      iconBackground: settings.themeMode === 'light' && !settings.highContrast ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)',
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
      textColor: accentTextColor,
      iconBackground: 'rgba(0,0,0,0.1)',
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
          minHeight: buttonHeight,
          paddingVertical: buttonPaddingVertical,
          shadowColor: variant === 'secondary' || variant === 'ghost' ? colors.shadow : variantStyle.backgroundColor,
          transform: [{ scale: pressed && !settings.reduceMotion ? 0.985 : 1 }],
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
              fontFamily: preferredFontFamily,
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
                fontFamily: preferredFontFamily,
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
    minHeight: touchTarget.minimum,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 1,
  },
  buttonWithDescription: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingVertical: spacing.lg,
  },
  iconWrap: {
    width: 32,
    height: 32,
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
