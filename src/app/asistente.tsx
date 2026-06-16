import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AccessibleButton } from '@/components/AccessibleButton';
import { AppHeader } from '@/components/AppHeader';
import { IconBadge } from '@/components/IconBadge';
import { InfoCard } from '@/components/InfoCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';
import { findVoiceAction, getUnrecognizedResponse, voiceAssistants, VoiceAssistantMode } from '@/data/voiceActions';
import { speakText } from '@/services/speech';
import { listenForCommand, isVoiceRecognitionAvailable, stopListeningForCommand } from '@/services/voiceRecognition';

type VoiceState = 'idle' | 'listening' | 'answered' | 'unavailable' | 'error';

type CommandHistoryItem = {
  id: string;
  transcript: string;
  response: string;
};

export default function AssistantScreen() {
  const router = useRouter();
  const {
    colors,
    fontMultiplier,
    settings,
    setSubtitlesEnabled,
    setVoiceCommandsEnabled,
    increaseFontScale,
  } = useAccessibility();
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('Elige un asistente y pulsa iniciar para dictar una acción.');
  const [confidence, setConfidence] = useState(0);
  const [assistantMode, setAssistantMode] = useState<VoiceAssistantMode>('clear');
  const [history, setHistory] = useState<CommandHistoryItem[]>([]);

  async function handleStartListening() {
    setVoiceCommandsEnabled(true);
    setVoiceState('listening');
    setTranscript('');
    setConfidence(0);
    setResponse('Escuchando. Pulsa detener cuando termines.');

    const result = await listenForCommand((partialTranscript, partialConfidence) => {
      setTranscript(partialTranscript);
      setConfidence(Math.round(partialConfidence * 100));
    });

    if (result.status === 'unavailable') {
      setVoiceState('unavailable');
      setResponse('El reconocimiento de voz no está disponible en este entorno. Usa una compilación nativa o un navegador compatible.');
      return;
    }

    if (result.status === 'stopped') {
      setVoiceState('idle');
      setResponse('Escucha detenida por el usuario. Puedes iniciar otra vez cuando lo necesites.');
      return;
    }


    if (result.status === 'error' || !result.transcript) {
      setVoiceState('error');
      setResponse('No se pudo procesar el audio. Revisa el permiso del micrófono e inténtalo otra vez.');
      return;
    }

    const action = findVoiceAction(result.transcript);
    const nextResponse = action?.responses[assistantMode] ?? getUnrecognizedResponse(assistantMode);

    setVoiceState('answered');
    setTranscript(result.transcript);
    setConfidence(Math.round(result.confidence * 100));
    setResponse(nextResponse);
    setHistory((current) => [
      {
        id: `${Date.now()}`,
        transcript: result.transcript,
        response: nextResponse,
      },
      ...current,
    ].slice(0, 6));

    if (action?.id === 'open-captions') {
      setSubtitlesEnabled(true);
      router.push('/subtitulos' as never);
    }

    if (action?.id === 'increase-text') {
      increaseFontScale();
    }

    if (action?.id === 'open-reading') {
      router.push('/lectura' as never);
    }

    if (action?.id === 'open-settings') {
      router.push('/configuracion' as never);
    }
  }

  function handleStopListening() {
    const stopped = stopListeningForCommand();
    if (!stopped) {
      setVoiceState('idle');
      setResponse('La escucha ya está detenida.');
    }
  }

  function playResponse() {
    speakText(response, {
      rate: settings.readingSpeed,
      onError: () => setResponse('La respuesta queda visible en pantalla. Revisa el motor de voz del dispositivo para escucharla.'),
    });
  }

  const statusText = {
    idle: 'En espera',
    listening: 'Escuchando',
    answered: 'Respuesta lista',
    unavailable: 'No disponible',
    error: 'Revisar permiso',
  }[voiceState];

  return (
    <ScreenContainer>
      <AppHeader title="Voz" subtitle="Dictado controlado por el usuario" />

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
          La escucha inicia con un toque y se detiene manualmente. AccesIA no aplica cambios sensibles sin mostrar primero una respuesta visible.
        </Text>

        <View style={styles.listenActions}>
          <AccessibleButton
            accessibilityHint="Inicia la escucha de una indicación hablada."
            disabled={voiceState === 'listening'}
            fullWidth={false}
            icon="mic-outline"
            onPress={() => void handleStartListening()}
            style={styles.listenButton}
            title="Iniciar"
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
              onPress={() => setAssistantMode(assistant.id)}
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
          <Text style={[styles.metricValue, { color: colors.text, fontSize: fontSizes.xl * fontMultiplier }]}>{isVoiceRecognitionAvailable() ? 'Voz' : 'Manual'}</Text>
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

      <AccessibleButton
        accessibilityHint="Reproduce la respuesta visible mediante voz."
        icon="volume-high-outline"
        onPress={playResponse}
        title="Escuchar respuesta"
        variant="secondary"
      />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionKicker, { color: colors.accent, fontSize: fontSizes.xs * fontMultiplier }]}>Historial</Text>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.xxl * fontMultiplier }]}>Comandos recientes</Text>
      </View>

      {history.length ? (
        <View style={styles.historyList}>
          {history.map((item) => (
            <InfoCard
              icon="time-outline"
              key={item.id}
              text={`${item.transcript} — ${item.response}`}
              title="Comando"
              tone="default"
            />
          ))}
          <AccessibleButton
            accessibilityHint="Borra el historial local de comandos recientes."
            icon="trash-outline"
            onPress={() => setHistory([])}
            title="Borrar historial"
            variant="ghost"
          />
        </View>
      ) : (
        <InfoCard
          icon="time-outline"
          text="Los comandos reconocidos aparecerán aquí durante esta sesión."
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
    minHeight: 114,
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
  historyList: {
    gap: spacing.md,
  },
});
