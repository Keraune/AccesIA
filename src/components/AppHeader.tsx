import { StyleSheet, Text, View } from "react-native";

import { radius, spacing } from "@/constants/layout";
import { fontSizes, fontWeights, lineHeights } from "@/constants/typography";
import { useAccessibility } from "@/context/AccessibilityContext";

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
};

export function AppHeader({
  title = "AccesIA",
  subtitle = "Asistencia digital inclusiva",
}: AppHeaderProps) {
  const { colors, fontMultiplier, settings } = useAccessibility();

  return (
    <View
      accessible
      accessibilityLabel={`${title}. ${subtitle}`}
      style={styles.container}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={[
          styles.brandMark,
          {
            backgroundColor: settings.highContrast
              ? colors.accent
              : colors.primary,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.brandLetter,
            {
              color: settings.highContrast ? colors.background : colors.white,
              fontSize: fontSizes.xl * fontMultiplier,
              lineHeight: lineHeights.xl * fontMultiplier,
            },
          ]}
        >
          A
        </Text>
      </View>

      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontSize: fontSizes.xxl * fontMultiplier,
              lineHeight: lineHeights.xxl * fontMultiplier,
            },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textMuted,
              fontSize: fontSizes.md * fontMultiplier,
              lineHeight: lineHeights.md * fontMultiplier,
            },
          ]}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  brandMark: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  brandLetter: {
    fontWeight: fontWeights.extraBold,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: fontWeights.extraBold,
  },
  subtitle: {
    fontWeight: fontWeights.medium,
  },
});
