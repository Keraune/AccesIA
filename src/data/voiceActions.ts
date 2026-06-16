export type VoiceActionId =
  | 'open-captions'
  | 'pause-captions'
  | 'stop-captions'
  | 'increase-text'
  | 'open-reading'
  | 'open-settings'
  | 'enable-high-contrast'
  | 'open-simple-mode'
  | 'open-youtube'
  | 'open-whatsapp'
  | 'open-chrome'
  | 'open-camera'
  | 'open-system-display'
  | 'open-system-captions'
  | 'open-accessibility-service'
  | 'device-home'
  | 'device-back'
  | 'device-recents'
  | 'device-notifications'
  | 'device-quick-settings';

export type VoiceAssistantMode = 'clear' | 'brief' | 'guided' | 'olderAdult';

export type VoiceActionConfig = {
  id: VoiceActionId;
  label: string;
  description: string;
  keywords: string[];
  examples: string[];
  responses: Record<VoiceAssistantMode, string>;
};

export type VoiceAssistantConfig = {
  id: VoiceAssistantMode;
  label: string;
  description: string;
  listeningText: string;
  stoppedText: string;
  emptyText: string;
  unavailableText: string;
  errorText: string;
};

export const voiceAssistants: VoiceAssistantConfig[] = [
  {
    id: 'clear',
    label: 'Asistente claro',
    description: 'Respuestas completas, ordenadas y fáciles de entender.',
    listeningText: 'Estoy escuchando. Pulsa detener cuando termines de hablar.',
    stoppedText: 'Escucha detenida. Puedes iniciar otra indicación cuando lo necesites.',
    emptyText: 'No recibí una indicación. Puedes intentarlo con una frase corta.',
    unavailableText: 'El reconocimiento de voz no está disponible en este entorno. Puedes escribir la indicación en el campo manual.',
    errorText: 'No se pudo procesar el audio. Revisa el permiso del micrófono e inténtalo nuevamente.',
  },
  {
    id: 'brief',
    label: 'Asistente breve',
    description: 'Mensajes cortos y directos.',
    listeningText: 'Escuchando. Detén al terminar.',
    stoppedText: 'Escucha detenida.',
    emptyText: 'No recibí texto.',
    unavailableText: 'Voz no disponible. Escribe la indicación.',
    errorText: 'No pude procesar el audio.',
  },
  {
    id: 'guided',
    label: 'Asistente guiado',
    description: 'Explica qué pasará antes de aplicar una acción.',
    listeningText: 'Estoy escuchando tu indicación. Cuando termines, pulsa detener y revisaré la acción correspondiente.',
    stoppedText: 'La escucha se detuvo. Puedes revisar el texto detectado o volver a intentarlo.',
    emptyText: 'No detecté una indicación completa. Prueba diciendo una acción como “abrir lectura” o “activar subtítulos”.',
    unavailableText: 'Este entorno no permite reconocer voz. Usa el campo manual para escribir la acción y continuar.',
    errorText: 'Hubo un problema con el audio. Revisa el micrófono y vuelve a iniciar la escucha.',
  },
  {
    id: 'olderAdult',
    label: 'Asistente adulto mayor',
    description: 'Tono pausado, amable y con instrucciones simples.',
    listeningText: 'Te escucho. Habla con calma y pulsa detener cuando hayas terminado.',
    stoppedText: 'La escucha se detuvo. Puedes volver a intentarlo cuando quieras.',
    emptyText: 'No alcancé a escuchar una indicación. Puedes probar con una frase corta.',
    unavailableText: 'En este dispositivo no puedo escuchar la voz ahora. Puedes escribir lo que necesitas en el campo de texto.',
    errorText: 'No pude usar el micrófono correctamente. Revisa el permiso y vuelve a intentar con calma.',
  },
];

export const voiceActions: VoiceActionConfig[] = [
  {
    id: 'open-captions',
    label: 'Activar subtítulos',
    description: 'Abre el módulo de subtítulos y deja lista la preferencia de subtítulos flotantes.',
    keywords: ['subtítulo', 'subtitulo', 'subtitular', 'texto del audio', 'captions', 'activar subtítulos', 'abrir subtítulos'],
    examples: ['activar subtítulos', 'abrir subtítulos flotantes'],
    responses: {
      clear: 'Activé la preferencia de subtítulos y abrí su configuración para iniciar la burbuja cuando lo necesites.',
      brief: 'Subtítulos abiertos.',
      guided: 'Abriré Subtítulos. Desde ahí puedes iniciar la burbuja y ajustar el estilo visual.',
      olderAdult: 'Listo. Abriré Subtítulos para que puedas activar la burbuja con calma.',
    },
  },
  {
    id: 'pause-captions',
    label: 'Pausar subtítulos',
    description: 'Pausa la preferencia de subtítulos dentro de AccesIA.',
    keywords: ['pausar subtítulos', 'pausa subtítulos', 'pausar subtitulos', 'detén subtítulos un momento', 'pausa captions'],
    examples: ['pausar subtítulos'],
    responses: {
      clear: 'Pausé la preferencia de subtítulos. Puedes volver a activarlos desde Subtítulos.',
      brief: 'Subtítulos pausados.',
      guided: 'Pausaré los subtítulos. Para reanudarlos, vuelve a abrir Subtítulos y activa la burbuja.',
      olderAdult: 'He pausado los subtítulos. Puedes activarlos otra vez cuando lo necesites.',
    },
  },
  {
    id: 'stop-captions',
    label: 'Detener subtítulos',
    description: 'Desactiva la preferencia de subtítulos dentro de la aplicación.',
    keywords: ['detener subtítulos', 'deten subtítulos', 'apagar subtítulos', 'desactivar subtítulos', 'quitar subtítulos', 'cerrar subtítulos'],
    examples: ['detener subtítulos', 'desactivar subtítulos'],
    responses: {
      clear: 'Desactivé la preferencia de subtítulos en AccesIA.',
      brief: 'Subtítulos detenidos.',
      guided: 'Desactivaré los subtítulos. La burbuja puede cerrarse desde el panel flotante si está visible.',
      olderAdult: 'He detenido los subtítulos dentro de la aplicación.',
    },
  },
  {
    id: 'increase-text',
    label: 'Aumentar letra',
    description: 'Aumenta el tamaño de letra global para mejorar la lectura.',
    keywords: ['letra', 'texto grande', 'aumenta texto', 'aumentar texto', 'tamaño de letra', 'agrandar', 'letra grande', 'agranda la letra'],
    examples: ['aumentar letra', 'poner texto grande'],
    responses: {
      clear: 'Aumenté el tamaño de letra para mejorar la lectura en la aplicación.',
      brief: 'Texto aumentado.',
      guided: 'Aumentaré la letra. Puedes ajustar más niveles desde Ajustes.',
      olderAdult: 'He aumentado el tamaño de la letra para que sea más cómoda de leer.',
    },
  },
  {
    id: 'open-reading',
    label: 'Abrir lectura',
    description: 'Abre el lector para escribir o pegar texto y escucharlo en voz alta.',
    keywords: ['leer', 'lectura', 'escuchar texto', 'documento', 'leer en voz alta', 'abrir lectura', 'leer texto'],
    examples: ['abrir lectura', 'quiero escuchar un texto'],
    responses: {
      clear: 'Abrí Lectura. Pega el texto que quieras escuchar y controla la reproducción.',
      brief: 'Abriendo lectura.',
      guided: 'Te llevaré a Lectura. Allí puedes pegar texto, elegir velocidad y controlar la voz.',
      olderAdult: 'Vamos a Lectura. Allí puedes escribir o pegar un texto para escucharlo.',
    },
  },
  {
    id: 'open-settings',
    label: 'Abrir ajustes',
    description: 'Abre los ajustes de accesibilidad para personalizar la experiencia.',
    keywords: ['ajustes', 'configuración', 'configuracion', 'contraste', 'preferencias', 'opciones'],
    examples: ['abrir ajustes', 'quiero cambiar preferencias'],
    responses: {
      clear: 'Abrí Ajustes para personalizar contraste, letra, lectura y subtítulos.',
      brief: 'Abriendo ajustes.',
      guided: 'Abriré Ajustes. Desde ahí puedes cambiar contraste, letra, lectura y burbuja.',
      olderAdult: 'Abriré los ajustes para que puedas cambiar la aplicación con calma.',
    },
  },
  {
    id: 'enable-high-contrast',
    label: 'Activar alto contraste',
    description: 'Activa colores de alto contraste para lectura más clara.',
    keywords: ['alto contraste', 'contraste alto', 'activar contraste', 'más contraste', 'modo contraste'],
    examples: ['activar alto contraste'],
    responses: {
      clear: 'Activé el alto contraste para mejorar la legibilidad de la interfaz.',
      brief: 'Alto contraste activado.',
      guided: 'Activaré alto contraste. Esto ayuda a distinguir mejor textos, tarjetas y botones.',
      olderAdult: 'He activado colores con más contraste para que la pantalla se vea más clara.',
    },
  },
  {
    id: 'open-simple-mode',
    label: 'Abrir modo simple',
    description: 'Activa una experiencia con botones grandes y menos opciones visibles.',
    keywords: ['modo simple', 'modo fácil', 'simplificar', 'botones grandes', 'menos opciones'],
    examples: ['abrir modo simple', 'quiero botones grandes'],
    responses: {
      clear: 'Activé el modo simple para mostrar acciones grandes y reducir distracciones.',
      brief: 'Modo simple activado.',
      guided: 'Activaré modo simple. Verás menos opciones y botones más directos.',
      olderAdult: 'Listo. Activaré una pantalla más sencilla, con botones grandes y claros.',
    },
  },

  {
    id: 'open-youtube',
    label: 'Abrir YouTube',
    description: 'Abre YouTube en Android cuando está instalado.',
    keywords: ['abrir youtube', 'abre youtube', 'youtube', 'abrir you tube', 'reproduce youtube'],
    examples: ['abrir YouTube'],
    responses: {
      clear: 'Abriré YouTube en tu dispositivo.',
      brief: 'Abriendo YouTube.',
      guided: 'Buscaré YouTube en Android y lo abriré si está instalado.',
      olderAdult: 'Listo. Voy a abrir YouTube en tu celular.',
    },
  },
  {
    id: 'open-whatsapp',
    label: 'Abrir WhatsApp',
    description: 'Abre WhatsApp desde comandos de voz.',
    keywords: ['abrir whatsapp', 'abre whatsapp', 'whatsapp', 'abrir whats app'],
    examples: ['abrir WhatsApp'],
    responses: {
      clear: 'Abriré WhatsApp en tu dispositivo.',
      brief: 'Abriendo WhatsApp.',
      guided: 'Buscaré WhatsApp en Android y lo abriré si está instalado.',
      olderAdult: 'Listo. Voy a abrir WhatsApp.',
    },
  },
  {
    id: 'open-chrome',
    label: 'Abrir Chrome',
    description: 'Abre el navegador Chrome.',
    keywords: ['abrir chrome', 'abre chrome', 'google chrome', 'navegador'],
    examples: ['abrir Chrome'],
    responses: {
      clear: 'Abriré Chrome en tu dispositivo.',
      brief: 'Abriendo Chrome.',
      guided: 'Abriré el navegador Chrome para continuar fuera de AccesIA.',
      olderAdult: 'Listo. Voy a abrir Chrome.',
    },
  },
  {
    id: 'open-camera',
    label: 'Abrir cámara',
    description: 'Intenta abrir la aplicación de cámara del dispositivo.',
    keywords: ['abrir cámara', 'abrir camara', 'abre la cámara', 'abre la camara', 'cámara', 'camara'],
    examples: ['abrir cámara'],
    responses: {
      clear: 'Abriré la cámara del dispositivo.',
      brief: 'Abriendo cámara.',
      guided: 'Abriré la aplicación de cámara si Android la encuentra instalada.',
      olderAdult: 'Listo. Voy a abrir la cámara.',
    },
  },
  {
    id: 'open-system-display',
    label: 'Ajustes de pantalla',
    description: 'Abre los ajustes Android de pantalla para tamaño de letra, visualización y contraste del sistema.',
    keywords: ['tamaño del sistema', 'letra del celular', 'pantalla del celular', 'aumentar tamaño del celular', 'abrir ajustes de pantalla', 'display settings'],
    examples: ['abrir ajustes de pantalla'],
    responses: {
      clear: 'Abriré los ajustes de pantalla de Android para cambiar tamaño de letra o visualización del sistema.',
      brief: 'Abriendo pantalla.',
      guided: 'Te llevaré a los ajustes de pantalla. Ahí puedes cambiar tamaño de letra y visualización del dispositivo.',
      olderAdult: 'Abriré los ajustes de pantalla para que puedas aumentar la letra del celular.',
    },
  },
  {
    id: 'open-system-captions',
    label: 'Ajustes de subtítulos Android',
    description: 'Abre los ajustes de subtítulos del sistema Android.',
    keywords: ['subtítulos del sistema', 'subtitulos del sistema', 'caption settings', 'ajustes de subtítulos android', 'subtítulos android'],
    examples: ['abrir subtítulos del sistema'],
    responses: {
      clear: 'Abriré los ajustes de subtítulos de Android.',
      brief: 'Abriendo subtítulos Android.',
      guided: 'Te llevaré a los ajustes de subtítulos del sistema para cambiar estilo y tamaño.',
      olderAdult: 'Abriré la configuración de subtítulos del celular.',
    },
  },
  {
    id: 'open-accessibility-service',
    label: 'Activar servicio de accesibilidad',
    description: 'Abre ajustes de accesibilidad para habilitar acciones globales de AccesIA.',
    keywords: ['activar servicio de accesibilidad', 'permiso de accesibilidad', 'abrir accesibilidad', 'control del dispositivo', 'controlar celular'],
    examples: ['activar servicio de accesibilidad'],
    responses: {
      clear: 'Abriré Accesibilidad de Android. Activa AccesIA para permitir acciones globales como inicio, atrás y recientes.',
      brief: 'Abriendo accesibilidad.',
      guided: 'Te llevaré a Accesibilidad. Desde ahí debes activar AccesIA para que los comandos puedan controlar acciones del dispositivo.',
      olderAdult: 'Abriré Accesibilidad. Busca AccesIA y actívala para usar controles del celular.',
    },
  },
  {
    id: 'device-home',
    label: 'Ir a inicio',
    description: 'Ejecuta la acción global Inicio con el servicio de accesibilidad.',
    keywords: ['ir a inicio', 'pantalla de inicio', 'volver al inicio', 'home'],
    examples: ['ir a inicio'],
    responses: {
      clear: 'Enviaré el dispositivo a la pantalla de inicio.',
      brief: 'Inicio.',
      guided: 'Usaré el servicio de accesibilidad para ir a la pantalla de inicio.',
      olderAdult: 'Voy a llevarte a la pantalla principal del celular.',
    },
  },
  {
    id: 'device-back',
    label: 'Atrás',
    description: 'Ejecuta la acción global Atrás con el servicio de accesibilidad.',
    keywords: ['atrás', 'atras', 'volver atrás', 'volver atras', 'regresar'],
    examples: ['atrás'],
    responses: {
      clear: 'Ejecutaré la acción Atrás.',
      brief: 'Atrás.',
      guided: 'Usaré el servicio de accesibilidad para volver a la pantalla anterior.',
      olderAdult: 'Voy a regresar a la pantalla anterior.',
    },
  },
  {
    id: 'device-recents',
    label: 'Apps recientes',
    description: 'Muestra aplicaciones recientes con el servicio de accesibilidad.',
    keywords: ['apps recientes', 'aplicaciones recientes', 'abrir recientes', 'recientes'],
    examples: ['abrir recientes'],
    responses: {
      clear: 'Abriré la vista de aplicaciones recientes.',
      brief: 'Recientes.',
      guided: 'Usaré una acción global para mostrar las aplicaciones recientes.',
      olderAdult: 'Mostraré las aplicaciones recientes.',
    },
  },
  {
    id: 'device-notifications',
    label: 'Notificaciones',
    description: 'Abre el panel de notificaciones mediante accesibilidad.',
    keywords: ['abrir notificaciones', 'notificaciones', 'panel de notificaciones'],
    examples: ['abrir notificaciones'],
    responses: {
      clear: 'Abriré el panel de notificaciones.',
      brief: 'Notificaciones.',
      guided: 'Usaré el servicio de accesibilidad para mostrar tus notificaciones.',
      olderAdult: 'Voy a abrir las notificaciones del celular.',
    },
  },
  {
    id: 'device-quick-settings',
    label: 'Ajustes rápidos',
    description: 'Abre el panel de ajustes rápidos mediante accesibilidad.',
    keywords: ['ajustes rápidos', 'ajustes rapidos', 'panel rápido', 'panel rapido', 'wifi bluetooth'],
    examples: ['abrir ajustes rápidos'],
    responses: {
      clear: 'Abriré el panel de ajustes rápidos.',
      brief: 'Ajustes rápidos.',
      guided: 'Usaré el servicio de accesibilidad para mostrar los controles rápidos del sistema.',
      olderAdult: 'Voy a abrir los ajustes rápidos del celular.',
    },
  },
];

export function getVoiceAssistant(mode: VoiceAssistantMode) {
  return voiceAssistants.find((assistant) => assistant.id === mode) ?? voiceAssistants[0];
}

export function normalizeVoiceText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findVoiceAction(transcript: string) {
  const normalizedTranscript = normalizeVoiceText(transcript);
  return voiceActions.find((action) =>
    action.keywords.some((keyword) => normalizedTranscript.includes(normalizeVoiceText(keyword))),
  );
}

export function getUnrecognizedResponse(mode: VoiceAssistantMode) {
  return {
    clear: 'No encontré una acción para esa indicación. Puedes pedir abrir YouTube, subtítulos, lectura, letra grande, alto contraste, inicio, atrás o ajustes.',
    brief: 'No reconocí una acción.',
    guided: 'No pude relacionar la indicación con una acción. Prueba con: abrir YouTube, activar subtítulos, abrir lectura, aumentar letra, activar alto contraste, ir a inicio o abrir ajustes.',
    olderAdult: 'No logré entender qué acción necesitas. Puedes intentar con una frase corta, por ejemplo: abrir YouTube.',
  }[mode];
}
