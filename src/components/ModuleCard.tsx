import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getToneColor, getToneSoftColor, IconBadge } from '@/components/IconBadge';
import { radius, spacing, touchTarget } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';
import { AppModule } from '@/data/appModules';

type ModuleCardProps = {
  module: AppModule;
  compact?: boolean;
};

export function ModuleCard({ module, compact = false }: ModuleCardProps) {
  const router = useRouter();
  const { colors, fontMultiplier } = useAccessibility();
  const toneColor = getToneColor(module.accent, colors);
  const toneSoft = getToneSoftColor(module.accent, colors);

  return (
    <Pressable
      accessibilityHint={module.accessibilityHint}
      accessibilityLabel={module.label}
      accessibilityRole="button"
      onPress={() => router.push(module.route as never)}
      style={({ pressed }) => [
        styles.card,
        compact ? styles.compactCard : null,
        {
          backgroundColor: colors.surface,
          borderColor: pressed ? toneColor : colors.border,
          opacity: pressed ? 0.9 : 1,
          shadowColor: colors.shadow,
          transform: [{ translateY: pressed ? 1 : 0 }, { scale: pressed ? 0.99 : 1 }],
        },
      ]}
    >
      <View style={[styles.accentRail, { backgroundColor: toneColor }]} />
      <IconBadge icon={module.icon} size={compact ? 'sm' : 'md'} tone={module.accent} />

      <View style={styles.textBlock}>
        <View style={styles.titleRow}>
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
            {module.label}
          </Text>
          {!compact ? (
            <View style={[styles.statusPill, { backgroundColor: toneSoft }]}> 
              <Text
                style={[
                  styles.statusText,
                  {
                    color: toneColor,
                    fontSize: fontSizes.xs * fontMultiplier,
                    lineHeight: lineHeights.xs * fontMultiplier,
                  },
                ]}
              >
                {module.status}
              </Text>
            </View>
          ) : null}
        </View>

        {!compact ? (
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
            {module.description}
          </Text>
        ) : null}
      </View>

      <View style={[styles.chevron, { backgroundColor: colors.surfaceElevated }]}> 
        <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 126,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 26,
    elevation: 5,
  },
  compactCard: {
    minHeight: touchTarget.large,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  accentRail: {
    position: 'absolute',
    left: 0,
    top: 18,
    bottom: 18,
    width: 5,
    borderBottomRightRadius: radius.pill,
    borderTopRightRadius: radius.pill,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    gap: spacing.xs,
  },
  title: {
    fontWeight: fontWeights.extraBold,
  },
  description: {
    fontWeight: fontWeights.medium,
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusText: {
    fontWeight: fontWeights.extraBold,
  },
  chevron: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
});
