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
  const { colors } = useAccessibility();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView
        bounces={false}
        contentContainerStyle={[styles.content, contentContainerStyle]}
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
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: appLayout.horizontalPadding,
    paddingBottom: spacing.section,
    paddingTop: spacing.xxl,
  },
  inner: {
    width: '100%',
    maxWidth: appLayout.maxContentWidth,
    alignSelf: 'center',
  },
});
