import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { radius, spacing, touchTarget } from "@/constants/layout";
import { fontSizes, fontWeights, lineHeights } from "@/constants/typography";
import { useAccessibility } from "@/context/AccessibilityContext";

type AccessibleButtonVariant = "primary" | "secondary" | "accent" | "ghost";

type AccessibleButtonProps = {
  title: string;
  description?: string;
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
  variant = "primary",
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
    },
    secondary: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      textColor: colors.text,
    },
    accent: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
      textColor: settings.highContrast ? colors.background : colors.white,
    },
    ghost: {
      backgroundColor: colors.surfaceElevated,
      borderColor: colors.border,
      textColor: colors.text,
    },
  }[variant];

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
        {
          width: fullWidth ? "100%" : undefined,
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          opacity: disabled ? 0.55 : pressed ? 0.82 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touchTarget.comfortable,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  textGroup: {
    alignItems: "center",
    gap: spacing.xs,
  },
  title: {
    fontWeight: fontWeights.extraBold,
    textAlign: "center",
  },
  description: {
    fontWeight: fontWeights.medium,
    opacity: 0.9,
    textAlign: "center",
  },
});
