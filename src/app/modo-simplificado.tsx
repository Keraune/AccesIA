import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

export default function SimplifiedModeScreen() {
  const router = useRouter();
  const { colors, fontMultiplier, setSimplifiedMode } = useAccessibility();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <ScreenContainer showBottomNavigation={false}>
      <AppHeader title="Modo simple" subtitle="Solo funciones esenciales" showSettings={false} />

      <View
        accessible
        accessibilityLabel="Modo simplificado. Elige una acción principal."
        style={[
          styles.hero,
          {
            backgroundColor: colors.primaryDeep,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.heroTop}>
          <IconBadge icon="sparkles-outline" inverted size="lg" tone="accent" />
          <View style={[styles.modePill, { backgroundColor: 'rgba(255,255,255,0.12)' }]}> 
            <Ionicons color={colors.white} name="eye-outline" size={16} />
            <Text
              style={[
                styles.modePillText,
                {
                  color: colors.white,
                  fontSize: fontSizes.xs * fontMultiplier,
                  lineHeight: lineHeights.xs * fontMultiplier,
                },
              ]}
            >
              Baja carga visual
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.title,
            {
              color: colors.white,
              fontSize: fontSizes.hero * fontMultiplier,
              lineHeight: lineHeights.hero * fontMultiplier,
            },
          ]}
        >
          ¿Qué necesitas hacer?
        </Text>
        <Text
          style={[
            styles.description,
            {
              color: 'rgba(255,255,255,0.78)',
              fontSize: fontSizes.lg * fontMultiplier,
              lineHeight: lineHeights.lg * fontMultiplier,
            },
          ]}
        >
          Cuatro acciones grandes, texto corto y navegación directa.
        </Text>
      </View>

      <View style={styles.actions}>
        <AccessibleButton
          accessibilityHint="Abre la pantalla para escuchar textos."
          description="Lee información con apoyo auditivo."
          icon="volume-high-outline"
          onPress={() => router.push('/lectura' as never)}
          title="Escuchar texto"
          variant="primary"
        />
        <AccessibleButton
          accessibilityHint="Abre el asistente de voz."
          description="Usa una instrucción hablada o una entrada guiada."
          icon="mic-outline"
          onPress={() => router.push('/asistente' as never)}
          title="Hablar"
          variant="primary"
        />
        <AccessibleButton
          accessibilityHint="Abre subtítulos automáticos."
          description="Muestra texto grande para contenido con audio."
          icon="chatbubbles-outline"
          onPress={() => router.push('/subtitulos' as never)}
          title="Subtítulos"
          variant="primary"
        />
        <AccessibleButton
          accessibilityHint="Muestra ayuda rápida para entender esta pantalla."
          description="Explica cómo usar este modo."
          icon="help-circle-outline"
          onPress={() => setShowHelp((current) => !current)}
          title="Ayuda"
          variant="accent"
        />
      </View>

      {showHelp ? (
        <InfoCard
          icon="help-buoy-outline"
          text="Elige una acción. Puedes escuchar un texto, hablar con el asistente, activar subtítulos o volver al inicio."
          title="Ayuda rápida"
          tone="accent"
        />
      ) : null}

      <AccessibleButton
        accessibilityHint="Desactiva el modo simplificado y vuelve al inicio."
        icon="home-outline"
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
    gap: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 34,
    elevation: 8,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modePillText: {
    fontWeight: fontWeights.extraBold,
  },
  title: {
    fontWeight: fontWeights.black,
    letterSpacing: -1.2,
  },
  description: {
    fontWeight: fontWeights.medium,
  },
  actions: {
    gap: spacing.md,
    marginVertical: spacing.section,
  },
});
