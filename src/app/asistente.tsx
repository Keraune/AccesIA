import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AccessibleButton } from '@/components/AccessibleButton';
import { AppHeader } from '@/components/AppHeader';
import { IconBadge } from '@/components/IconBadge';
import { InfoCard } from '@/components/InfoCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';
import { listenForCommand, isVoiceRecognitionAvailable } from '@/services/voiceRecognition';
import { speakText } from '@/services/speech';

type VoiceState = 'idle' | 'listening' | 'answered';

function buildAssistantResponse(transcript: string) {
  const normalizedText = transcript.toLowerCase();

  if (normalizedText.includes('subtítulo')) {
    return 'Entendido. Subtítulos activados para el contenido multimedia.';
  }

  if (normalizedText.includes('letra') || normalizedText.includes('texto')) {
    return 'Entendido. Ajusté la experiencia para mejorar la lectura.';
  }

  if (normalizedText.includes('escuchar') || normalizedText.includes('documento')) {
    return 'Entendido. Puedes escuchar el documento desde Lectura accesible.';
  }

  return 'Entendido. La solicitud fue recibida y se muestra una respuesta clara en pantalla.';
}

export default function AssistantScreen() {
  const {
    colors,
    fontMultiplier,
    settings,
    setSubtitlesEnabled,
    setVoiceCommandsEnabled,
    increaseFontScale,
  } = useAccessibility();
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('Presiona “Hablar ahora” para dictar una acción.');
  const [response, setResponse] = useState('Estoy lista para ayudarte con lectura, subtítulos o ajustes.');
  const [confidence, setConfidence] = useState(0);
  const [inputMode, setInputMode] = useState<'voice' | 'guided'>('guided');

  async function handleVoiceCommand() {
    setVoiceCommandsEnabled(true);
    setVoiceState('listening');
    setTranscript('Escuchando indicación...');
    setResponse('Procesando solicitud...');

    const result = await listenForCommand();
    const nextResponse = buildAssistantResponse(result.transcript);

    setVoiceState('answered');
    setTranscript(`“${result.transcript}”`);
    setConfidence(Math.round(result.confidence * 100));
    setInputMode(result.source === 'browser' ? 'voice' : 'guided');
    setResponse(nextResponse);

    if (result.transcript.toLowerCase().includes('subtítulo')) {
      setSubtitlesEnabled(true);
    }

    if (result.transcript.toLowerCase().includes('letra')) {
      increaseFontScale();
    }
  }

  function playResponse() {
    speakText(response, {
      rate: settings.readingSpeed,
      onError: () => setResponse('Respuesta visible en pantalla. Activa el motor de voz del dispositivo para escucharla.'),
    });
  }

  return (
    <ScreenContainer>
      <AppHeader title="Asistente por voz" subtitle="Dictado, confirmación y respuesta" />

      <View
        accessible
        accessibilityLabel="Panel principal del asistente por voz."
        style={[
          styles.voiceCard,
          {
            backgroundColor: colors.primaryDeep,
            borderColor: settings.highContrast ? colors.border : 'rgba(255,255,255,0.16)',
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.voiceTopBar}>
          <View style={[styles.stateChip, { backgroundColor: 'rgba(255,255,255,0.12)' }]}> 
            <Ionicons
              color={voiceState === 'listening' ? colors.accent : colors.white}
              name={voiceState === 'listening' ? 'radio-outline' : 'mic-outline'}
              size={16}
            />
            <Text
              style={[
                styles.stateChipText,
                {
                  color: voiceState === 'listening' ? colors.accent : colors.white,
                  fontSize: fontSizes.xs * fontMultiplier,
                  lineHeight: lineHeights.xs * fontMultiplier,
                },
              ]}
            >
              {voiceState === 'listening' ? 'Escuchando' : voiceState === 'answered' ? 'Listo' : 'Disponible'}
            </Text>
          </View>
          <IconBadge icon="mic-outline" inverted size="lg" tone="secondary" />
        </View>

        <Text
          style={[
            styles.voiceTitle,
            {
              color: colors.white,
              fontSize: fontSizes.display * fontMultiplier,
              lineHeight: lineHeights.display * fontMultiplier,
            },
          ]}
        >
          Dicta una acción y confirma el resultado.
        </Text>
        <Text
          style={[
            styles.voiceSubtitle,
            {
              color: 'rgba(255,255,255,0.78)',
              fontSize: fontSizes.md * fontMultiplier,
              lineHeight: lineHeights.md * fontMultiplier,
            },
          ]}
        >
          Usa la voz para reducir pasos táctiles. AccesIA muestra lo entendido antes de aplicar cambios importantes.
        </Text>

        <AccessibleButton
          accessibilityHint="Captura una indicación hablada y la muestra como texto."
          icon={voiceState === 'listening' ? 'radio-outline' : 'mic-outline'}
          onPress={handleVoiceCommand}
          title={voiceState === 'listening' ? 'Escuchando...' : 'Hablar ahora'}
          variant="accent"
        />
      </View>

      <View style={styles.metricRow}>
        <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.metricValue, { color: colors.text, fontSize: fontSizes.xl * fontMultiplier }]}>{confidence || '--'}%</Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>confianza</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.metricValue, { color: colors.text, fontSize: fontSizes.xl * fontMultiplier }]}>{inputMode === 'voice' ? 'Voz' : 'Guiado'}</Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>entrada</Text>
        </View>
      </View>

      <View style={styles.timeline}>
        <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
        <InfoCard icon="create-outline" text={transcript} title="Texto detectado" tone="secondary" />
        <InfoCard icon="sparkles-outline" text={response} title="Respuesta de AccesIA" tone="accent" />
        <InfoCard
          icon="shield-checkmark-outline"
          text="El micrófono debe activarse únicamente con autorización del usuario. La respuesta siempre se muestra en pantalla antes de continuar."
          title="Privacidad y control"
          tone="primary"
        />
      </View>

      <AccessibleButton
        accessibilityHint="Reproduce la respuesta del asistente mediante voz."
        icon="volume-high-outline"
        onPress={playResponse}
        title="Escuchar respuesta"
        variant="secondary"
      />

      <InfoCard
        icon={isVoiceRecognitionAvailable() ? 'checkmark-circle-outline' : 'alert-circle-outline'}
        text={
          isVoiceRecognitionAvailable()
            ? 'El dispositivo permite entrada de voz desde este entorno.'
            : 'El entorno actual no permite micrófono directo. AccesIA mantiene una entrada guiada para continuar la interacción.'
        }
        title="Estado de entrada"
        tone={isVoiceRecognitionAvailable() ? 'success' : 'warning'}
      />
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
    shadowOpacity: 0.22,
    shadowRadius: 34,
    elevation: 8,
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
  },
  voiceTitle: {
    fontWeight: fontWeights.black,
    letterSpacing: -1,
  },
  voiceSubtitle: {
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
  timelineLine: {
    alignSelf: 'center',
    width: 2,
    height: 26,
    borderRadius: radius.pill,
  },
});
