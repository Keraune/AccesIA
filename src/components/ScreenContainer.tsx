import { PropsWithChildren } from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '@/components/BottomNavigation';
import { appLayout, spacing } from '@/constants/layout';
import { useAccessibility } from '@/context/AccessibilityContext';

type ScreenContainerProps = PropsWithChildren<{
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollEnabled?: boolean;
  showBottomNavigation?: boolean;
}>;

export function ScreenContainer({
  children,
  contentContainerStyle,
  scrollEnabled = true,
  showBottomNavigation = true,
}: ScreenContainerProps) {
  const { colors, settings } = useAccessibility();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}> 
      <View pointerEvents="none" style={styles.ambientLayer}>
        <View
          style={[
            styles.ambientOrb,
            styles.orbPrimary,
            {
              backgroundColor: settings.highContrast ? colors.accentSoft : colors.secondarySoft,
            },
          ]}
        />
        <View
          style={[
            styles.ambientOrb,
            styles.orbAccent,
            {
              backgroundColor: settings.highContrast ? colors.primarySoft : colors.accentSoft,
            },
          ]}
        />
      </View>

      <ScrollView
        bounces={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: showBottomNavigation ? appLayout.bottomNavigationHeight + spacing.xxxl : spacing.section },
          contentContainerStyle,
        ]}
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>{children}</View>
      </ScrollView>
      {showBottomNavigation ? <BottomNavigation /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    overflow: 'hidden',
  },
  ambientLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  ambientOrb: {
    position: 'absolute',
    opacity: 0.72,
  },
  orbPrimary: {
    top: -96,
    right: -86,
    width: 230,
    height: 230,
    borderRadius: 160,
  },
  orbAccent: {
    top: 210,
    left: -118,
    width: 220,
    height: 220,
    borderRadius: 160,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: appLayout.horizontalPadding,
    paddingTop: spacing.xxl,
  },
  inner: {
    width: '100%',
    maxWidth: appLayout.maxContentWidth,
    alignSelf: 'center',
  },
});
