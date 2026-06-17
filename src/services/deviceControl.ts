import { Linking, NativeModules, Platform } from 'react-native';

export type AndroidGlobalAction = 'home' | 'back' | 'recents' | 'notifications' | 'quickSettings';

export type AppOpenResult = {
  opened: boolean;
  packageName: string;
  label?: string;
};

type AccesiaDeviceNativeModule = {
  openAccessibilitySettings: () => Promise<boolean>;
  openDisplaySettings: () => Promise<boolean>;
  openCaptionSettings: () => Promise<boolean>;
  openSystemSettings: () => Promise<boolean>;
  isAccessibilityServiceEnabled: () => Promise<boolean>;
  performGlobalAction: (action: AndroidGlobalAction) => Promise<boolean>;
  openAppByName: (name: string) => Promise<AppOpenResult>;
  openAppByPackage: (packageName: string) => Promise<AppOpenResult>;
};

const NativeDevice = NativeModules.AccesiaDevice as AccesiaDeviceNativeModule | undefined;

const knownAppPackages: Record<string, string> = {
  youtube: 'com.google.android.youtube',
  'you tube': 'com.google.android.youtube',
  whatsapp: 'com.whatsapp',
  'whats app': 'com.whatsapp',
  chrome: 'com.android.chrome',
  gmail: 'com.google.android.gm',
  maps: 'com.google.android.apps.maps',
  mapas: 'com.google.android.apps.maps',
  camara: 'com.android.camera',
  cámara: 'com.android.camera',
  telefono: 'com.google.android.dialer',
  teléfono: 'com.google.android.dialer',
  spotify: 'com.spotify.music',
  telegram: 'org.telegram.messenger',
  instagram: 'com.instagram.android',
  facebook: 'com.facebook.katana',
  tiktok: 'com.zhiliaoapp.musically',
  netflix: 'com.netflix.mediaclient',
};

export function isAndroidDeviceControlAvailable() {
  return Platform.OS === 'android' && Boolean(NativeDevice);
}

export async function openAndroidAccessibilitySettings() {
  if (isAndroidDeviceControlAvailable()) return NativeDevice?.openAccessibilitySettings() ?? false;
  if (Platform.OS === 'android') {
    await Linking.openSettings();
    return true;
  }
  return false;
}

export async function openAndroidDisplaySettings() {
  if (isAndroidDeviceControlAvailable()) return NativeDevice?.openDisplaySettings() ?? false;
  if (Platform.OS === 'android') {
    await Linking.openSettings();
    return true;
  }
  return false;
}

export async function openAndroidCaptionSettings() {
  if (isAndroidDeviceControlAvailable()) return NativeDevice?.openCaptionSettings() ?? false;
  if (Platform.OS === 'android') {
    await Linking.openSettings();
    return true;
  }
  return false;
}

export async function openAndroidSystemSettings() {
  if (isAndroidDeviceControlAvailable()) return NativeDevice?.openSystemSettings() ?? false;
  if (Platform.OS === 'android') {
    await Linking.openSettings();
    return true;
  }
  return false;
}

export async function isAccesiaAccessibilityServiceEnabled() {
  if (!isAndroidDeviceControlAvailable()) return false;
  return NativeDevice?.isAccessibilityServiceEnabled() ?? false;
}

export async function performAndroidGlobalAction(action: AndroidGlobalAction) {
  if (!isAndroidDeviceControlAvailable()) return false;
  return NativeDevice?.performGlobalAction(action) ?? false;
}

export async function openAndroidAppByName(appName: string): Promise<AppOpenResult> {
  if (!isAndroidDeviceControlAvailable()) {
    return { opened: false, packageName: '', label: appName };
  }

  const key = appName.trim().toLowerCase();
  const knownPackage = knownAppPackages[key];
  if (knownPackage) {
    return NativeDevice?.openAppByPackage(knownPackage) ?? { opened: false, packageName: knownPackage, label: appName };
  }

  return NativeDevice?.openAppByName(appName) ?? { opened: false, packageName: '', label: appName };
}
