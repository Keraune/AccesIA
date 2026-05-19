import { StyleSheet, Switch, Text, View } from "react-native";

import { radius, spacing, touchTarget } from "@/constants/layout";
import { fontSizes, fontWeights, lineHeights } from "@/constants/typography";
import { useAccessibility } from "@/context/AccessibilityContext";

type AccessibilityToggleProps = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export function AccessibilityToggle({
  label,
  description,
  value,
  onValueChange,
  accessibilityLabel,
  accessibilityHint,
}: AccessibilityToggleProps) {
  const { colors, fontMultiplier } = useAccessibility();

  return (
    <View
      accessible
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: value ? colors.accent : colors.border,
        },
      ]}
    >
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.label,
            {
              color: colors.text,
              fontSize: fontSizes.md * fontMultiplier,
              lineHeight: lineHeights.md * fontMultiplier,
            },
          ]}
        >
          {label}
        </Text>
        {description ? (
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
            {description}
          </Text>
        ) : null}
      </View>

      <Switch
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        onValueChange={onValueChange}
        thumbColor={value ? colors.accent : colors.surfaceElevated}
        trackColor={{ false: colors.border, true: colors.accentSoft }}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: touchTarget.large,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  textContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    fontWeight: fontWeights.bold,
  },
  description: {
    fontWeight: fontWeights.regular,
  },
});
