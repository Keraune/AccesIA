import { getLocalItem, setLocalItem } from '@/services/localStorage';

export type SavedReadingText = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

const readingLibraryKey = 'accesia-reading-library';
const maxSavedTexts = 12;

function normalizeTextItem(item: Partial<SavedReadingText>): SavedReadingText | null {
  const content = item.content?.trim();
  if (!content) return null;

  const now = new Date().toISOString();
  return {
    id: item.id || `${Date.now()}`,
    title: item.title?.trim() || buildTitleFromContent(content),
    content,
    createdAt: item.createdAt || now,
    updatedAt: item.updatedAt || now,
  };
}

export function buildTitleFromContent(content: string) {
  const normalized = content.replace(/\s+/g, ' ').trim();
  if (!normalized) return 'Texto guardado';
  return normalized.length > 36 ? `${normalized.slice(0, 36)}…` : normalized;
}

export async function loadSavedReadingTexts() {
  try {
    const saved = await getLocalItem(readingLibraryKey);
    if (!saved) return [];
    const parsed = JSON.parse(saved) as Partial<SavedReadingText>[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeTextItem)
      .filter((item): item is SavedReadingText => Boolean(item))
      .slice(0, maxSavedTexts);
  } catch {
    return [];
  }
}

export async function saveReadingText(content: string, title?: string) {
  const now = new Date().toISOString();
  const current = await loadSavedReadingTexts();
  const existingIndex = current.findIndex((item) => item.content.trim() === content.trim());
  const nextItem: SavedReadingText = {
    id: existingIndex >= 0 ? current[existingIndex].id : `${Date.now()}`,
    title: title?.trim() || buildTitleFromContent(content),
    content: content.trim(),
    createdAt: existingIndex >= 0 ? current[existingIndex].createdAt : now,
    updatedAt: now,
  };
  const withoutExisting = current.filter((item) => item.id !== nextItem.id);
  const nextLibrary = [nextItem, ...withoutExisting].slice(0, maxSavedTexts);
  await setLocalItem(readingLibraryKey, JSON.stringify(nextLibrary));
  return nextLibrary;
}

export async function deleteReadingText(id: string) {
  const current = await loadSavedReadingTexts();
  const nextLibrary = current.filter((item) => item.id !== id);
  await setLocalItem(readingLibraryKey, JSON.stringify(nextLibrary));
  return nextLibrary;
}
