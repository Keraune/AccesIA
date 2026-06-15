import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import type { AppColorScheme } from '@/constants/colors';
import { radius } from '@/constants/layout';
import { useAccessibility } from '@/context/AccessibilityContext';
import type { AppIconName, AppModule } from '@/data/appModules';

type IconBadgeProps = {
  icon: AppIconName;
  tone?: AppModule['accent'];
  size?: 'sm' | 'md' | 'lg';
  inverted?: boolean;
};

export function getToneColor(tone: AppModule['accent'] | undefined, colors: AppColorScheme) {
  switch (tone) {
    case 'secondary':
      return colors.secondary;
    case 'accent':
      return colors.accent;
    case 'success':
      return colors.success;
    case 'warning':
      return colors.warning;
    case 'primary':
    default:
      return colors.primary;
  }
}

export function getToneSoftColor(tone: AppModule['accent'] | undefined, colors: AppColorScheme) {
  switch (tone) {
    case 'secondary':
      return colors.secondarySoft;
    case 'accent':
      return colors.accentSoft;
    case 'success':
      return colors.successSoft;
    case 'warning':
      return colors.warningSoft;
    case 'primary':
    default:
      return colors.primarySoft;
  }
}

export function IconBadge({ icon, tone = 'primary', size = 'md', inverted = false }: IconBadgeProps) {
  const { colors, settings } = useAccessibility();
  const toneColor = getToneColor(tone, colors);
  const softColor = getToneSoftColor(tone, colors);

  const dimension = {
    sm: 40,
    md: 52,
    lg: 68,
  }[size];

  const iconSize = {
    sm: 19,
    md: 24,
    lg: 31,
  }[size];

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        styles.badge,
        {
          width: dimension,
          height: dimension,
          backgroundColor: inverted ? toneColor : softColor,
          borderColor: settings.highContrast ? colors.border : 'rgba(255,255,255,0.64)',
        },
      ]}
    >
      <Ionicons
        color={inverted ? (settings.highContrast ? colors.background : colors.white) : toneColor}
        name={icon}
        size={iconSize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
  },
});
