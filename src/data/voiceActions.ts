export type VoiceActionId = 'open-captions' | 'increase-text' | 'open-reading' | 'open-settings';

export type VoiceAssistantMode = 'clear' | 'brief' | 'guided' | 'olderAdult';

export type VoiceActionConfig = {
  id: VoiceActionId;
  label: string;
  keywords: string[];
  responses: Record<VoiceAssistantMode, string>;
};

export type VoiceAssistantConfig = {
  id: VoiceAssistantMode;
  label: string;
  description: string;
};

export const voiceAssistants: VoiceAssistantConfig[] = [
  {
    id: 'clear',
    label: 'Asistente claro',
    description: 'Respuestas completas y fáciles de entender.',
  },
  {
    id: 'brief',
    label: 'Asistente breve',
    description: 'Mensajes cortos y directos.',
  },
  {
    id: 'guided',
    label: 'Asistente guiado',
    description: 'Explica el siguiente paso antes de actuar.',
  },
  {
    id: 'olderAdult',
    label: 'Asistente adulto mayor',
    description: 'Tono pausado, amable y con instrucciones simples.',
  },
];

export const voiceActions: VoiceActionConfig[] = [
  {
    id: 'open-captions',
    label: 'Activar subtítulos',
    keywords: ['subtítulo', 'subtitulo', 'subtitular', 'texto del audio', 'captions'],
    responses: {
      clear: 'Activé la preferencia de subtítulos. Puedes abrir la burbuja desde Subtítulos para verla sobre otras apps.',
      brief: 'Subtítulos activados.',
      guided: 'Activé la preferencia. Ahora abre Subtítulos para iniciar la burbuja del sistema.',
      olderAdult: 'Listo. Dejé los subtítulos activados. Para verlos sobre otras aplicaciones, usa el botón de burbuja.',
    },
  },
  {
    id: 'increase-text',
    label: 'Aumentar texto',
    keywords: ['letra', 'texto grande', 'aumenta texto', 'tamaño de letra', 'agrandar'],
    responses: {
      clear: 'Aumenté el tamaño de letra para mejorar la lectura en la aplicación.',
      brief: 'Texto aumentado.',
      guided: 'Aumenté la letra. Puedes ajustar más niveles desde Ajustes.',
      olderAdult: 'He aumentado el tamaño de la letra para que sea más cómoda de leer.',
    },
  },
  {
    id: 'open-reading',
    label: 'Abrir lectura',
    keywords: ['leer', 'lectura', 'escuchar texto', 'documento', 'leer en voz alta'],
    responses: {
      clear: 'Abrí la función de lectura. Pega el texto que quieras escuchar.',
      brief: 'Abriendo lectura.',
      guided: 'Te llevaré a Lectura. Allí puedes pegar texto y controlar la voz.',
      olderAdult: 'Vamos a Lectura. Allí puedes escribir o pegar un texto para escucharlo.',
    },
  },
  {
    id: 'open-settings',
    label: 'Abrir ajustes',
    keywords: ['ajustes', 'configuración', 'configuracion', 'contraste', 'preferencias'],
    responses: {
      clear: 'Abrí Ajustes para personalizar contraste, letra, lectura y subtítulos.',
      brief: 'Abriendo ajustes.',
      guided: 'Abriré Ajustes. Desde ahí puedes cambiar contraste, letra y burbuja.',
      olderAdult: 'Abriré los ajustes para que puedas cambiar la aplicación con calma.',
    },
  },
];

export function findVoiceAction(transcript: string) {
  const normalizedTranscript = transcript.toLowerCase();
  return voiceActions.find((action) =>
    action.keywords.some((keyword) => normalizedTranscript.includes(keyword.toLowerCase())),
  );
}

export function getUnrecognizedResponse(mode: VoiceAssistantMode) {
  return {
    clear: 'No encontré una acción para esa indicación. Intenta pedir subtítulos, lectura, letra grande o ajustes.',
    brief: 'No reconocí una acción.',
    guided: 'No pude relacionar la indicación con una acción. Prueba con: activar subtítulos, leer texto, aumentar letra o abrir ajustes.',
    olderAdult: 'No logré entender qué acción necesitas. Puedes intentar con una frase corta, por ejemplo: abrir lectura.',
  }[mode];
}
