import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

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
  const [textToRead, setTextToRead] = useState('');
  const [message, setMessage] = useState('Escribe o pega un texto para escucharlo.');

  useEffect(() => () => stopSpeech(), []);

  useEffect(() => {
    if (readingState !== 'reading') return undefined;

    const interval = setInterval(() => {
      setProgress((current) => Math.min(current + 5, 96));
    }, 700);

    return () => clearInterval(interval);
  }, [readingState]);

  const speechSupported = useMemo(() => isSpeechSynthesisAvailable(), []);
  const readableText = textToRead.trim();

  function startReading() {
    if (!readableText) {
      setMessage('Agrega un texto antes de iniciar la lectura.');
      setReadingState('idle');
      return;
    }

    setProgress(0);
    setMessage('Lectura iniciada. Puedes pausar o detener cuando lo necesites.');

    const started = speakText(readableText, {
      rate: settings.readingSpeed,
      onStart: () => setReadingState('reading'),
      onPause: () => setReadingState('paused'),
      onResume: () => setReadingState('reading'),
      onEnd: () => {
        setProgress(100);
        setReadingState('idle');
        setMessage('Lectura finalizada.');
      },
      onError: () => {
        setReadingState('unsupported');
        setMessage('No se pudo usar la síntesis de voz en este entorno.');
      },
    });

    if (!started) {
      setReadingState('unsupported');
      setMessage('La lectura por voz no está disponible en este entorno.');
    }
  }

  function pauseReading() {
    const paused = pauseSpeech();
    setReadingState(paused ? 'paused' : 'idle');
    setMessage(paused ? 'Lectura pausada.' : 'No hay una lectura activa para pausar.');
  }

  function resumeReading() {
    const resumed = resumeSpeech();
    setReadingState(resumed ? 'reading' : 'idle');
    setMessage(resumed ? 'Lectura reanudada.' : 'No hay una lectura pausada para reanudar.');
  }

  function stopReading() {
    stopSpeech();
    setProgress(0);
    setReadingState('idle');
    setMessage('Lectura detenida.');
  }

  function clearText() {
    stopReading();
    setTextToRead('');
    setMessage('Texto limpiado.');
  }

  const statusText = {
    idle: 'Listo para leer',
    reading: 'Lectura activa',
    paused: 'Lectura pausada',
    unsupported: 'Voz no disponible',
  }[readingState];

  return (
    <ScreenContainer>
      <AppHeader title="Lectura" subtitle="Texto, voz y control de ritmo" />

      <View
        style={[
          styles.featureHero,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.featureHeroTop}>
          <IconBadge icon="volume-high-outline" size="lg" tone="primary" />
          <View style={[styles.statusPill, { backgroundColor: readingState === 'reading' ? colors.successSoft : colors.surfaceElevated }]}> 
            <Ionicons color={readingState === 'reading' ? colors.success : colors.textMuted} name={readingState === 'reading' ? 'radio-outline' : 'pause-circle-outline'} size={16} />
            <Text
              style={[
                styles.statusPillText,
                {
                  color: readingState === 'reading' ? colors.success : colors.textMuted,
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
              color: colors.text,
              fontSize: fontSizes.display * fontMultiplier,
              lineHeight: lineHeights.display * fontMultiplier,
            },
          ]}
        >
          Escucha cualquier texto.
        </Text>
        <Text
          style={[
            styles.featureSubtitle,
            {
              color: colors.textMuted,
              fontSize: fontSizes.md * fontMultiplier,
              lineHeight: lineHeights.md * fontMultiplier,
            },
          ]}
        >
          Pega contenido, controla velocidad, pausa, reanuda y detén la lectura con acciones claras.
        </Text>
      </View>

      <View
        accessible
        accessibilityLabel="Editor de texto para lectura por voz."
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
          <View style={styles.cardTitleBlock}>
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
              Texto a leer
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
              Escribe o pega contenido
            </Text>
          </View>
        </View>
        <TextInput
          accessibilityHint="Campo para escribir o pegar el texto que AccesIA leerá en voz alta."
          accessibilityLabel="Texto para lectura por voz"
          multiline
          onChangeText={setTextToRead}
          placeholder="Pega aquí el texto que quieres escuchar."
          placeholderTextColor={colors.textSubtle}
          style={[
            styles.textInput,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              color: colors.text,
              fontSize: fontSizes.lg * fontMultiplier,
              lineHeight: lineHeights.lg * fontMultiplier,
            },
          ]}
          textAlignVertical="top"
          value={textToRead}
        />
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
        text={speechSupported ? message : 'Este entorno no permite reproducir voz. El texto permanece visible para lectura manual.'}
        title={speechSupported ? 'Estado de lectura' : 'Voz no disponible'}
        tone={speechSupported ? 'success' : 'warning'}
      />

      <View style={styles.actions}>
        <AccessibleButton
          accessibilityHint="Inicia la lectura automática del texto escrito."
          disabled={!readableText}
          icon="play-outline"
          onPress={startReading}
          title="Reproducir"
          variant="primary"
        />
        <View style={styles.buttonRow}>
          <AccessibleButton
            accessibilityHint="Pausa la lectura del contenido."
            disabled={readingState !== 'reading'}
            fullWidth={false}
            icon="pause-outline"
            onPress={pauseReading}
            style={styles.halfButton}
            title="Pausar"
            variant="secondary"
          />
          <AccessibleButton
            accessibilityHint="Reanuda la lectura pausada."
            disabled={readingState !== 'paused'}
            fullWidth={false}
            icon="play-forward-outline"
            onPress={resumeReading}
            style={styles.halfButton}
            title="Reanudar"
            variant="secondary"
          />
        </View>
        <View style={styles.buttonRow}>
          <AccessibleButton
            accessibilityHint="Detiene la lectura y reinicia el progreso."
            fullWidth={false}
            icon="stop-outline"
            onPress={stopReading}
            style={styles.halfButton}
            title="Detener"
            variant="ghost"
          />
          <AccessibleButton
            accessibilityHint="Limpia el texto escrito."
            fullWidth={false}
            icon="trash-outline"
            onPress={clearText}
            style={styles.halfButton}
            title="Limpiar"
            variant="ghost"
          />
        </View>
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
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 5,
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
    textTransform: 'uppercase',
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
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  cardTitleBlock: {
    flex: 1,
  },
  kicker: {
    fontWeight: fontWeights.extraBold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontWeight: fontWeights.extraBold,
  },
  textInput: {
    minHeight: 180,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
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
