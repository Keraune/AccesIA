import { NativeModules, Platform } from 'react-native';

type NativeStorageModule = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<boolean>;
  removeItem: (key: string) => Promise<boolean>;
};

type StorageWindow = typeof globalThis & {
  localStorage?: {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
  };
};

const nativeStorage = NativeModules.AccesiaStorage as NativeStorageModule | undefined;
const memoryStorage = new Map<string, string>();

function getWebStorage() {
  if (Platform.OS !== 'web') return null;
  return (globalThis as StorageWindow).localStorage ?? null;
}

export async function getLocalItem(key: string) {
  const webStorage = getWebStorage();
  if (webStorage) return webStorage.getItem(key);

  if (Platform.OS === 'android' && nativeStorage) {
    return nativeStorage.getItem(key);
  }

  return memoryStorage.get(key) ?? null;
}

export async function setLocalItem(key: string, value: string) {
  const webStorage = getWebStorage();
  if (webStorage) {
    webStorage.setItem(key, value);
    return true;
  }

  if (Platform.OS === 'android' && nativeStorage) {
    return nativeStorage.setItem(key, value);
  }

  memoryStorage.set(key, value);
  return true;
}

export async function removeLocalItem(key: string) {
  const webStorage = getWebStorage();
  if (webStorage) {
    webStorage.removeItem(key);
    return true;
  }

  if (Platform.OS === 'android' && nativeStorage) {
    return nativeStorage.removeItem(key);
  }

  memoryStorage.delete(key);
  return true;
}
