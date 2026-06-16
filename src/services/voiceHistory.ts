import type { VoiceActionId, VoiceAssistantMode } from '@/data/voiceActions';
import { getLocalItem, removeLocalItem, setLocalItem } from '@/services/localStorage';

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
  try {
    const savedHistory = await getLocalItem(voiceHistoryStorageKey);
    if (!savedHistory) return memoryHistory;
    const normalized = normalizeHistory(JSON.parse(savedHistory));
    memoryHistory = normalized;
    return normalized;
  } catch {
    return memoryHistory;
  }
}

export async function saveVoiceCommandHistory(history: VoiceCommandHistoryItem[]) {
  const nextHistory = history.slice(0, maxStoredItems);
  memoryHistory = nextHistory;

  try {
    await setLocalItem(voiceHistoryStorageKey, JSON.stringify(nextHistory));
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
  await removeLocalItem(voiceHistoryStorageKey);
}
