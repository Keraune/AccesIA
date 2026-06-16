import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';

export type UserProfile = {
  name: string;
  email: string;
  avatarUri?: string;
  preferredUse: 'lectura' | 'subtitulos' | 'voz' | 'simple';
};

type ProfileContextValue = {
  profile: UserProfile;
  signedIn: boolean;
  initials: string;
  signIn: (profile: Pick<UserProfile, 'name' | 'email'>) => void;
  signOut: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
};

const defaultProfile: UserProfile = {
  name: 'Usuario AccesIA',
  email: '',
  preferredUse: 'subtitulos',
};

const storageKey = 'accesia-user-profile';

type StorageGlobal = typeof globalThis & {
  localStorage?: {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
  };
};

function getStorage() {
  if (Platform.OS !== 'web') return null;
  return (globalThis as StorageGlobal).localStorage ?? null;
}

function normalizeProfile(rawProfile?: Partial<UserProfile> | null): UserProfile {
  return {
    ...defaultProfile,
    ...rawProfile,
    name: rawProfile?.name?.trim() || defaultProfile.name,
    email: rawProfile?.email?.trim() || '',
    preferredUse: rawProfile?.preferredUse ?? defaultProfile.preferredUse,
  };
}

function loadInitialProfile() {
  const storage = getStorage();
  if (!storage) return defaultProfile;

  try {
    const saved = storage.getItem(storageKey);
    if (!saved) return defaultProfile;
    return normalizeProfile(JSON.parse(saved) as Partial<UserProfile>);
  } catch {
    return defaultProfile;
  }
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const initials = parts.map((part) => part[0]?.toUpperCase()).join('');
  return initials || 'A';
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState<UserProfile>(loadInitialProfile);
  const [signedIn, setSignedIn] = useState(() => Boolean(loadInitialProfile().email));

  useEffect(() => {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(storageKey, JSON.stringify(profile));
  }, [profile]);

  const updateProfile = useCallback((partialProfile: Partial<UserProfile>) => {
    setProfile((current) => normalizeProfile({ ...current, ...partialProfile }));
  }, []);

  const signIn = useCallback((nextProfile: Pick<UserProfile, 'name' | 'email'>) => {
    setProfile((current) => normalizeProfile({ ...current, ...nextProfile }));
    setSignedIn(Boolean(nextProfile.email.trim()));
  }, []);

  const signOut = useCallback(() => {
    setProfile(defaultProfile);
    setSignedIn(false);
    getStorage()?.removeItem(storageKey);
  }, []);

  const value = useMemo<ProfileContextValue>(() => ({
    profile,
    signedIn,
    initials: getInitials(profile.name),
    signIn,
    signOut,
    updateProfile,
  }), [profile, signedIn, signIn, signOut, updateProfile]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider.');
  }

  return context;
}
