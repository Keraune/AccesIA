import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, touchTarget } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';
import type { AppIconName } from '@/data/appModules';

type AccessibilityToggleProps = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon?: AppIconName;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export function AccessibilityToggle({
  label,
  description,
  value,
  onValueChange,
  icon = 'toggle-outline',
  accessibilityLabel,
  accessibilityHint,
}: AccessibilityToggleProps) {
  const { buttonHeight, colors, fontMultiplier, preferredFontFamily } = useAccessibility();

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: value ? colors.accent : colors.border,
          opacity: pressed ? 0.86 : 1,
          minHeight: Math.max(buttonHeight + 10, 58),
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={[
          styles.iconContainer,
          { backgroundColor: value ? colors.accent : colors.surfaceElevated },
        ]}
      >
        <Ionicons color={value ? colors.black : colors.textMuted} name={icon} size={21} />
      </View>

      <View style={styles.textContainer}>
        <Text
          style={[
            styles.label,
            {
              color: colors.text,
              fontSize: fontSizes.md * fontMultiplier,
              lineHeight: lineHeights.md * fontMultiplier,
                fontFamily: preferredFontFamily,
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
                fontFamily: preferredFontFamily,
              },
            ]}
          >
            {description}
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.switchTrack,
          { backgroundColor: value ? colors.accent : colors.border },
        ]}
      >
        <View
          style={[
            styles.switchThumb,
            {
              backgroundColor: colors.white,
              transform: [{ translateX: value ? 20 : 0 }],
            },
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: touchTarget.large,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderRadius: 0,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.md,
  },
  iconContainer: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  textContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    fontWeight: fontWeights.extraBold,
  },
  description: {
    fontWeight: fontWeights.regular,
  },
  switchTrack: {
    width: 50,
    height: 30,
    justifyContent: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: 3,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
  },
});
