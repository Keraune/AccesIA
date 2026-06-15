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
  const { colors, fontMultiplier } = useAccessibility();

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
          backgroundColor: value ? colors.primarySoft : colors.surface,
          borderColor: value ? colors.primary : colors.border,
          opacity: pressed ? 0.86 : 1,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={[
          styles.iconContainer,
          { backgroundColor: value ? colors.primary : colors.surfaceElevated },
        ]}
      >
        <Ionicons color={value ? colors.white : colors.textMuted} name={icon} size={21} />
      </View>

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

      <View
        style={[
          styles.switchTrack,
          { backgroundColor: value ? colors.primary : colors.border },
        ]}
      >
        <View
          style={[
            styles.switchThumb,
            {
              backgroundColor: colors.white,
              transform: [{ translateX: value ? 22 : 0 }],
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
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
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
    width: 54,
    height: 32,
    justifyContent: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: 3,
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
  },
});
