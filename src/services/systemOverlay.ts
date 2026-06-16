import { Linking, NativeModules, Platform } from 'react-native';

import type { CaptionThemeMode, LiveCaptionSource } from '@/context/AccessibilityContext';

type OverlayOptions = {
  source: LiveCaptionSource;
  theme: CaptionThemeMode;
  scale: number;
  minimize?: boolean;
};

type AccesiaOverlayNativeModule = {
  hasOverlayPermission: () => Promise<boolean>;
  openOverlaySettings: () => Promise<boolean>;
  startOverlay: (options: OverlayOptions) => Promise<boolean>;
  stopOverlay: () => Promise<boolean>;
};

const NativeOverlay = NativeModules.AccesiaOverlay as AccesiaOverlayNativeModule | undefined;

export function isAndroidSystemOverlayAvailable() {
  return Platform.OS === 'android' && Boolean(NativeOverlay);
}

export async function hasAndroidOverlayPermission() {
  if (!isAndroidSystemOverlayAvailable()) return false;
  return NativeOverlay?.hasOverlayPermission() ?? false;
}

export async function openAndroidOverlaySettings() {
  if (isAndroidSystemOverlayAvailable()) {
    await NativeOverlay?.openOverlaySettings();
    return;
  }

  if (Platform.OS === 'android') {
    await Linking.openSettings();
  }
}

export async function startAndroidFloatingAssistant(options: OverlayOptions) {
  if (!isAndroidSystemOverlayAvailable()) {
    return { started: false, reason: 'native-module-missing' as const };
  }

  const allowed = await hasAndroidOverlayPermission();
  if (!allowed) {
    await openAndroidOverlaySettings();
    return { started: false, reason: 'permission-required' as const };
  }

  await NativeOverlay?.startOverlay(options);
  return { started: true, reason: null };
}

export async function stopAndroidFloatingAssistant() {
  if (!isAndroidSystemOverlayAvailable()) return false;
  await NativeOverlay?.stopOverlay();
  return true;
}
