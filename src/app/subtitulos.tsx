import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AccessibleButton } from '@/components/AccessibleButton';
import { AppHeader } from '@/components/AppHeader';
import { InfoCard } from '@/components/InfoCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';

const captions = [
  'El profesor está explicando la actividad de hoy.',
  'Recuerden validar la aplicación con posibles usuarios.',
  'La accesibilidad debe considerarse desde el diseño inicial.',
];

export default function CaptionsScreen() {
  const { colors, fontMultiplier, settings, setSubtitlesEnabled } =
    useAccessibility();
  const [captionIndex, setCaptionIndex] = useState(0);

  useEffect(() => {
    if (!settings.subtitlesEnabled) {
      return undefined;
    }

    const interval = setInterval(() => {
      setCaptionIndex((current) => (current + 1) % captions.length);
    }, 2200);

    return () => clearInterval(interval);
  }, [settings.subtitlesEnabled]);

  const captionText = settings.subtitlesEnabled
    ? captions[captionIndex]
    : 'Subtítulos desactivados.';

  return (
    <ScreenContainer>
      <AppHeader title="Subtítulos" subtitle="Contenido multimedia accesible" />

      <View
        accessible
        accessibilityLabel="Reproductor multimedia simulado para subtítulos automáticos."
        style={[
          styles.player,
          { backgroundColor: colors.primary, borderColor: colors.border },
        ]}
      >
        <Text
          style={[
            styles.playerTitle,
            {
              color: settings.highContrast ? colors.background : colors.white,
              fontSize: fontSizes.xl * fontMultiplier,
              lineHeight: lineHeights.xl * fontMultiplier,
            },
          ]}
        >
          Clase virtual simulada
        </Text>
        <Text
          style={[
            styles.playerText,
            {
              color: settings.highContrast ? colors.background : colors.white,
              fontSize: fontSizes.md * fontMultiplier,
              lineHeight: lineHeights.md * fontMultiplier,
            },
          ]}
        >
          Área visual del contenido con audio.
        </Text>
      </View>

      <View
        accessible
        accessibilityLabel={`Subtítulo actual: ${captionText}`}
        style={[
          styles.captionBox,
          { backgroundColor: colors.surface, borderColor: colors.accent },
        ]}
      >
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
        text={
          settings.subtitlesEnabled
            ? 'Sonido detectado: voz principal de la clase.'
            : 'No hay sonido importante detectado.'
        }
        title="Indicador visual"
        tone={settings.subtitlesEnabled ? 'success' : 'default'}
      />

      <View style={styles.buttonRow}>
        <AccessibleButton
          accessibilityHint="Activa los subtítulos automáticos simulados."
          fullWidth={false}
          onPress={() => setSubtitlesEnabled(true)}
          title="Activar"
          variant="primary"
        />
        <AccessibleButton
          accessibilityHint="Pausa los subtítulos automáticos simulados."
          fullWidth={false}
          onPress={() => setSubtitlesEnabled(false)}
          title="Pausar"
          variant="secondary"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  player: {
    minHeight: 190,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xxl,
  },
  playerTitle: {
    fontWeight: fontWeights.extraBold,
    textAlign: 'center',
  },
  playerText: {
    fontWeight: fontWeights.medium,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  captionBox: {
    borderWidth: 2,
    borderRadius: radius.xl,
    marginTop: spacing.section,
    padding: spacing.xxl,
  },
  captionText: {
    fontWeight: fontWeights.extraBold,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.section,
  },
});
