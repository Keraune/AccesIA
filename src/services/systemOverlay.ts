import { Linking, NativeModules, Platform } from 'react-native';

import type {
  CaptionLanguageMode,
  CaptionPositionMode,
  CaptionThemeMode,
  LiveCaptionSource,
  OverlayBubblePosition,
  OverlayBubbleSize,
} from '@/context/AccessibilityContext';

export type OverlayOptions = {
  source: LiveCaptionSource;
  theme: CaptionThemeMode;
  scale: number;
  captionPosition: CaptionPositionMode;
  captionLanguage: CaptionLanguageMode;
  bubbleSize: OverlayBubbleSize;
  initialPosition: OverlayBubblePosition;
  minimize?: boolean;
  requestPermissionIfMissing?: boolean;
};

type OverlayStartResult =
  | { started: true; reason: null }
  | { started: false; reason: 'native-module-missing' | 'permission-required' };

type AccesiaOverlayNativeModule = {
  hasOverlayPermission: () => Promise<boolean>;
  openOverlaySettings: () => Promise<boolean>;
  startOverlay: (options: OverlayOptions) => Promise<boolean>;
  stopOverlay: () => Promise<boolean>;
  isOverlayRunning: () => Promise<boolean>;
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

export async function isAndroidFloatingAssistantActive() {
  if (!isAndroidSystemOverlayAvailable()) return false;
  return NativeOverlay?.isOverlayRunning() ?? false;
}

export async function startAndroidFloatingAssistant(options: OverlayOptions): Promise<OverlayStartResult> {
  if (!isAndroidSystemOverlayAvailable()) {
    return { started: false, reason: 'native-module-missing' };
  }

  const allowed = await hasAndroidOverlayPermission();
  if (!allowed) {
    if (options.requestPermissionIfMissing !== false) {
      await openAndroidOverlaySettings();
    }
    return { started: false, reason: 'permission-required' };
  }

  await NativeOverlay?.startOverlay(options);
  return { started: true, reason: null };
}

export async function stopAndroidFloatingAssistant() {
  if (!isAndroidSystemOverlayAvailable()) return false;
  await NativeOverlay?.stopOverlay();
  return true;
}
