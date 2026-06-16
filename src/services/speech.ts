import { Platform } from 'react-native';
import * as ExpoSpeech from 'expo-speech';

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

export function speakText(text: string, options: SpeakOptions = {}) {
  if (Platform.OS !== 'web') {
    lastNativeText = text;
    lastNativeOptions = options;
    nativeSpeechState = 'reading';
    options.onStart?.();

    ExpoSpeech.stop();
    ExpoSpeech.speak(text, {
      language: 'es-PE',
      pitch: options.pitch ?? 1,
      rate: options.rate ?? 1,
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
  if (Platform.OS !== 'web') {
    if (nativeSpeechState !== 'reading') return false;
    ExpoSpeech.stop();
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
    ExpoSpeech.speak(lastNativeText, {
      language: 'es-PE',
      pitch: lastNativeOptions.pitch ?? 1,
      rate: lastNativeOptions.rate ?? 1,
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
