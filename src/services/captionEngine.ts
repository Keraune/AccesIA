import type {
  CaptionLanguageMode,
  CaptionPositionMode,
  CaptionSizeMode,
  CaptionThemeMode,
  LiveCaptionSource,
  LiveCaptionStatus,
} from '@/context/AccessibilityContext';

export type CaptionPreferences = {
  source: LiveCaptionSource;
  language: CaptionLanguageMode;
  size: CaptionSizeMode;
  position: CaptionPositionMode;
  theme: CaptionThemeMode;
};

export type CaptionCapability = {
  microphone: boolean;
  deviceAudio: boolean;
  requiresMediaProjection: boolean;
  status: LiveCaptionStatus;
  mode: 'nearby-speech' | 'speaker-audio' | 'system-captions';
};

export function getCaptionCapability(source: LiveCaptionSource): CaptionCapability {
  if (source === 'video') {
    return {
      microphone: true,
      deviceAudio: false,
      requiresMediaProjection: false,
      status: 'listening',
      mode: 'speaker-audio',
    };
  }

  if (source === 'device' || source === 'classroom' || source === 'music') {
    return {
      microphone: true,
      deviceAudio: false,
      requiresMediaProjection: false,
      status: 'listening',
      mode: 'nearby-speech',
    };
  }

  return {
    microphone: false,
    deviceAudio: true,
    requiresMediaProjection: true,
    status: 'waitingPermission',
    mode: 'system-captions',
  };
}

export function getCaptionStatusLabel(status: LiveCaptionStatus) {
  const labels: Record<LiveCaptionStatus, string> = {
    inactive: 'Inactivo',
    waitingPermission: 'Esperando permiso',
    listening: 'Escuchando',
    captioning: 'Subtitulando',
    paused: 'Pausado',
    permissionError: 'Error de permiso',
  };

  return labels[status];
}

export function getCaptionStatusMessage(status: LiveCaptionStatus) {
  const messages: Record<LiveCaptionStatus, string> = {
    inactive: 'Activa la burbuja para iniciar.',
    waitingPermission: 'Esperando permiso de audio.',
    listening: 'Escuchando audio…',
    captioning: 'Subtítulos activos',
    paused: 'Subtítulos pausados',
    permissionError: 'Revisa los permisos de micrófono y superposición.',
  };

  return messages[status];
}

export function buildCaptionEnginePlan(preferences: CaptionPreferences) {
  const capability = getCaptionCapability(preferences.source);

  return {
    capability,
    preferences,
    readyForMicrophoneCapture: capability.microphone,
    readyForMediaProjection: capability.requiresMediaProjection,
  };
}

// Technical production note:
// Android SpeechRecognizer listens through the microphone. AccesIA can subtitle nearby speech
// and video audio played through the phone speaker. Direct internal audio capture from other
// applications needs MediaProjection + AudioPlaybackCapture and a speech-to-text engine that
// accepts PCM audio, because Android SpeechRecognizer does not receive raw playback buffers.
