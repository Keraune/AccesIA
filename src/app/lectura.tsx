import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AccessibleButton } from '@/components/AccessibleButton';
import { AppHeader } from '@/components/AppHeader';
import { IconBadge } from '@/components/IconBadge';
import { InfoCard } from '@/components/InfoCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { ReadingSpeedMode, useAccessibility } from '@/context/AccessibilityContext';
import {
  isSpeechSynthesisAvailable,
  pauseSpeech,
  resumeSpeech,
  speakText,
  stopSpeech,
} from '@/services/speech';

const sampleText =
  'Hoy revisaremos una actividad de accesibilidad. Puedes aumentar el tamaño de letra, activar alto contraste o escuchar este contenido para recibir la información de otra forma. AccesIA busca que cada usuario pueda leer, escuchar y adaptar la pantalla según sus necesidades.';

const speedOptions: { label: string; value: ReadingSpeedMode; description: string }[] = [
  { label: '0.75×', value: 0.75, description: 'Pausada' },
  { label: '1×', value: 1, description: 'Normal' },
  { label: '1.25×', value: 1.25, description: 'Rápida' },
  { label: '1.5×', value: 1.5, description: 'Muy rápida' },
];

type ReadingState = 'idle' | 'reading' | 'paused' | 'unsupported';

export default function ReadingScreen() {
  const {
    colors,
    fontMultiplier,
    settings,
    decreaseFontScale,
    increaseFontScale,
    setHighContrast,
    setReadingSpeed,
  } = useAccessibility();
  const [readingState, setReadingState] = useState<ReadingState>('idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => () => stopSpeech(), []);

  useEffect(() => {
    if (readingState !== 'reading') return undefined;

    const interval = setInterval(() => {
      setProgress((current) => Math.min(current + 8, 100));
    }, 600);

    return () => clearInterval(interval);
  }, [readingState]);

  const speechSupported = useMemo(() => isSpeechSynthesisAvailable(), []);

  function startReading() {
    setProgress(0);

    const started = speakText(sampleText, {
      rate: settings.readingSpeed,
      onStart: () => setReadingState('reading'),
      onPause: () => setReadingState('paused'),
      onResume: () => setReadingState('reading'),
      onEnd: () => {
        setProgress(100);
        setReadingState('idle');
      },
      onError: () => setReadingState('unsupported'),
    });

    if (!started) {
      setReadingState('unsupported');
    }
  }

  function pauseReading() {
    const paused = pauseSpeech();
    setReadingState(paused ? 'paused' : 'idle');
  }

  function resumeReading() {
    const resumed = resumeSpeech();
    setReadingState(resumed ? 'reading' : 'idle');
  }

  function stopReading() {
    stopSpeech();
    setProgress(0);
    setReadingState('idle');
  }

  const statusText = {
    idle: 'Listo para leer',
    reading: 'Lectura activa',
    paused: 'Lectura pausada',
    unsupported: 'Síntesis no disponible',
  }[readingState];

  return (
    <ScreenContainer>
      <AppHeader title="Lectura" subtitle="Texto claro, voz y control de ritmo" />

      <View
        style={[
          styles.featureHero,
          {
            backgroundColor: colors.primaryDeep,
            borderColor: settings.highContrast ? colors.border : 'rgba(255,255,255,0.16)',
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.featureHeroTop}>
          <IconBadge icon="volume-high-outline" inverted size="lg" tone="accent" />
          <View style={[styles.statusPill, { backgroundColor: readingState === 'reading' ? colors.successSoft : 'rgba(255,255,255,0.12)' }]}> 
            <Ionicons color={readingState === 'reading' ? colors.success : colors.white} name={readingState === 'reading' ? 'radio-outline' : 'pause-circle-outline'} size={16} />
            <Text
              style={[
                styles.statusPillText,
                {
                  color: readingState === 'reading' ? colors.success : colors.white,
                  fontSize: fontSizes.xs * fontMultiplier,
                  lineHeight: lineHeights.xs * fontMultiplier,
                },
              ]}
            >
              {statusText}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.featureTitle,
            {
              color: colors.white,
              fontSize: fontSizes.display * fontMultiplier,
              lineHeight: lineHeights.display * fontMultiplier,
            },
          ]}
        >
          Escucha documentos con ritmo adaptable.
        </Text>
        <Text
          style={[
            styles.featureSubtitle,
            {
              color: 'rgba(255,255,255,0.78)',
              fontSize: fontSizes.md * fontMultiplier,
              lineHeight: lineHeights.md * fontMultiplier,
            },
          ]}
        >
          Incluye síntesis de voz en web, pausa, reanudación y control de velocidad para personas con baja visión o adultos mayores.
        </Text>
      </View>

      <View
        accessible
        accessibilityLabel={`Texto de ejemplo. ${sampleText}`}
        style={[
          styles.readingCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <IconBadge icon="document-text-outline" size="sm" tone="primary" />
          <View>
            <Text
              style={[
                styles.kicker,
                {
                  color: colors.accent,
                  fontSize: fontSizes.xs * fontMultiplier,
                  lineHeight: lineHeights.xs * fontMultiplier,
                },
              ]}
            >
              Documento accesible
            </Text>
            <Text
              style={[
                styles.cardTitle,
                {
                  color: colors.text,
                  fontSize: fontSizes.lg * fontMultiplier,
                  lineHeight: lineHeights.lg * fontMultiplier,
                },
              ]}
            >
              Actividad de accesibilidad
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.readingText,
            {
              color: colors.text,
              fontSize: fontSizes.xl * fontMultiplier,
              lineHeight: lineHeights.xxl * fontMultiplier,
            },
          ]}
        >
          {sampleText}
        </Text>
      </View>

      <View
        accessible
        accessibilityLabel={`Progreso de lectura ${progress} por ciento.`}
        style={[
          styles.progressPanel,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.progressHeader}>
          <Text
            style={[
              styles.progressLabel,
              {
                color: colors.text,
                fontSize: fontSizes.md * fontMultiplier,
                lineHeight: lineHeights.md * fontMultiplier,
              },
            ]}
          >
            Progreso de lectura
          </Text>
          <Text
            style={[
              styles.progressValue,
              {
                color: colors.textMuted,
                fontSize: fontSizes.sm * fontMultiplier,
                lineHeight: lineHeights.sm * fontMultiplier,
              },
            ]}
          >
            {progress}%
          </Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceElevated }]}> 
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.accent }]} />
        </View>
      </View>

      <View style={styles.speedPanel}>
        <Text
          style={[
            styles.speedTitle,
            {
              color: colors.text,
              fontSize: fontSizes.xl * fontMultiplier,
              lineHeight: lineHeights.xl * fontMultiplier,
            },
          ]}
        >
          Velocidad de lectura
        </Text>
        <View style={styles.speedRow}>
          {speedOptions.map((option) => (
            <AccessibleButton
              accessibilityHint={`Cambia la velocidad a ${option.label}, ${option.description}.`}
              fullWidth={false}
              key={option.value}
              onPress={() => setReadingSpeed(option.value)}
              style={styles.speedButton}
              title={option.label}
              variant={settings.readingSpeed === option.value ? 'accent' : 'secondary'}
            />
          ))}
        </View>
      </View>

      <InfoCard
        icon={speechSupported ? 'checkmark-circle-outline' : 'warning-outline'}
        text={
          speechSupported
            ? 'La lectura por voz usa la síntesis de voz disponible en el navegador durante la demostración web.'
            : 'Tu entorno actual no expone síntesis de voz. El flujo visual se mantiene para la validación.'
        }
        title={speechSupported ? 'Síntesis de voz disponible' : 'Modo visual de demostración'}
        tone={speechSupported ? 'success' : 'warning'}
      />

      <View style={styles.actions}>
        <AccessibleButton
          accessibilityHint="Inicia la lectura automática del texto mostrado."
          icon="play-outline"
          onPress={startReading}
          title="Escuchar contenido"
          variant="primary"
        />
        <View style={styles.buttonRow}>
          <AccessibleButton
            accessibilityHint="Pausa la lectura del contenido."
            fullWidth={false}
            icon="pause-outline"
            onPress={pauseReading}
            style={styles.halfButton}
            title="Pausar"
            variant="secondary"
          />
          <AccessibleButton
            accessibilityHint="Reanuda la lectura pausada."
            fullWidth={false}
            icon="play-forward-outline"
            onPress={resumeReading}
            style={styles.halfButton}
            title="Reanudar"
            variant="secondary"
          />
        </View>
        <AccessibleButton
          accessibilityHint="Detiene la lectura y reinicia el progreso."
          icon="stop-outline"
          onPress={stopReading}
          title="Detener lectura"
          variant="ghost"
        />
        <View style={styles.buttonRow}>
          <AccessibleButton
            accessibilityHint="Aumenta el tamaño del texto en toda la aplicación."
            fullWidth={false}
            icon="text-outline"
            onPress={increaseFontScale}
            style={styles.halfButton}
            title="Aumentar"
            variant="secondary"
          />
          <AccessibleButton
            accessibilityHint="Reduce el tamaño del texto en toda la aplicación."
            fullWidth={false}
            icon="text-outline"
            onPress={decreaseFontScale}
            style={styles.halfButton}
            title="Reducir"
            variant="secondary"
          />
        </View>
        <AccessibleButton
          accessibilityHint="Activa o desactiva el tema de alto contraste."
          icon="contrast-outline"
          onPress={() => setHighContrast(!settings.highContrast)}
          title={settings.highContrast ? 'Desactivar contraste' : 'Cambiar contraste'}
          variant="ghost"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  featureHero: {
    borderWidth: 1,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 34,
    elevation: 8,
  },
  featureHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusPillText: {
    fontWeight: fontWeights.extraBold,
  },
  featureTitle: {
    fontWeight: fontWeights.black,
    letterSpacing: -1,
  },
  featureSubtitle: {
    fontWeight: fontWeights.medium,
    marginTop: spacing.md,
  },
  readingCard: {
    borderWidth: 1,
    borderRadius: radius.xxl,
    marginTop: spacing.section,
    padding: spacing.xxl,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  kicker: {
    fontWeight: fontWeights.extraBold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontWeight: fontWeights.extraBold,
  },
  readingText: {
    fontWeight: fontWeights.medium,
  },
  progressPanel: {
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.xl,
    marginTop: spacing.section,
    padding: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  progressLabel: {
    fontWeight: fontWeights.extraBold,
  },
  progressValue: {
    fontWeight: fontWeights.extraBold,
  },
  progressTrack: {
    height: 12,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  speedPanel: {
    gap: spacing.md,
    marginTop: spacing.section,
  },
  speedTitle: {
    fontWeight: fontWeights.black,
  },
  speedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  speedButton: {
    flex: 1,
    minWidth: 96,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.section,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  halfButton: {
    flex: 1,
  },
});
