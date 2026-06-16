import { Platform } from 'react-native';

import type { VoiceActionId, VoiceAssistantMode } from '@/data/voiceActions';

export type VoiceCommandStatus = 'recognized' | 'unrecognized';

export type VoiceCommandHistoryItem = {
  id: string;
  transcript: string;
  response: string;
  actionId?: VoiceActionId;
  actionLabel?: string;
  assistantMode: VoiceAssistantMode;
  confidence: number;
  status: VoiceCommandStatus;
  createdAt: string;
};

const voiceHistoryStorageKey = 'accesia-voice-command-history';
const maxStoredItems = 12;
let memoryHistory: VoiceCommandHistoryItem[] = [];

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

function normalizeHistory(rawValue: unknown): VoiceCommandHistoryItem[] {
  if (!Array.isArray(rawValue)) return [];

  return rawValue
    .filter((item): item is VoiceCommandHistoryItem => (
      typeof item?.id === 'string'
      && typeof item?.transcript === 'string'
      && typeof item?.response === 'string'
      && typeof item?.assistantMode === 'string'
      && typeof item?.createdAt === 'string'
    ))
    .slice(0, maxStoredItems);
}

export async function loadVoiceCommandHistory() {
  const storage = getStorage();
  if (!storage) return memoryHistory;

  try {
    const savedHistory = storage.getItem(voiceHistoryStorageKey);
    if (!savedHistory) return [];
    return normalizeHistory(JSON.parse(savedHistory));
  } catch {
    return [];
  }
}

export async function saveVoiceCommandHistory(history: VoiceCommandHistoryItem[]) {
  const nextHistory = history.slice(0, maxStoredItems);
  memoryHistory = nextHistory;

  const storage = getStorage();
  if (!storage) return nextHistory;

  try {
    storage.setItem(voiceHistoryStorageKey, JSON.stringify(nextHistory));
  } catch {
    // Keep the in-memory history if persistent storage is temporarily unavailable.
  }

  return nextHistory;
}

export async function addVoiceCommandHistoryItem(item: VoiceCommandHistoryItem) {
  const currentHistory = await loadVoiceCommandHistory();
  return saveVoiceCommandHistory([item, ...currentHistory].slice(0, maxStoredItems));
}

export async function clearVoiceCommandHistory() {
  memoryHistory = [];
  const storage = getStorage();
  if (storage) {
    storage.removeItem(voiceHistoryStorageKey);
  }
}
