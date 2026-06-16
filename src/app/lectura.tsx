import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AccessibleButton } from '@/components/AccessibleButton';
import { AppHeader } from '@/components/AppHeader';
import { IconBadge } from '@/components/IconBadge';
import { InfoCard } from '@/components/InfoCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { ReadingSpeedMode, useAccessibility } from '@/context/AccessibilityContext';
import {
  buildTitleFromContent,
  deleteReadingText,
  loadSavedReadingTexts,
  saveReadingText,
  SavedReadingText,
} from '@/services/readingLibrary';
import {
  getAvailableSpeechVoices,
  isSpeechSynthesisAvailable,
  pauseSpeech,
  resumeSpeech,
  speakText,
  SpeechVoiceOption,
  stopSpeech,
} from '@/services/speech';

const speedOptions: { label: string; value: ReadingSpeedMode; description: string }[] = [
  { label: '0.75×', value: 0.75, description: 'Pausada' },
  { label: '1×', value: 1, description: 'Normal' },
  { label: '1.25×', value: 1.25, description: 'Rápida' },
  { label: '1.5×', value: 1.5, description: 'Muy rápida' },
];

type ReadingState = 'idle' | 'reading' | 'paused' | 'unsupported';

function getVoiceLabel(voice: SpeechVoiceOption) {
  const language = voice.language ? ` · ${voice.language}` : '';
  return `${voice.name}${language}`;
}

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
  const [saveTitle, setSaveTitle] = useState('');
  const [message, setMessage] = useState('Escribe o pega un texto para escucharlo.');
  const [savedTexts, setSavedTexts] = useState<SavedReadingText[]>([]);
  const [voices, setVoices] = useState<SpeechVoiceOption[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void loadSavedReadingTexts().then((items) => {
      if (!mounted) return;
      setSavedTexts(items);
    });
    void getAvailableSpeechVoices().then((availableVoices) => {
      if (!mounted) return;
      const spanishVoices = availableVoices.filter((voice) => voice.language.toLowerCase().startsWith('es'));
      const orderedVoices = spanishVoices.length ? spanishVoices : availableVoices;
      setVoices(orderedVoices.slice(0, 8));
    });

    return () => {
      mounted = false;
      stopSpeech();
    };
  }, []);

  useEffect(() => {
    if (readingState !== 'reading') return undefined;

    const interval = setInterval(() => {
      setProgress((current) => Math.min(current + 4, 96));
    }, 700);

    return () => clearInterval(interval);
  }, [readingState]);

  const speechSupported = useMemo(() => isSpeechSynthesisAvailable(), []);
  const readableText = textToRead.trim();
  const selectedVoice = voices.find((voice) => voice.id === selectedVoiceId);

  function startReading() {
    if (!readableText) {
      setMessage('Agrega un texto antes de iniciar la lectura.');
      setReadingState('idle');
      return;
    }

    setProgress(0);
    setMessage('Lectura iniciada. Puedes pausar, reanudar o detener cuando lo necesites.');

    const started = speakText(readableText, {
      language: settings.captionLanguage === 'auto' ? 'es-PE' : settings.captionLanguage,
      rate: settings.readingSpeed,
      voiceIdentifier: selectedVoiceId ?? undefined,
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
    setSaveTitle('');
    setMessage('Texto limpiado.');
  }

  async function saveCurrentText() {
    if (!readableText) {
      setMessage('Agrega texto antes de guardarlo.');
      return;
    }

    const title = saveTitle.trim() || buildTitleFromContent(readableText);
    const nextLibrary = await saveReadingText(readableText, title);
    setSavedTexts(nextLibrary);
    setSaveTitle('');
    setMessage('Texto guardado para usarlo de nuevo.');
  }

  async function removeSavedText(id: string) {
    const nextLibrary = await deleteReadingText(id);
    setSavedTexts(nextLibrary);
    setMessage('Texto eliminado de guardados.');
  }

  function useSavedText(item: SavedReadingText) {
    stopReading();
    setTextToRead(item.content);
    setSaveTitle(item.title);
    setMessage('Texto cargado. Puedes editarlo o reproducirlo.');
  }

  const statusText = {
    idle: 'Listo para leer',
    reading: 'Lectura activa',
    paused: 'Lectura pausada',
    unsupported: 'Voz no disponible',
  }[readingState];

  return (
    <ScreenContainer>
      <AppHeader title="Lectura" subtitle="Texto, voz y contenidos guardados" />

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
          <IconBadge icon="volume-high-outline" size="md" tone="primary" />
          <View style={[styles.statusPill, { backgroundColor: readingState === 'reading' ? colors.successSoft : colors.surfaceElevated }]}> 
            <Ionicons color={readingState === 'reading' ? colors.success : colors.textMuted} name={readingState === 'reading' ? 'radio-outline' : 'pause-circle-outline'} size={15} />
            <Text
              numberOfLines={1}
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
          Escucha textos a tu ritmo.
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
          Escribe, pega o carga textos guardados. El control de reproducción queda siempre en tus manos.
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
            <Text style={[styles.kicker, { color: colors.accent, fontSize: fontSizes.xs * fontMultiplier, lineHeight: lineHeights.xs * fontMultiplier }]}>Texto</Text>
            <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSizes.lg * fontMultiplier, lineHeight: lineHeights.lg * fontMultiplier }]}>Contenido para escuchar</Text>
          </View>
        </View>
        <TextInput
          accessibilityHint="Campo para escribir o pegar el texto que AccesIA leerá en voz alta."
          accessibilityLabel="Texto para lectura por voz"
          multiline
          onChangeText={setTextToRead}
          placeholder="Escribe o pega aquí el texto."
          placeholderTextColor={colors.textSubtle}
          style={[
            styles.textInput,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              color: colors.text,
              fontSize: fontSizes.md * fontMultiplier,
              lineHeight: lineHeights.md * fontMultiplier,
            },
          ]}
          textAlignVertical="top"
          value={textToRead}
        />
      </View>

      <View
        style={[
          styles.savePanel,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <IconBadge icon="bookmark-outline" size="sm" tone="accent" />
          <View style={styles.cardTitleBlock}>
            <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSizes.lg * fontMultiplier }]}>Guardar texto frecuente</Text>
            <Text style={[styles.helperText, { color: colors.textMuted, fontSize: fontSizes.sm * fontMultiplier }]}>Ponle un nombre y úsalo cuando lo necesites.</Text>
          </View>
        </View>
        <TextInput
          accessibilityHint="Nombre opcional para identificar el texto guardado."
          accessibilityLabel="Nombre del texto guardado"
          onChangeText={setSaveTitle}
          placeholder="Nombre opcional"
          placeholderTextColor={colors.textSubtle}
          style={[
            styles.singleInput,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              color: colors.text,
              fontSize: fontSizes.md * fontMultiplier,
              lineHeight: lineHeights.md * fontMultiplier,
            },
          ]}
          value={saveTitle}
        />
        <AccessibleButton
          accessibilityHint="Guarda el texto actual para usarlo después."
          disabled={!readableText}
          icon="save-outline"
          onPress={() => void saveCurrentText()}
          title="Guardar texto"
          variant="primary"
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
          <Text style={[styles.progressLabel, { color: colors.text, fontSize: fontSizes.md * fontMultiplier, lineHeight: lineHeights.md * fontMultiplier }]}>Progreso</Text>
          <Text style={[styles.progressValue, { color: colors.textMuted, fontSize: fontSizes.sm * fontMultiplier, lineHeight: lineHeights.sm * fontMultiplier }]}>{progress}%</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceElevated }]}> 
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.accent }]} />
        </View>
      </View>

      <View style={styles.controlsPanel}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.xl * fontMultiplier }]}>Controles</Text>
        <AccessibleButton
          accessibilityHint="Inicia la lectura automática del texto escrito."
          disabled={!readableText || readingState === 'reading'}
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
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionKicker, { color: colors.accent, fontSize: fontSizes.xs * fontMultiplier }]}>Voz</Text>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.xxl * fontMultiplier }]}>Velocidad y voz</Text>
      </View>

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

      <View style={styles.voiceGrid}>
        {voices.length ? voices.map((voice) => {
          const selected = selectedVoiceId === voice.id;
          return (
            <Pressable
              accessibilityHint={`Selecciona la voz ${getVoiceLabel(voice)}.`}
              accessibilityLabel={getVoiceLabel(voice)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={voice.id}
              onPress={() => setSelectedVoiceId(selected ? null : voice.id)}
              style={({ pressed }) => [
                styles.voiceCard,
                {
                  backgroundColor: selected ? colors.primaryDeep : colors.surface,
                  borderColor: selected ? colors.accent : colors.border,
                  opacity: pressed ? 0.86 : 1,
                },
              ]}
            >
              <Text numberOfLines={1} style={[styles.voiceName, { color: selected ? colors.white : colors.text, fontSize: fontSizes.sm * fontMultiplier }]}>{voice.name}</Text>
              <Text numberOfLines={1} style={[styles.voiceLanguage, { color: selected ? 'rgba(255,255,255,0.75)' : colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>{voice.language}</Text>
            </Pressable>
          );
        }) : (
          <InfoCard
            icon="volume-medium-outline"
            text="El dispositivo usará su voz predeterminada."
            title="Voz del sistema"
            tone="primary"
          />
        )}
      </View>

      <InfoCard
        icon={speechSupported ? 'checkmark-circle-outline' : 'warning-outline'}
        text={speechSupported ? message : 'Este entorno no permite reproducir voz. El texto permanece visible para lectura manual.'}
        title={speechSupported ? 'Estado de lectura' : 'Voz no disponible'}
        tone={speechSupported ? 'success' : 'warning'}
      />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionKicker, { color: colors.accent, fontSize: fontSizes.xs * fontMultiplier }]}>Guardados</Text>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.xxl * fontMultiplier }]}>Textos frecuentes</Text>
      </View>

      {savedTexts.length ? (
        <View style={styles.savedList}>
          {savedTexts.map((item) => (
            <View key={item.id} style={[styles.savedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              <Pressable
                accessibilityHint="Carga este texto en el editor de lectura."
                accessibilityLabel={`Cargar ${item.title}`}
                accessibilityRole="button"
                onPress={() => useSavedText(item)}
                style={styles.savedContent}
              >
                <Text numberOfLines={1} style={[styles.savedTitle, { color: colors.text, fontSize: fontSizes.md * fontMultiplier }]}>{item.title}</Text>
                <Text numberOfLines={2} style={[styles.savedPreview, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>{item.content}</Text>
              </Pressable>
              <Pressable
                accessibilityHint="Elimina este texto guardado."
                accessibilityLabel={`Eliminar ${item.title}`}
                accessibilityRole="button"
                onPress={() => void removeSavedText(item.id)}
                style={[styles.deleteButton, { backgroundColor: colors.dangerSoft }]}
              >
                <Ionicons color={colors.danger} name="trash-outline" size={18} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <InfoCard
          icon="bookmark-outline"
          text="Los textos que guardes aparecerán aquí para escucharlos nuevamente."
          title="Sin textos guardados"
          tone="secondary"
        />
      )}

      <View style={styles.accessPanel}>
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
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statusPill: {
    maxWidth: '64%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusPillText: {
    flexShrink: 1,
    fontWeight: fontWeights.extraBold,
    textTransform: 'uppercase',
  },
  featureTitle: {
    fontWeight: fontWeights.black,
    letterSpacing: -0.7,
  },
  featureSubtitle: {
    fontWeight: fontWeights.medium,
    marginTop: spacing.md,
  },
  readingCard: {
    borderWidth: 1,
    borderRadius: radius.xxl,
    marginTop: spacing.section,
    padding: spacing.xl,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
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
  helperText: {
    fontWeight: fontWeights.medium,
  },
  textInput: {
    minHeight: 170,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    fontWeight: fontWeights.medium,
  },
  savePanel: {
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.xxl,
    marginTop: spacing.section,
    padding: spacing.xl,
  },
  singleInput: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
  controlsPanel: {
    gap: spacing.md,
    marginTop: spacing.section,
  },
  sectionHeader: {
    marginTop: spacing.section,
    marginBottom: spacing.lg,
  },
  sectionKicker: {
    fontWeight: fontWeights.extraBold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontWeight: fontWeights.black,
    letterSpacing: -0.5,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  halfButton: {
    flex: 1,
    minWidth: 132,
  },
  speedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  speedButton: {
    flex: 1,
    minWidth: 84,
  },
  voiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.section,
  },
  voiceCard: {
    width: '47.5%',
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  voiceName: {
    fontWeight: fontWeights.extraBold,
  },
  voiceLanguage: {
    fontWeight: fontWeights.medium,
    marginTop: spacing.xs,
  },
  savedList: {
    gap: spacing.md,
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  savedContent: {
    flex: 1,
  },
  savedTitle: {
    fontWeight: fontWeights.extraBold,
  },
  savedPreview: {
    fontWeight: fontWeights.medium,
    marginTop: spacing.xs,
  },
  deleteButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  accessPanel: {
    gap: spacing.md,
    marginTop: spacing.section,
  },
});
