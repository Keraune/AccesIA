import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AccessibleButton } from '@/components/AccessibleButton';
import { AppHeader } from '@/components/AppHeader';
import { IconBadge } from '@/components/IconBadge';
import { InfoCard } from '@/components/InfoCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';

const captions = [
  'El profesor está explicando la actividad de hoy.',
  'Recuerden validar la aplicación con posibles usuarios.',
  'La accesibilidad debe considerarse desde el diseño inicial.',
  'Los subtítulos ayudan a comprender contenido multimedia sin depender del audio.',
];

const descriptions = [
  'Se observa una clase virtual con una presentación en pantalla.',
  'El docente señala los criterios de evaluación del prototipo.',
  'La pantalla muestra una demostración con indicadores visuales grandes.',
];

export default function CaptionsScreen() {
  const { colors, fontMultiplier, settings, setSubtitlesEnabled } = useAccessibility();
  const [captionIndex, setCaptionIndex] = useState(0);
  const [descriptionIndex, setDescriptionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!settings.subtitlesEnabled || !isPlaying) {
      return undefined;
    }

    const interval = setInterval(() => {
      setCaptionIndex((current) => (current + 1) % captions.length);
      setDescriptionIndex((current) => (current + 1) % descriptions.length);
      setProgress((current) => (current >= 100 ? 0 : current + 12));
    }, 2200);

    return () => clearInterval(interval);
  }, [isPlaying, settings.subtitlesEnabled]);

  function startCaptions() {
    setSubtitlesEnabled(true);
    setIsPlaying(true);
  }

  function pauseCaptions() {
    setIsPlaying(false);
  }

  function stopCaptions() {
    setIsPlaying(false);
    setSubtitlesEnabled(false);
    setProgress(0);
    setCaptionIndex(0);
    setDescriptionIndex(0);
  }

  const captionText = settings.subtitlesEnabled
    ? captions[captionIndex]
    : 'Subtítulos desactivados.';

  const descriptionText = settings.subtitlesEnabled
    ? descriptions[descriptionIndex]
    : 'Activa subtítulos para ver descripciones accesibles del contenido multimedia.';

  return (
    <ScreenContainer>
      <AppHeader title="Subtítulos" subtitle="Contenido multimedia accesible" />

      <View
        accessible
        accessibilityLabel="Reproductor multimedia simulado para subtítulos automáticos."
        style={[
          styles.player,
          {
            backgroundColor: colors.primaryDeep,
            borderColor: settings.highContrast ? colors.border : 'rgba(255,255,255,0.16)',
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.playerHeader}>
          <View style={[styles.mediaTag, { backgroundColor: 'rgba(255,255,255,0.12)' }]}> 
            <Ionicons color={colors.white} name="videocam-outline" size={16} />
            <Text
              style={[
                styles.mediaTagText,
                {
                  color: colors.white,
                  fontSize: fontSizes.xs * fontMultiplier,
                  lineHeight: lineHeights.xs * fontMultiplier,
                },
              ]}
            >
              Clase virtual
            </Text>
          </View>
          <IconBadge icon="chatbubbles-outline" inverted size="sm" tone="accent" />
        </View>

        <View style={styles.playArea}>
          <View style={[styles.playButton, { backgroundColor: 'rgba(255,255,255,0.14)' }]}> 
            <Ionicons color={colors.white} name={isPlaying ? 'pause' : 'play'} size={30} />
          </View>
          <Text
            style={[
              styles.playerTitle,
              {
                color: colors.white,
                fontSize: fontSizes.xxl * fontMultiplier,
                lineHeight: lineHeights.xxl * fontMultiplier,
              },
            ]}
          >
            Simulación multimedia
          </Text>
          <Text
            style={[
              styles.playerCaption,
              {
                color: 'rgba(255,255,255,0.72)',
                fontSize: fontSizes.sm * fontMultiplier,
                lineHeight: lineHeights.sm * fontMultiplier,
              },
            ]}
          >
            Reproductor accesible con controles visibles, subtítulos y descripción.
          </Text>
        </View>

        <View style={[styles.mediaProgressTrack, { backgroundColor: 'rgba(255,255,255,0.16)' }]}> 
          <View style={[styles.mediaProgressFill, { width: `${progress}%`, backgroundColor: colors.accent }]} />
        </View>
      </View>

      <View
        accessible
        accessibilityLabel={`Subtítulo actual: ${captionText}`}
        style={[
          styles.captionBox,
          {
            backgroundColor: colors.surface,
            borderColor: settings.subtitlesEnabled ? colors.accent : colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.captionHeader}>
          <IconBadge icon="text-outline" size="sm" tone="accent" />
          <Text
            style={[
              styles.captionLabel,
              {
                color: colors.textMuted,
                fontSize: fontSizes.sm * fontMultiplier,
                lineHeight: lineHeights.sm * fontMultiplier,
              },
            ]}
          >
            Subtítulo en tiempo real
          </Text>
        </View>
        <Text
          style={[
            styles.captionText,
            {
              color: colors.text,
              fontSize: fontSizes.xl * fontMultiplier,
              lineHeight: lineHeights.xxl * fontMultiplier,
            },
          ]}
        >
          {captionText}
        </Text>
      </View>

      <InfoCard
        icon="image-outline"
        text={descriptionText}
        title="Descripción del contenido"
        tone="secondary"
      />

      <InfoCard
        icon={settings.subtitlesEnabled ? 'radio-outline' : 'notifications-off-outline'}
        text={
          settings.subtitlesEnabled
            ? 'Sonido detectado: voz principal de la clase. Se muestran subtítulos y descripción textual.'
            : 'No hay sonido importante detectado.'
        }
        title="Indicador visual"
        tone={settings.subtitlesEnabled ? 'success' : 'default'}
      />

      <View style={styles.buttonRow}>
        <AccessibleButton
          accessibilityHint="Activa los subtítulos automáticos simulados y reproduce la demostración multimedia."
          fullWidth={false}
          icon="play-outline"
          onPress={startCaptions}
          style={styles.halfButton}
          title="Reproducir"
          variant="primary"
        />
        <AccessibleButton
          accessibilityHint="Pausa los subtítulos automáticos simulados."
          fullWidth={false}
          icon="pause-outline"
          onPress={pauseCaptions}
          style={styles.halfButton}
          title="Pausar"
          variant="secondary"
        />
      </View>
      <AccessibleButton
        accessibilityHint="Detiene el contenido multimedia simulado y desactiva subtítulos."
        icon="stop-outline"
        onPress={stopCaptions}
        title="Detener y limpiar"
        variant="ghost"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  player: {
    minHeight: 300,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 34,
    elevation: 8,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mediaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mediaTagText: {
    fontWeight: fontWeights.extraBold,
  },
  playArea: {
    alignItems: 'center',
    gap: spacing.md,
  },
  playButton: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  playerTitle: {
    fontWeight: fontWeights.black,
    textAlign: 'center',
  },
  playerCaption: {
    fontWeight: fontWeights.medium,
    textAlign: 'center',
  },
  mediaProgressTrack: {
    height: 10,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  mediaProgressFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  captionBox: {
    gap: spacing.md,
    borderWidth: 2,
    borderRadius: radius.xxl,
    marginTop: spacing.section,
    padding: spacing.xxl,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 5,
  },
  captionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  captionLabel: {
    fontWeight: fontWeights.extraBold,
    textTransform: 'uppercase',
  },
  captionText: {
    fontWeight: fontWeights.black,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.section,
  },
  halfButton: {
    flex: 1,
  },
});
