export type VoiceRecognitionStatus = 'recognized' | 'unavailable' | 'error' | 'stopped';

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
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type RecognitionWindow = typeof globalThis & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

type TranscriptListener = (transcript: string, confidence: number) => void;

let activeRecognition: SpeechRecognitionLike | null = null;
let activeResolve: ((result: VoiceRecognitionResult) => void) | null = null;
let activeTranscript = '';
let activeConfidence = 0;

function getRecognitionConstructor() {
  const recognitionWindow = globalThis as RecognitionWindow;
  return recognitionWindow.SpeechRecognition ?? recognitionWindow.webkitSpeechRecognition;
}

function clearActiveRecognition() {
  activeRecognition = null;
  activeResolve = null;
  activeTranscript = '';
  activeConfidence = 0;
}

function buildFinalResult(status: VoiceRecognitionStatus): VoiceRecognitionResult {
  return {
    confidence: activeConfidence,
    source: 'browser',
    status: activeTranscript ? 'recognized' : status,
    transcript: activeTranscript,
  };
}

export function isVoiceRecognitionAvailable() {
  return Boolean(getRecognitionConstructor());
}

export function stopListeningForCommand() {
  if (!activeRecognition) {
    return false;
  }

  const recognition = activeRecognition;
  const resolve = activeResolve;
  const result = buildFinalResult('stopped');
  clearActiveRecognition();
  recognition.stop();
  resolve?.(result);
  return true;
}

export function listenForCommand(onTranscript?: TranscriptListener): Promise<VoiceRecognitionResult> {
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
    activeRecognition = recognition;
    activeResolve = resolve;
    activeTranscript = '';
    activeConfidence = 0;

    function resolveOnce(status: VoiceRecognitionStatus) {
      if (activeRecognition !== recognition) return;
      const result = buildFinalResult(status);
      clearActiveRecognition();
      resolve(result);
    }

    recognition.lang = 'es-PE';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const latestIndex = Math.max(0, event.results.length - 1);
      const bestResult = event.results[latestIndex]?.[0];
      const nextTranscript = bestResult?.transcript?.trim() ?? '';

      if (!nextTranscript) return;

      activeTranscript = nextTranscript;
      activeConfidence = bestResult?.confidence ?? activeConfidence;
      onTranscript?.(activeTranscript, activeConfidence);
    };
    recognition.onerror = () => {
      resolveOnce('error');
    };
    recognition.onend = () => {
      resolveOnce(activeTranscript ? 'recognized' : 'stopped');
    };
    recognition.start();
  });
}
