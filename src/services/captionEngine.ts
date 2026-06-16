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
};

export function getCaptionCapability(source: LiveCaptionSource): CaptionCapability {
  if (source === 'device') {
    return {
      microphone: true,
      deviceAudio: false,
      requiresMediaProjection: false,
      status: 'waitingPermission',
    };
  }

  return {
    microphone: false,
    deviceAudio: true,
    requiresMediaProjection: true,
    status: 'waitingPermission',
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
    permissionError: 'Revisa los permisos de audio y superposición.',
  };

  return messages[status];
}

export function buildCaptionEnginePlan(preferences: CaptionPreferences) {
  const capability = getCaptionCapability(preferences.source);

  return {
    capability,
    preferences,
    readyForMicrophoneCapture: preferences.source === 'device',
    readyForMediaProjection: capability.requiresMediaProjection,
  };
}

// Android production note:
// Microphone capture can be wired with SpeechRecognizer or an offline/on-device ASR layer.
// Device/media audio capture must be implemented in native Android using MediaProjection plus
// AudioPlaybackCaptureConfiguration on Android 10+. The React Native layer should only manage
// preferences, permission flow, and visible states; raw audio capture belongs in the native service.
