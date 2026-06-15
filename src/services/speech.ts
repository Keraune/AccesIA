export type SpeechStatus = 'idle' | 'reading' | 'paused' | 'unsupported';

export type SpeakOptions = {
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onEnd?: () => void;
  onError?: () => void;
};

type SpeechUtteranceLike = {
  text: string;
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
  onstart: (() => void) | null;
  onpause: (() => void) | null;
  onresume: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechSynthesisLike = {
  speaking: boolean;
  paused: boolean;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  speak: (utterance: SpeechUtteranceLike) => void;
};

type SpeechWindow = typeof globalThis & {
  speechSynthesis?: SpeechSynthesisLike;
  SpeechSynthesisUtterance?: new (text: string) => SpeechUtteranceLike;
};

function getSpeechWindow() {
  return globalThis as SpeechWindow;
}

export function isSpeechSynthesisAvailable() {
  const speechWindow = getSpeechWindow();
  return Boolean(speechWindow.speechSynthesis && speechWindow.SpeechSynthesisUtterance);
}

export function speakText(text: string, options: SpeakOptions = {}) {
  const speechWindow = getSpeechWindow();

  if (!isSpeechSynthesisAvailable() || !speechWindow.speechSynthesis || !speechWindow.SpeechSynthesisUtterance) {
    options.onError?.();
    return false;
  }

  speechWindow.speechSynthesis.cancel();

  const utterance = new speechWindow.SpeechSynthesisUtterance(text);
  utterance.lang = 'es-PE';
  utterance.rate = options.rate ?? 1;
  utterance.pitch = options.pitch ?? 1;
  utterance.volume = 1;
  utterance.onstart = options.onStart ?? null;
  utterance.onpause = options.onPause ?? null;
  utterance.onresume = options.onResume ?? null;
  utterance.onend = options.onEnd ?? null;
  utterance.onerror = options.onError ?? null;

  speechWindow.speechSynthesis.speak(utterance);
  return true;
}

export function pauseSpeech() {
  const speechWindow = getSpeechWindow();
  if (!speechWindow.speechSynthesis?.speaking) return false;
  speechWindow.speechSynthesis.pause();
  return true;
}

export function resumeSpeech() {
  const speechWindow = getSpeechWindow();
  if (!speechWindow.speechSynthesis?.paused) return false;
  speechWindow.speechSynthesis.resume();
  return true;
}

export function stopSpeech() {
  const speechWindow = getSpeechWindow();
  if (!speechWindow.speechSynthesis) return false;
  speechWindow.speechSynthesis.cancel();
  return true;
}

export function getSpeechStatus(): SpeechStatus {
  const speechWindow = getSpeechWindow();

  if (!speechWindow.speechSynthesis) {
    return 'unsupported';
  }

  if (speechWindow.speechSynthesis.paused) {
    return 'paused';
  }

  if (speechWindow.speechSynthesis.speaking) {
    return 'reading';
  }

  return 'idle';
}
