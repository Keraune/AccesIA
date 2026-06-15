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
    return 'Comando reconocido. Activé subtítulos y preparé el módulo multimedia accesible.';
  }

  if (normalizedText.includes('letra') || normalizedText.includes('texto')) {
    return 'Comando reconocido. Ajusté la experiencia para mejorar la lectura del contenido.';
  }

  if (normalizedText.includes('escuchar') || normalizedText.includes('documento')) {
    return 'Comando reconocido. Puedes abrir el módulo de lectura para escuchar el documento.';
  }

  return 'Comando reconocido. AccesIA entendió la solicitud y muestra una respuesta clara en pantalla.';
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
  const [transcript, setTranscript] = useState('Presiona “Hablar ahora” para iniciar la captura de voz o la simulación.');
  const [response, setResponse] = useState('Estoy lista para ayudarte con lectura, subtítulos o configuración.');
  const [confidence, setConfidence] = useState(0);
  const [recognitionSource, setRecognitionSource] = useState<'browser' | 'simulation'>('simulation');

  async function handleVoiceCommand() {
    setVoiceCommandsEnabled(true);
    setVoiceState('listening');
    setTranscript('Escuchando comando de voz...');
    setResponse('Procesando solicitud...');

    const result = await listenForCommand();
    const nextResponse = buildAssistantResponse(result.transcript);

    setVoiceState('answered');
    setTranscript(`“${result.transcript}”`);
    setConfidence(Math.round(result.confidence * 100));
    setRecognitionSource(result.source);
    setResponse(nextResponse);

    if (result.transcript.toLowerCase().includes('subtítulo')) {
      setSubtitlesEnabled(true);
    }

    if (result.transcript.toLowerCase().includes('letra')) {
      increaseFontScale();
    }
  }

  function playResponse() {
    const wasSpoken = speakText(response, {
      rate: settings.readingSpeed,
      onError: () => setResponse('Respuesta visible: el navegador actual no permite reproducir voz.'),
    });

    if (wasSpoken) {
      setResponse(`${response} Reproduciendo confirmación auditiva.`);
    }
  }

  return (
    <ScreenContainer>
      <AppHeader title="Asistente de voz" subtitle="Comandos hablados y respuesta clara" />

      <View
        accessible
        accessibilityLabel="Panel principal del asistente de voz."
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
              {voiceState === 'listening' ? 'Escuchando' : voiceState === 'answered' ? 'Reconocido' : 'Listo'}
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
          Habla o usa una simulación inteligente.
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
          En navegadores compatibles usa reconocimiento de voz. Si no está disponible, AccesIA simula el comando para validar el flujo.
        </Text>

        <AccessibleButton
          accessibilityHint="Captura o simula un comando hablado y lo convierte en texto visible."
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
          <Text style={[styles.metricValue, { color: colors.text, fontSize: fontSizes.xl * fontMultiplier }]}>{recognitionSource === 'browser' ? 'Real' : 'Demo'}</Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>origen</Text>
        </View>
      </View>

      <View style={styles.timeline}>
        <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
        <InfoCard icon="create-outline" text={transcript} title="Texto detectado" tone="secondary" />
        <InfoCard icon="sparkles-outline" text={response} title="Respuesta de AccesIA" tone="accent" />
        <InfoCard
          icon="shield-checkmark-outline"
          text="La app muestra confirmación visual y puede reproducir una respuesta hablada. Los permisos de micrófono se deben solicitar explícitamente en una implementación completa."
          title="Confirmación accesible"
          tone="primary"
        />
      </View>

      <AccessibleButton
        accessibilityHint="Reproduce la respuesta del asistente mediante síntesis de voz en web."
        icon="volume-high-outline"
        onPress={playResponse}
        title="Reproducir respuesta"
        variant="secondary"
      />

      <InfoCard
        icon={isVoiceRecognitionAvailable() ? 'checkmark-circle-outline' : 'alert-circle-outline'}
        text={
          isVoiceRecognitionAvailable()
            ? 'El navegador expone reconocimiento de voz. La prueba puede usar entrada hablada real.'
            : 'Reconocimiento real no disponible en este entorno. Se usa simulación para demostrar la experiencia.'
        }
        title="Estado del reconocimiento"
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
    marginTop: spacing.section,
  },
  timelineLine: {
    position: 'absolute',
    bottom: 18,
    left: 22,
    top: 18,
    width: 2,
  },
});
