import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

import type { CaptionLanguageMode } from '@/context/AccessibilityContext';

export type VoiceRecognitionStatus = 'recognized' | 'unavailable' | 'permissionDenied' | 'error' | 'stopped';

export type VoiceRecognitionResult = {
  transcript: string;
  confidence: number;
  source: 'browser' | 'device';
  status: VoiceRecognitionStatus;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<{
    0: {
      transcript: string;
      confidence?: number;
    };
  }>;
};

type SpeechRecognitionErrorLike = {
  error?: string;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous?: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type RecognitionWindow = typeof globalThis & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

type NativeVoiceResult = {
  transcript?: string;
  confidence?: number;
  source?: 'device';
  status?: VoiceRecognitionStatus;
};

type NativeVoiceModule = {
  isAvailable: () => Promise<boolean>;
  startListening: (options: { language: CaptionLanguageMode }) => Promise<NativeVoiceResult>;
  stopListening: () => Promise<boolean>;
};

type TranscriptListener = (transcript: string, confidence: number) => void;

const NativeVoice = NativeModules.AccesiaVoice as NativeVoiceModule | undefined;

let activeRecognition: SpeechRecognitionLike | null = null;
let activeResolve: ((result: VoiceRecognitionResult) => void) | null = null;
let activeTranscript = '';
let activeConfidence = 0;
let activeSessionId = 0;
let manualStopRequested = false;
let restartingRecognition = false;
let nativeListening = false;

function getRecognitionConstructor() {
  const recognitionWindow = globalThis as RecognitionWindow;
  return recognitionWindow.SpeechRecognition ?? recognitionWindow.webkitSpeechRecognition;
}

function clearActiveRecognition() {
  activeRecognition = null;
  activeResolve = null;
  activeTranscript = '';
  activeConfidence = 0;
  manualStopRequested = false;
  restartingRecognition = false;
}

function buildFinalResult(status: VoiceRecognitionStatus): VoiceRecognitionResult {
  return {
    confidence: activeConfidence,
    source: 'browser',
    status: activeTranscript ? 'recognized' : status,
    transcript: activeTranscript,
  };
}

function resolveActiveRecognition(result: VoiceRecognitionResult) {
  const resolve = activeResolve;
  clearActiveRecognition();
  resolve?.(result);
}

async function requestAndroidMicrophonePermission() {
  if (Platform.OS !== 'android') return true;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: 'Permiso de micrófono',
      message: 'AccesIA necesita usar el micrófono para reconocer comandos de voz.',
      buttonPositive: 'Permitir',
      buttonNegative: 'Cancelar',
    },
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

function normalizeNativeResult(result: NativeVoiceResult): VoiceRecognitionResult {
  const transcript = result.transcript?.trim() ?? '';
  const status = result.status ?? (transcript ? 'recognized' : 'stopped');
  return {
    transcript,
    confidence: result.confidence ?? 0,
    source: 'device',
    status: transcript && status !== 'permissionDenied' ? 'recognized' : status,
  };
}

export function isVoiceRecognitionAvailable() {
  if (Platform.OS === 'android') return Boolean(NativeVoice);
  return Boolean(getRecognitionConstructor());
}

export function stopListeningForCommand() {
  if (Platform.OS === 'android' && NativeVoice && nativeListening) {
    nativeListening = false;
    void NativeVoice.stopListening();
    return true;
  }

  if (!activeRecognition) {
    return false;
  }

  const recognition = activeRecognition;
  manualStopRequested = true;
  const result = buildFinalResult('stopped');
  resolveActiveRecognition(result);

  try {
    recognition.stop();
  } catch {
    recognition.abort?.();
  }

  return true;
}

export async function listenForCommand(
  onTranscript?: TranscriptListener,
  options: { language?: CaptionLanguageMode } = {},
): Promise<VoiceRecognitionResult> {
  if (Platform.OS === 'android') {
    if (!NativeVoice) {
      return {
        confidence: 0,
        source: 'device',
        status: 'unavailable',
        transcript: '',
      };
    }

    const hasPermission = await requestAndroidMicrophonePermission();
    if (!hasPermission) {
      return {
        confidence: 0,
        source: 'device',
        status: 'permissionDenied',
        transcript: '',
      };
    }

    try {
      nativeListening = true;
      const language = options.language && options.language !== 'auto' ? options.language : 'es-PE';
      const result = await NativeVoice.startListening({ language });
      nativeListening = false;
      const normalized = normalizeNativeResult(result);
      if (normalized.transcript) {
        onTranscript?.(normalized.transcript, normalized.confidence);
      }
      return normalized;
    } catch {
      nativeListening = false;
      return {
        confidence: 0,
        source: 'device',
        status: 'error',
        transcript: '',
      };
    }
  }

  const Recognition = getRecognitionConstructor();

  if (!Recognition) {
    return Promise.resolve({
      confidence: 0,
      source: 'device',
      status: 'unavailable',
      transcript: '',
    });
  }

  stopListeningForCommand();

  return new Promise((resolve) => {
    const recognition = new Recognition();
    const sessionId = activeSessionId + 1;
    activeSessionId = sessionId;
    activeRecognition = recognition;
    activeResolve = resolve;
    activeTranscript = '';
    activeConfidence = 0;
    manualStopRequested = false;
    restartingRecognition = false;

    function isCurrentSession() {
      return activeRecognition === recognition && activeSessionId === sessionId;
    }

    function resolveOnce(status: VoiceRecognitionStatus) {
      if (!isCurrentSession()) return;
      const result = buildFinalResult(status);
      resolveActiveRecognition(result);
    }

    function startRecognition() {
      try {
        recognition.start();
      } catch {
        resolveOnce(activeTranscript ? 'recognized' : 'error');
      }
    }

    recognition.lang = options.language && options.language !== 'auto' ? options.language : 'es-PE';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      if (!isCurrentSession()) return;
      const latestIndex = Math.max(0, event.results.length - 1);
      const bestResult = event.results[latestIndex]?.[0];
      const nextTranscript = bestResult?.transcript?.trim() ?? '';

      if (!nextTranscript) return;

      activeTranscript = nextTranscript;
      activeConfidence = bestResult?.confidence ?? activeConfidence;
      onTranscript?.(activeTranscript, activeConfidence);
    };
    recognition.onerror = (event) => {
      if (!isCurrentSession()) return;

      const recoverableError = event.error === 'no-speech' || event.error === 'aborted';
      if (recoverableError && !manualStopRequested) {
        return;
      }

      resolveOnce('error');
    };
    recognition.onend = () => {
      if (!isCurrentSession()) return;

      if (manualStopRequested) {
        resolveOnce(activeTranscript ? 'recognized' : 'stopped');
        return;
      }

      if (restartingRecognition) return;
      restartingRecognition = true;
      setTimeout(() => {
        if (!isCurrentSession() || manualStopRequested) return;
        restartingRecognition = false;
        startRecognition();
      }, 180);
    };

    startRecognition();
  });
}
