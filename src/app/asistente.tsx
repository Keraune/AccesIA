import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AccessibleButton } from '@/components/AccessibleButton';
import { AppHeader } from '@/components/AppHeader';
import { InfoCard } from '@/components/InfoCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';

type VoiceState = 'idle' | 'listening' | 'answered';

export default function AssistantScreen() {
  const { colors, fontMultiplier, settings, setVoiceCommandsEnabled } =
    useAccessibility();
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState(
    'Presiona “Hablar ahora” para iniciar la simulación.',
  );
  const [response, setResponse] = useState(
    'Estoy lista para ayudarte con lectura, subtítulos o configuración.',
  );

  function simulateVoiceCommand() {
    setVoiceCommandsEnabled(true);
    setVoiceState('listening');
    setTranscript('Escuchando comando de voz...');
    setResponse('Procesando solicitud...');

    setTimeout(() => {
      setVoiceState('answered');
      setTranscript('“AccesIA, activa subtítulos y aumenta la letra.”');
      setResponse(
        'Listo. El comando fue reconocido y se muestra como texto para validar el flujo.',
      );
    }, 900);
  }

  return (
    <ScreenContainer>
      <AppHeader title="Asistente de voz" subtitle="Comandos hablados y respuesta clara" />

      <View
        accessible
        accessibilityLabel="Panel principal del asistente de voz."
        style={[
          styles.voiceCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={[
            styles.microphoneMark,
            {
              backgroundColor: settings.highContrast
                ? colors.accentSoft
                : colors.primarySoft,
              borderColor: voiceState === 'listening' ? colors.accent : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.microphoneText,
              {
                color: settings.highContrast ? colors.accent : colors.primary,
                fontSize: fontSizes.xl * fontMultiplier,
                lineHeight: lineHeights.xl * fontMultiplier,
              },
            ]}
          >
            VOZ
          </Text>
        </View>
        <Text
          style={[
            styles.status,
            {
              color: colors.text,
              fontSize: fontSizes.xl * fontMultiplier,
              lineHeight: lineHeights.xl * fontMultiplier,
            },
          ]}
        >
          {voiceState === 'listening'
            ? 'Escuchando...'
            : voiceState === 'answered'
              ? 'Comando reconocido'
              : 'Listo para escuchar'}
        </Text>
        <AccessibleButton
          accessibilityHint="Simula la captura de un comando hablado y su conversión a texto."
          onPress={simulateVoiceCommand}
          title="Hablar ahora"
        />
      </View>

      <InfoCard text={transcript} title="Texto detectado" tone="primary" />
      <InfoCard text={response} title="Respuesta de AccesIA" tone="accent" />

      <AccessibleButton
        accessibilityHint="Simula la reproducción hablada de la respuesta del asistente."
        onPress={() =>
          setResponse(
            'Reproduciendo respuesta: estoy lista para ayudarte con una instrucción clara.',
          )
        }
        title="Reproducir respuesta"
        variant="secondary"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  voiceCard: {
    alignItems: 'center',
    gap: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xxl,
  },
  microphoneMark: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: radius.xl,
  },
  microphoneText: {
    fontWeight: fontWeights.extraBold,
    letterSpacing: 1.2,
  },
  status: {
    fontWeight: fontWeights.extraBold,
    textAlign: 'center',
  },
});
