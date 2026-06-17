import { Linking, NativeModules, PermissionsAndroid, Platform } from 'react-native';

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
  | { started: false; reason: 'native-module-missing' | 'permission-required' | 'microphone-permission-required' };

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

export async function requestAndroidMicrophonePermission() {
  if (Platform.OS !== 'android') return true;

  const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
  if (granted) return true;

  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
    title: 'Permiso de micrófono',
    message: 'AccesIA usa el micrófono para generar subtítulos y comandos de voz cuando tú activas estas funciones.',
    buttonPositive: 'Permitir',
    buttonNegative: 'Ahora no',
  });

  return result === PermissionsAndroid.RESULTS.GRANTED;
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

  if (Platform.OS === 'android') {
    const microphoneAlreadyAllowed = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    if (!microphoneAlreadyAllowed && options.requestPermissionIfMissing === false) {
      return { started: false, reason: 'microphone-permission-required' };
    }
  }

  const microphoneAllowed = await requestAndroidMicrophonePermission();
  if (!microphoneAllowed) {
    return { started: false, reason: 'microphone-permission-required' };
  }

  await NativeOverlay?.startOverlay(options);
  return { started: true, reason: null };
}

export async function stopAndroidFloatingAssistant() {
  if (!isAndroidSystemOverlayAvailable()) return false;
  await NativeOverlay?.stopOverlay();
  return true;
}
