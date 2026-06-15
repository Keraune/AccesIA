import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, touchTarget } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { LiveCaptionSource, useAccessibility } from '@/context/AccessibilityContext';

type CaptionItem = {
  line: string;
  hint: string;
  sound: string;
};

const captionBank: Record<LiveCaptionSource, CaptionItem[]> = {
  device: [
    {
      line: 'Se detecta una voz cercana. La explicación principal está siendo convertida en texto.',
      hint: 'Audio cercano',
      sound: 'Voz principal',
    },
    {
      line: 'La persona menciona una indicación importante para continuar la actividad.',
      hint: 'Conversación',
      sound: 'Habla clara',
    },
    {
      line: 'Hay ruido de fondo, pero AccesIA prioriza la voz más estable.',
      hint: 'Entorno',
      sound: 'Ruido moderado',
    },
  ],
  video: [
    {
      line: 'El video explica cómo activar las opciones de accesibilidad desde el menú principal.',
      hint: 'Video',
      sound: 'Narrador',
    },
    {
      line: 'En pantalla aparece un ejemplo con botones grandes y texto de alto contraste.',
      hint: 'Contenido visual',
      sound: 'Audio multimedia',
    },
    {
      line: 'El presentador resume los pasos para configurar la experiencia del usuario.',
      hint: 'Video',
      sound: 'Voz del video',
    },
  ],
  music: [
    {
      line: 'Música detectada. Se muestran descripciones del audio para acompañar la experiencia.',
      hint: 'Música',
      sound: 'Ritmo constante',
    },
    {
      line: 'La pista mantiene un volumen medio con cambios suaves de intensidad.',
      hint: 'Descripción sonora',
      sound: 'Instrumental',
    },
    {
      line: 'Se identifica un fragmento vocal breve dentro del contenido de audio.',
      hint: 'Audio musical',
      sound: 'Voz breve',
    },
  ],
  classroom: [
    {
      line: 'El docente está explicando la actividad de hoy y los criterios de entrega.',
      hint: 'Clase',
      sound: 'Docente',
    },
    {
      line: 'Recuerden revisar la información principal antes de continuar.',
      hint: 'Indicaciones',
      sound: 'Voz principal',
    },
    {
      line: 'Se solicita revisar la navegación, la legibilidad y la facilidad de uso.',
      hint: 'Clase',
      sound: 'Exposición',
    },
  ],
};

const sourceLabel: Record<LiveCaptionSource, string> = {
  device: 'Audio cercano',
  video: 'Video',
  music: 'Música',
  classroom: 'Clase',
};

export function LiveCaptionOverlay() {
  const {
    colors,
    fontMultiplier,
    liveCaptionSource,
    liveCaptionsActive,
    settings,
    startLiveCaptions,
    stopLiveCaptions,
  } = useAccessibility();
  const [captionIndex, setCaptionIndex] = useState(0);
  const [soundLevel, setSoundLevel] = useState(36);
  const [expanded, setExpanded] = useState(true);

  const captions = useMemo(() => captionBank[liveCaptionSource], [liveCaptionSource]);
  const currentCaption = captions[captionIndex % captions.length];

  useEffect(() => {
    setCaptionIndex(0);
  }, [liveCaptionSource]);

  useEffect(() => {
    if (!liveCaptionsActive) return undefined;

    const interval = setInterval(() => {
      setCaptionIndex((current) => (current + 1) % captions.length);
      setSoundLevel((current) => (current >= 84 ? 34 : current + 16));
    }, 2600);

    return () => clearInterval(interval);
  }, [captions.length, liveCaptionsActive]);

  if (!liveCaptionsActive) {
    return (
      <Pressable
        accessibilityHint="Activa subtítulos flotantes para mostrar texto sobre el contenido con audio."
        accessibilityLabel="Activar subtítulos flotantes"
        accessibilityRole="button"
        onPress={() => {
          setExpanded(true);
          startLiveCaptions(liveCaptionSource);
        }}
        style={({ pressed }) => [
          styles.floatingButton,
          {
            backgroundColor: colors.primaryDeep,
            borderColor: settings.highContrast ? colors.border : 'rgba(255,255,255,0.24)',
            opacity: pressed ? 0.86 : 1,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <Ionicons color={colors.white} name="chatbox-ellipses" size={24} />
        <View style={[styles.floatingPulse, { backgroundColor: colors.accent }]} />
      </Pressable>
    );
  }

  if (!expanded) {
    return (
      <Pressable
        accessibilityHint="Expande el panel de subtítulos flotantes."
        accessibilityLabel="Subtítulos activos"
        accessibilityRole="button"
        onPress={() => setExpanded(true)}
        style={({ pressed }) => [
          styles.compactOverlay,
          {
            backgroundColor: colors.primaryDeep,
            borderColor: settings.highContrast ? colors.border : 'rgba(255,255,255,0.16)',
            opacity: pressed ? 0.88 : 1,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <Ionicons color={colors.accent} name="radio" size={18} />
        <Text
          numberOfLines={1}
          style={[
            styles.compactText,
            {
              color: colors.white,
              fontSize: fontSizes.sm * fontMultiplier,
              lineHeight: lineHeights.sm * fontMultiplier,
            },
          ]}
        >
          {currentCaption.line}
        </Text>
      </Pressable>
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={`Subtítulos flotantes activos. ${currentCaption.line}`}
      style={[
        styles.overlayPanel,
        {
          backgroundColor: colors.primaryDeep,
          borderColor: settings.highContrast ? colors.border : 'rgba(255,255,255,0.16)',
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View style={styles.overlayTopRow}>
        <View style={styles.sourceCluster}>
          <View style={[styles.liveDot, { backgroundColor: colors.accent }]} />
          <Text
            style={[
              styles.sourceText,
              {
                color: colors.white,
                fontSize: fontSizes.xs * fontMultiplier,
                lineHeight: lineHeights.xs * fontMultiplier,
              },
            ]}
          >
            {sourceLabel[liveCaptionSource]} · {currentCaption.sound}
          </Text>
        </View>

        <View style={styles.overlayActions}>
          <Pressable
            accessibilityLabel="Minimizar subtítulos"
            accessibilityRole="button"
            onPress={() => setExpanded(false)}
            style={styles.overlayIconButton}
          >
            <Ionicons color={colors.white} name="remove-outline" size={18} />
          </Pressable>
          <Pressable
            accessibilityLabel="Detener subtítulos"
            accessibilityRole="button"
            onPress={stopLiveCaptions}
            style={styles.overlayIconButton}
          >
            <Ionicons color={colors.white} name="close-outline" size={18} />
          </Pressable>
        </View>
      </View>

      <Text
        style={[
          styles.captionLine,
          {
            color: colors.white,
            fontSize: fontSizes.lg * fontMultiplier,
            lineHeight: lineHeights.xl * fontMultiplier,
          },
        ]}
      >
        {currentCaption.line}
      </Text>

      <View style={styles.soundRow}>
        <View style={[styles.soundTrack, { backgroundColor: 'rgba(255,255,255,0.14)' }]}> 
          <View style={[styles.soundFill, { width: `${soundLevel}%`, backgroundColor: colors.accent }]} />
        </View>
        <Text
          style={[
            styles.soundLabel,
            {
              color: 'rgba(255,255,255,0.72)',
              fontSize: fontSizes.xs * fontMultiplier,
              lineHeight: lineHeights.xs * fontMultiplier,
            },
          ]}
        >
          {currentCaption.hint}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    right: spacing.xl,
    bottom: 108,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.pill,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 30,
    elevation: 18,
    zIndex: 80,
  },
  floatingPulse: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: radius.pill,
  },
  compactOverlay: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    bottom: 100,
    minHeight: touchTarget.comfortable,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 30,
    elevation: 18,
    zIndex: 80,
  },
  compactText: {
    flex: 1,
    fontWeight: fontWeights.bold,
  },
  overlayPanel: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: 100,
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.xxl,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 34,
    elevation: 20,
    zIndex: 80,
  },
  overlayTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sourceCluster: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
  },
  sourceText: {
    fontWeight: fontWeights.extraBold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  overlayActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  overlayIconButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  captionLine: {
    fontWeight: fontWeights.black,
    letterSpacing: -0.25,
  },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  soundTrack: {
    flex: 1,
    height: 10,
    overflow: 'hidden',
    borderRadius: radius.pill,
  },
  soundFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  soundLabel: {
    minWidth: 92,
    fontWeight: fontWeights.bold,
    textAlign: 'right',
  },
});
