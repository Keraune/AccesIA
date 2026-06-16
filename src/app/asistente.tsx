import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AccessibleButton } from '@/components/AccessibleButton';
import { AppHeader } from '@/components/AppHeader';
import { IconBadge } from '@/components/IconBadge';
import { InfoCard } from '@/components/InfoCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';
import {
  findVoiceAction,
  getUnrecognizedResponse,
  getVoiceAssistant,
  voiceActions,
  voiceAssistants,
  VoiceAssistantMode,
} from '@/data/voiceActions';
import {
  openAndroidAccessibilitySettings,
  openAndroidAppByName,
  openAndroidCaptionSettings,
  openAndroidDisplaySettings,
  performAndroidGlobalAction,
} from '@/services/deviceControl';
import { speakText, stopSpeech } from '@/services/speech';
import {
  addVoiceCommandHistoryItem,
  clearVoiceCommandHistory,
  loadVoiceCommandHistory,
  VoiceCommandHistoryItem,
} from '@/services/voiceHistory';
import { listenForCommand, isVoiceRecognitionAvailable, stopListeningForCommand } from '@/services/voiceRecognition';

type VoiceState = 'idle' | 'listening' | 'answered' | 'unavailable' | 'error';

type CommandSource = 'voice' | 'manual';

export default function AssistantScreen() {
  const router = useRouter();
  const {
    colors,
    fontMultiplier,
    settings,
    setHighContrast,
    setSimplifiedMode,
    setSubtitlesEnabled,
    setVoiceCommandsEnabled,
    increaseFontScale,
    stopLiveCaptions,
  } = useAccessibility();
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [manualCommand, setManualCommand] = useState('');
  const [response, setResponse] = useState(getVoiceAssistant('clear').stoppedText);
  const [confidence, setConfidence] = useState(0);
  const [assistantMode, setAssistantMode] = useState<VoiceAssistantMode>('clear');
  const [history, setHistory] = useState<VoiceCommandHistoryItem[]>([]);
  const [historyReady, setHistoryReady] = useState(false);

  const selectedAssistant = useMemo(() => getVoiceAssistant(assistantMode), [assistantMode]);
  const voiceAvailable = isVoiceRecognitionAvailable();

  useEffect(() => {
    let mounted = true;
    void loadVoiceCommandHistory().then((savedHistory) => {
      if (!mounted) return;
      setHistory(savedHistory);
      setHistoryReady(true);
    });

    return () => {
      mounted = false;
      stopListeningForCommand();
      stopSpeech();
    };
  }, []);

  async function saveHistoryItem(item: VoiceCommandHistoryItem) {
    const nextHistory = await addVoiceCommandHistoryItem(item);
    setHistory(nextHistory);
  }

  async function executeRecognizedAction(actionId: string) {
    switch (actionId) {
      case 'open-captions':
        setSubtitlesEnabled(true);
        router.push('/subtitulos' as never);
        break;
      case 'pause-captions':
      case 'stop-captions':
        stopLiveCaptions();
        setSubtitlesEnabled(false);
        break;
      case 'increase-text':
        increaseFontScale();
        break;
      case 'open-reading':
        router.push('/lectura' as never);
        break;
      case 'open-settings':
        router.push('/configuracion' as never);
        break;
      case 'enable-high-contrast':
        setHighContrast(true);
        break;
      case 'open-simple-mode':
        setSimplifiedMode(true);
        router.push('/modo-simplificado' as never);
        break;
      case 'open-youtube':
        await openAndroidAppByName('youtube');
        break;
      case 'open-whatsapp':
        await openAndroidAppByName('whatsapp');
        break;
      case 'open-chrome':
        await openAndroidAppByName('chrome');
        break;
      case 'open-camera':
        await openAndroidAppByName('camara');
        break;
      case 'open-system-display':
        await openAndroidDisplaySettings();
        break;
      case 'open-system-captions':
        await openAndroidCaptionSettings();
        break;
      case 'open-accessibility-service':
        await openAndroidAccessibilitySettings();
        break;
      case 'device-home':
        await performAndroidGlobalAction('home');
        break;
      case 'device-back':
        await performAndroidGlobalAction('back');
        break;
      case 'device-recents':
        await performAndroidGlobalAction('recents');
        break;
      case 'device-notifications':
        await performAndroidGlobalAction('notifications');
        break;
      case 'device-quick-settings':
        await performAndroidGlobalAction('quickSettings');
        break;
      default:
        break;
    }
  }


  async function processCommand(command: string, commandConfidence: number, source: CommandSource) {
    const trimmedCommand = command.trim();

    if (!trimmedCommand) {
      setVoiceState('idle');
      setResponse(selectedAssistant.emptyText);
      return;
    }

    const action = findVoiceAction(trimmedCommand);
    const nextResponse = action?.responses[assistantMode] ?? getUnrecognizedResponse(assistantMode);
    const nextConfidence = source === 'manual' ? 100 : Math.round(commandConfidence * 100);

    setVoiceState('answered');
    setTranscript(trimmedCommand);
    setConfidence(nextConfidence);
    setResponse(nextResponse);
    setVoiceCommandsEnabled(true);

    await saveHistoryItem({
      id: `${Date.now()}`,
      transcript: trimmedCommand,
      response: nextResponse,
      actionId: action?.id,
      actionLabel: action?.label,
      assistantMode,
      confidence: nextConfidence,
      status: action ? 'recognized' : 'unrecognized',
      createdAt: new Date().toISOString(),
    });

    if (action) {
      await executeRecognizedAction(action.id);
    }
  }

  async function handleStartListening() {
    if (voiceState === 'listening') return;

    setVoiceCommandsEnabled(true);
    setVoiceState('listening');
    setTranscript('');
    setConfidence(0);
    setResponse(selectedAssistant.listeningText);

    const result = await listenForCommand((partialTranscript, partialConfidence) => {
      setTranscript(partialTranscript);
      setConfidence(Math.round(partialConfidence * 100));
    }, { language: settings.captionLanguage });

    if (result.status === 'unavailable') {
      setVoiceState('unavailable');
      setResponse(selectedAssistant.unavailableText);
      return;
    }

    if (result.status === 'permissionDenied') {
      setVoiceState('error');
      setResponse('Activa el permiso de micrófono para usar comandos de voz en este dispositivo.');
      return;
    }

    if (result.status === 'error') {
      setVoiceState('error');
      setResponse(selectedAssistant.errorText);
      return;
    }

    if (result.status === 'stopped' && !result.transcript.trim()) {
      setVoiceState('idle');
      setResponse(selectedAssistant.stoppedText);
      return;
    }

    await processCommand(result.transcript, result.confidence, 'voice');
  }

  function handleStopListening() {
    const stopped = stopListeningForCommand();
    if (!stopped) {
      setVoiceState('idle');
      setResponse(selectedAssistant.stoppedText);
    }
  }

  async function handleManualCommand() {
    Keyboard.dismiss();
    await processCommand(manualCommand, 1, 'manual');
    setManualCommand('');
  }

  function playResponse() {
    speakText(response, {
      rate: settings.readingSpeed,
      onError: () => setResponse('La respuesta queda visible en pantalla. Revisa el motor de voz del dispositivo para escucharla.'),
    });
  }

  async function clearHistory() {
    await clearVoiceCommandHistory();
    setHistory([]);
  }

  const statusText = {
    idle: 'En espera',
    listening: 'Escuchando',
    answered: 'Respuesta lista',
    unavailable: 'Voz no disponible',
    error: 'Revisar micrófono',
  }[voiceState];

  const actionPreviewText = voiceActions
    .slice(0, 6)
    .map((action) => action.examples[0])
    .join(' · ');

  return (
    <ScreenContainer>
      <AppHeader title="Voz" subtitle="Dictado y comandos controlados por ti" />

      <View
        accessible
        accessibilityLabel="Panel principal de voz. Inicia y detén la escucha manualmente."
        style={[
          styles.voiceCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.voiceTopBar}>
          <View style={[styles.stateChip, { backgroundColor: voiceState === 'listening' ? colors.successSoft : colors.surfaceElevated }]}> 
            <Ionicons
              color={voiceState === 'listening' ? colors.success : colors.textMuted}
              name={voiceState === 'listening' ? 'radio-outline' : 'mic-outline'}
              size={16}
            />
            <Text
              style={[
                styles.stateChipText,
                {
                  color: voiceState === 'listening' ? colors.success : colors.textMuted,
                  fontSize: fontSizes.xs * fontMultiplier,
                  lineHeight: lineHeights.xs * fontMultiplier,
                },
              ]}
            >
              {statusText}
            </Text>
          </View>
          <IconBadge icon="mic-outline" size="lg" tone="secondary" />
        </View>

        <Text
          style={[
            styles.voiceTitle,
            {
              color: colors.text,
              fontSize: fontSizes.display * fontMultiplier,
              lineHeight: lineHeights.display * fontMultiplier,
            },
          ]}
        >
          Habla cuando tú decidas.
        </Text>
        <Text
          style={[
            styles.voiceSubtitle,
            {
              color: colors.textMuted,
              fontSize: fontSizes.md * fontMultiplier,
              lineHeight: lineHeights.md * fontMultiplier,
            },
          ]}
        >
          La escucha permanece activa hasta que pulses detener. Si el sistema corta el reconocimiento, AccesIA intenta mantener la escucha abierta salvo que exista un error real.
        </Text>

        <View style={styles.listenActions}>
          <AccessibleButton
            accessibilityHint="Inicia la escucha de una indicación hablada."
            disabled={voiceState === 'listening'}
            fullWidth={false}
            icon="mic-outline"
            onPress={() => void handleStartListening()}
            style={styles.listenButton}
            title="Iniciar escucha"
            variant="accent"
          />
          <AccessibleButton
            accessibilityHint="Detiene la escucha actual."
            disabled={voiceState !== 'listening'}
            fullWidth={false}
            icon="stop-circle-outline"
            onPress={handleStopListening}
            style={styles.listenButton}
            title="Detener"
            variant="ghost"
          />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionKicker, { color: colors.accent, fontSize: fontSizes.xs * fontMultiplier }]}>Asistente</Text>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.xxl * fontMultiplier }]}>Tono de respuesta</Text>
      </View>

      <View style={styles.assistantGrid}>
        {voiceAssistants.map((assistant) => {
          const selected = assistantMode === assistant.id;
          return (
            <Pressable
              accessibilityHint={`Selecciona ${assistant.label}.`}
              accessibilityLabel={`${assistant.label}. ${assistant.description}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={assistant.id}
              onPress={() => {
                setAssistantMode(assistant.id);
                setResponse(getVoiceAssistant(assistant.id).stoppedText);
              }}
              style={({ pressed }) => [
                styles.assistantOption,
                {
                  backgroundColor: selected ? colors.primaryDeep : colors.surface,
                  borderColor: selected ? colors.accent : colors.border,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
            >
              <Text style={[styles.assistantLabel, { color: selected ? colors.white : colors.text, fontSize: fontSizes.sm * fontMultiplier }]}>{assistant.label}</Text>
              <Text style={[styles.assistantDescription, { color: selected ? 'rgba(255,255,255,0.72)' : colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>{assistant.description}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.metricRow}>
        <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.metricValue, { color: colors.text, fontSize: fontSizes.xl * fontMultiplier }]}>{confidence || '--'}%</Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>confianza</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.metricValue, { color: colors.text, fontSize: fontSizes.xl * fontMultiplier }]}>{voiceAvailable ? 'Voz' : 'Texto'}</Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>entrada</Text>
        </View>
      </View>

      <View style={styles.timeline}>
        <InfoCard
          icon="create-outline"
          text={transcript || 'Aún no hay texto detectado.'}
          title="Texto detectado"
          tone="secondary"
        />
        <InfoCard icon="sparkles-outline" text={response} title="Respuesta de AccesIA" tone="accent" />
      </View>

      <View style={styles.responseActions}>
        <AccessibleButton
          accessibilityHint="Reproduce la respuesta visible mediante voz."
          fullWidth={false}
          icon="volume-high-outline"
          onPress={playResponse}
          style={styles.responseButton}
          title="Escuchar respuesta"
          variant="secondary"
        />
        <AccessibleButton
          accessibilityHint="Permite volver a iniciar la escucha para intentar otra indicación."
          disabled={voiceState === 'listening'}
          fullWidth={false}
          icon="refresh-outline"
          onPress={() => void handleStartListening()}
          style={styles.responseButton}
          title="Reintentar"
          variant="ghost"
        />
      </View>

      <View
        style={[
          styles.manualPanel,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.manualHeader}>
          <IconBadge icon="keypad-outline" size="sm" tone="primary" />
          <View style={styles.manualTitleBlock}>
            <Text style={[styles.manualTitle, { color: colors.text, fontSize: fontSizes.lg * fontMultiplier }]}>Entrada manual</Text>
            <Text style={[styles.manualSubtitle, { color: colors.textMuted, fontSize: fontSizes.sm * fontMultiplier }]}>Úsala si prefieres escribir o si el micrófono no está disponible.</Text>
          </View>
        </View>
        <TextInput
          accessibilityHint="Escribe una acción para que AccesIA la interprete."
          accessibilityLabel="Indicación manual para AccesIA"
          onChangeText={setManualCommand}
          placeholder="Ejemplo: activar alto contraste"
          placeholderTextColor={colors.textSubtle}
          returnKeyType="done"
          style={[
            styles.manualInput,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              color: colors.text,
              fontSize: fontSizes.md * fontMultiplier,
              lineHeight: lineHeights.md * fontMultiplier,
            },
          ]}
          value={manualCommand}
        />
        <AccessibleButton
          accessibilityHint="Procesa la indicación escrita."
          disabled={!manualCommand.trim()}
          icon="send-outline"
          onPress={() => void handleManualCommand()}
          title="Usar indicación"
          variant="primary"
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionKicker, { color: colors.accent, fontSize: fontSizes.xs * fontMultiplier }]}>Acciones</Text>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.xxl * fontMultiplier }]}>Comandos disponibles</Text>
      </View>

      <InfoCard
        icon="list-outline"
        text={actionPreviewText}
        title="Puedes decir"
        tone="primary"
      />

      <View style={styles.actionList}>
        {voiceActions.map((action) => (
          <View key={action.id} style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <Text style={[styles.actionTitle, { color: colors.text, fontSize: fontSizes.md * fontMultiplier }]}>{action.label}</Text>
            <Text style={[styles.actionDescription, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>{action.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionKicker, { color: colors.accent, fontSize: fontSizes.xs * fontMultiplier }]}>Historial</Text>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.xxl * fontMultiplier }]}>Comandos recientes</Text>
      </View>

      {history.length ? (
        <View style={styles.historyList}>
          {history.map((item) => (
            <InfoCard
              icon={item.status === 'recognized' ? 'checkmark-circle-outline' : 'help-circle-outline'}
              key={item.id}
              text={`${item.transcript} — ${item.response}`}
              title={item.actionLabel ?? 'Sin acción aplicada'}
              tone={item.status === 'recognized' ? 'success' : 'warning'}
            />
          ))}
          <AccessibleButton
            accessibilityHint="Borra el historial local de comandos recientes."
            icon="trash-outline"
            onPress={() => void clearHistory()}
            title="Borrar historial"
            variant="ghost"
          />
        </View>
      ) : (
        <InfoCard
          icon="time-outline"
          text={historyReady ? 'Los comandos reconocidos aparecerán aquí.' : 'Cargando comandos recientes.'}
          title="Sin comandos recientes"
          tone="primary"
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  voiceCard: {
    gap: spacing.xl,
    borderWidth: 1,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 5,
  },
  voiceTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  stateChipText: {
    fontWeight: fontWeights.extraBold,
    textTransform: 'uppercase',
  },
  voiceTitle: {
    fontWeight: fontWeights.black,
    letterSpacing: -1,
  },
  voiceSubtitle: {
    fontWeight: fontWeights.medium,
  },
  listenActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  listenButton: {
    flex: 1,
    minWidth: 132,
  },
  sectionHeader: {
    marginTop: spacing.section,
    marginBottom: spacing.lg,
  },
  sectionKicker: {
    fontWeight: fontWeights.extraBold,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontWeight: fontWeights.black,
    letterSpacing: -0.7,
  },
  assistantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  assistantOption: {
    width: '47.5%',
    minHeight: 124,
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  assistantLabel: {
    fontWeight: fontWeights.black,
  },
  assistantDescription: {
    fontWeight: fontWeights.medium,
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.section,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  metricValue: {
    fontWeight: fontWeights.black,
  },
  metricLabel: {
    fontWeight: fontWeights.extraBold,
    textTransform: 'uppercase',
  },
  timeline: {
    gap: spacing.md,
    marginVertical: spacing.section,
  },
  responseActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  responseButton: {
    flex: 1,
    minWidth: 140,
  },
  manualPanel: {
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.xxl,
    marginTop: spacing.section,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 22,
    elevation: 3,
  },
  manualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  manualTitleBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  manualTitle: {
    fontWeight: fontWeights.black,
  },
  manualSubtitle: {
    fontWeight: fontWeights.medium,
  },
  manualInput: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontWeight: fontWeights.medium,
  },
  actionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionCard: {
    width: '47.5%',
    minHeight: 112,
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  actionTitle: {
    fontWeight: fontWeights.black,
  },
  actionDescription: {
    fontWeight: fontWeights.medium,
  },
  historyList: {
    gap: spacing.md,
  },
});
