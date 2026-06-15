export type VoiceRecognitionResult = {
  transcript: string;
  confidence: number;
  source: 'browser' | 'guided';
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

const fallbackCommands = [
  'AccesIA, aumenta el tamaño de letra y activa alto contraste.',
  'AccesIA, abre subtítulos para la clase virtual.',
  'AccesIA, quiero escuchar el documento actual.',
];

function getRecognitionConstructor() {
  const recognitionWindow = globalThis as RecognitionWindow;
  return recognitionWindow.SpeechRecognition ?? recognitionWindow.webkitSpeechRecognition;
}

export function isVoiceRecognitionAvailable() {
  return Boolean(getRecognitionConstructor());
}

export function listenForCommand(timeoutMs = 4200): Promise<VoiceRecognitionResult> {
  const Recognition = getRecognitionConstructor();

  if (!Recognition) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = Math.floor(Math.random() * fallbackCommands.length);
        resolve({
          confidence: 0.86,
          source: 'guided',
          transcript: fallbackCommands[index],
        });
      }, 950);
    });
  }

  return new Promise((resolve) => {
    const recognition = new Recognition();
    let resolved = false;
    const timeout = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      recognition.stop();
      resolve({
        confidence: 0.82,
        source: 'guided',
        transcript: fallbackCommands[0],
      });
    }, timeoutMs);

    recognition.lang = 'es-PE';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      const bestResult = event.results[0]?.[0];
      resolve({
        confidence: bestResult?.confidence ?? 0.9,
        source: 'browser',
        transcript: bestResult?.transcript ?? fallbackCommands[0],
      });
    };
    recognition.onerror = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      resolve({
        confidence: 0.86,
        source: 'guided',
        transcript: fallbackCommands[1],
      });
    };
    recognition.onend = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      resolve({
        confidence: 0.84,
        source: 'guided',
        transcript: fallbackCommands[2],
      });
    };
    recognition.start();
  });
}
