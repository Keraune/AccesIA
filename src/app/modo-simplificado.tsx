import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AccessibleButton } from '@/components/AccessibleButton';
import { AppHeader } from '@/components/AppHeader';
import { InfoCard } from '@/components/InfoCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';

export default function SimplifiedModeScreen() {
  const router = useRouter();
  const { colors, fontMultiplier, setSimplifiedMode } = useAccessibility();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <ScreenContainer showBottomNavigation={false}>
      <AppHeader title="Modo simple" subtitle="Solo funciones esenciales" />

      <View
        accessible
        accessibilityLabel="Modo simplificado. Elige una acción principal."
        style={[
          styles.hero,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontSize: fontSizes.display * fontMultiplier,
              lineHeight: lineHeights.display * fontMultiplier,
            },
          ]}
        >
          ¿Qué necesitas hacer?
        </Text>
        <Text
          style={[
            styles.description,
            {
              color: colors.textMuted,
              fontSize: fontSizes.lg * fontMultiplier,
              lineHeight: lineHeights.lg * fontMultiplier,
            },
          ]}
        >
          Pantalla con menos opciones, botones grandes y textos directos.
        </Text>
      </View>

      <View style={styles.actions}>
        <AccessibleButton
          accessibilityHint="Abre la pantalla para escuchar textos."
          onPress={() => router.push('/lectura' as never)}
          title="Escuchar texto"
          variant="primary"
        />
        <AccessibleButton
          accessibilityHint="Abre el asistente de voz."
          onPress={() => router.push('/asistente' as never)}
          title="Hablar"
          variant="primary"
        />
        <AccessibleButton
          accessibilityHint="Abre subtítulos automáticos simulados."
          onPress={() => router.push('/subtitulos' as never)}
          title="Subtítulos"
          variant="primary"
        />
        <AccessibleButton
          accessibilityHint="Muestra ayuda rápida para entender esta pantalla."
          onPress={() => setShowHelp((current) => !current)}
          title="Ayuda"
          variant="accent"
        />
      </View>

      {showHelp ? (
        <InfoCard
          text="Elige una acción. Puedes escuchar un texto, hablar con el asistente, activar subtítulos o volver al inicio."
          title="Ayuda rápida"
          tone="accent"
        />
      ) : null}

      <AccessibleButton
        accessibilityHint="Desactiva el modo simplificado y vuelve al inicio."
        onPress={() => {
          setSimplifiedMode(false);
          router.push('/' as never);
        }}
        title="Volver al inicio"
        variant="secondary"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xxl,
  },
  title: {
    fontWeight: fontWeights.extraBold,
    marginBottom: spacing.md,
  },
  description: {
    fontWeight: fontWeights.medium,
  },
  actions: {
    gap: spacing.md,
    marginVertical: spacing.section,
  },
});
