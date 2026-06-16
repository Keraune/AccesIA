import { Platform } from 'react-native';
import * as ExpoSpeech from 'expo-speech';

type ExpoSpeechWithPause = typeof ExpoSpeech & {
  pause?: () => void;
  resume?: () => void;
};

const NativeSpeech = ExpoSpeech as ExpoSpeechWithPause;

export type SpeechStatus = 'idle' | 'reading' | 'paused' | 'unsupported';

export type SpeechVoiceOption = {
  id: string;
  name: string;
  language: string;
  quality?: string;
};

export type SpeakOptions = {
  rate?: number;
  pitch?: number;
  language?: string;
  voiceIdentifier?: string;
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
  voice?: unknown;
  onstart: (() => void) | null;
  onpause: (() => void) | null;
  onresume: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type BrowserVoiceLike = {
  voiceURI: string;
  name: string;
  lang: string;
  localService?: boolean;
};

type SpeechSynthesisLike = {
  speaking: boolean;
  paused: boolean;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  speak: (utterance: SpeechUtteranceLike) => void;
  getVoices?: () => BrowserVoiceLike[];
};

type SpeechWindow = typeof globalThis & {
  speechSynthesis?: SpeechSynthesisLike;
  SpeechSynthesisUtterance?: new (text: string) => SpeechUtteranceLike;
};

let nativeSpeechState: SpeechStatus = 'idle';
let lastNativeText = '';
let lastNativeOptions: SpeakOptions = {};

function getSpeechWindow() {
  return globalThis as SpeechWindow;
}

function isWebSpeechAvailable() {
  const speechWindow = getSpeechWindow();
  return Boolean(speechWindow.speechSynthesis && speechWindow.SpeechSynthesisUtterance);
}

export function isSpeechSynthesisAvailable() {
  if (Platform.OS !== 'web') return true;
  return isWebSpeechAvailable();
}

export async function getAvailableSpeechVoices(): Promise<SpeechVoiceOption[]> {
  if (Platform.OS !== 'web') {
    try {
      const voices = await ExpoSpeech.getAvailableVoicesAsync();
      return voices.map((voice) => ({
        id: voice.identifier,
        name: voice.name || voice.identifier,
        language: voice.language,
        quality: String(voice.quality ?? ''),
      }));
    } catch {
      return [];
    }
  }

  const speechWindow = getSpeechWindow();
  const voices = speechWindow.speechSynthesis?.getVoices?.() ?? [];
  return voices.map((voice) => ({
    id: voice.voiceURI,
    name: voice.name,
    language: voice.lang,
    quality: voice.localService ? 'local' : 'remote',
  }));
}

export function speakText(text: string, options: SpeakOptions = {}) {
  if (Platform.OS !== 'web') {
    lastNativeText = text;
    lastNativeOptions = options;
    nativeSpeechState = 'reading';
    options.onStart?.();

    ExpoSpeech.stop();
    ExpoSpeech.speak(text, {
      language: options.language ?? 'es-PE',
      pitch: options.pitch ?? 1,
      rate: options.rate ?? 1,
      voice: options.voiceIdentifier,
      onDone: () => {
        nativeSpeechState = 'idle';
        options.onEnd?.();
      },
      onStopped: () => {
        nativeSpeechState = 'idle';
        options.onEnd?.();
      },
      onError: () => {
        nativeSpeechState = 'unsupported';
        options.onError?.();
      },
    });
    return true;
  }

  const speechWindow = getSpeechWindow();

  if (!isWebSpeechAvailable() || !speechWindow.speechSynthesis || !speechWindow.SpeechSynthesisUtterance) {
    options.onError?.();
    return false;
  }

  speechWindow.speechSynthesis.cancel();

  const utterance = new speechWindow.SpeechSynthesisUtterance(text);
  utterance.lang = options.language ?? 'es-PE';
  utterance.rate = options.rate ?? 1;
  utterance.pitch = options.pitch ?? 1;
  utterance.volume = 1;

  if (options.voiceIdentifier) {
    const voice = speechWindow.speechSynthesis.getVoices?.().find((item) => item.voiceURI === options.voiceIdentifier);
    if (voice) utterance.voice = voice;
  }

  utterance.onstart = options.onStart ?? null;
  utterance.onpause = options.onPause ?? null;
  utterance.onresume = options.onResume ?? null;
  utterance.onend = options.onEnd ?? null;
  utterance.onerror = options.onError ?? null;

  speechWindow.speechSynthesis.speak(utterance);
  return true;
}

export function pauseSpeech() {
  if (Platform.OS !== 'web') {
    if (nativeSpeechState !== 'reading') return false;
    if (NativeSpeech.pause) {
      NativeSpeech.pause();
    } else {
      ExpoSpeech.stop();
    }
    nativeSpeechState = 'paused';
    lastNativeOptions.onPause?.();
    return true;
  }

  const speechWindow = getSpeechWindow();
  if (!speechWindow.speechSynthesis?.speaking) return false;
  speechWindow.speechSynthesis.pause();
  return true;
}

export function resumeSpeech() {
  if (Platform.OS !== 'web') {
    if (nativeSpeechState !== 'paused' || !lastNativeText) return false;
    nativeSpeechState = 'reading';
    lastNativeOptions.onResume?.();
    if (NativeSpeech.resume) {
      NativeSpeech.resume();
    } else {
      ExpoSpeech.speak(lastNativeText, {
        language: lastNativeOptions.language ?? 'es-PE',
        pitch: lastNativeOptions.pitch ?? 1,
        rate: lastNativeOptions.rate ?? 1,
        voice: lastNativeOptions.voiceIdentifier,
        onDone: () => {
          nativeSpeechState = 'idle';
          lastNativeOptions.onEnd?.();
        },
        onStopped: () => {
          nativeSpeechState = 'idle';
          lastNativeOptions.onEnd?.();
        },
        onError: () => {
          nativeSpeechState = 'unsupported';
          lastNativeOptions.onError?.();
        },
      });
    }
    return true;
  }

  const speechWindow = getSpeechWindow();
  if (!speechWindow.speechSynthesis?.paused) return false;
  speechWindow.speechSynthesis.resume();
  return true;
}

export function stopSpeech() {
  if (Platform.OS !== 'web') {
    ExpoSpeech.stop();
    nativeSpeechState = 'idle';
    return true;
  }

  const speechWindow = getSpeechWindow();
  if (!speechWindow.speechSynthesis) return false;
  speechWindow.speechSynthesis.cancel();
  return true;
}

export function getSpeechStatus(): SpeechStatus {
  if (Platform.OS !== 'web') return nativeSpeechState;

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
