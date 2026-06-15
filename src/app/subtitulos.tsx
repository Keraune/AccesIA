import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AccessibleButton } from '@/components/AccessibleButton';
import { AppHeader } from '@/components/AppHeader';
import { IconBadge } from '@/components/IconBadge';
import { InfoCard } from '@/components/InfoCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { LiveCaptionSource, useAccessibility } from '@/context/AccessibilityContext';

const sourceOptions: Array<{
  id: LiveCaptionSource;
  title: string;
  description: string;
  icon: 'phone-portrait-outline' | 'play-circle-outline' | 'musical-notes-outline' | 'school-outline';
}> = [
  {
    id: 'device',
    title: 'Audio cercano',
    description: 'Conversaciones, avisos o audio del entorno.',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'video',
    title: 'Video',
    description: 'Clases, tutoriales o contenido multimedia.',
    icon: 'play-circle-outline',
  },
  {
    id: 'music',
    title: 'Música',
    description: 'Descripción textual de ritmo, voz y cambios de intensidad.',
    icon: 'musical-notes-outline',
  },
  {
    id: 'classroom',
    title: 'Clase',
    description: 'Indicaciones del docente y puntos importantes.',
    icon: 'school-outline',
  },
];

const previewLines: Record<LiveCaptionSource, string[]> = {
  device: [
    'Se detecta voz cercana. AccesIA muestra el mensaje principal en pantalla.',
    'La persona indica que revises el contenido antes de continuar.',
  ],
  video: [
    'El video explica una función de accesibilidad paso a paso.',
    'En pantalla se observa un ejemplo con botones grandes.',
  ],
  music: [
    'Música detectada: ritmo constante y volumen medio.',
    'Aparece un fragmento vocal breve dentro de la pista.',
  ],
  classroom: [
    'El docente está explicando los criterios de entrega.',
    'Se solicita revisar la legibilidad y la navegación.',
  ],
};

export default function CaptionsScreen() {
  const {
    colors,
    fontMultiplier,
    liveCaptionSource,
    liveCaptionsActive,
    settings,
    setLiveCaptionSource,
    startLiveCaptions,
    stopLiveCaptions,
  } = useAccessibility();
  const [previewIndex, setPreviewIndex] = useState(0);

  const previewText = useMemo(
    () => previewLines[liveCaptionSource][previewIndex % previewLines[liveCaptionSource].length],
    [liveCaptionSource, previewIndex],
  );

  return (
    <ScreenContainer>
      <AppHeader title="Subtítulos flotantes" subtitle="Texto sobre contenido con audio" />

      <View
        accessible
        accessibilityLabel="Panel de subtítulos flotantes de AccesIA."
        style={[
          styles.heroPanel,
          {
            backgroundColor: colors.primaryDeep,
            borderColor: settings.highContrast ? colors.border : 'rgba(255,255,255,0.14)',
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.heroGlowOne} />
        <View style={styles.heroGlowTwo} />

        <View style={styles.heroHeader}>
          <View style={[styles.modePill, { backgroundColor: 'rgba(255,255,255,0.12)' }]}> 
            <View style={[styles.modeDot, { backgroundColor: liveCaptionsActive ? colors.accent : colors.secondary }]} />
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
              {liveCaptionsActive ? 'Panel activo' : 'Listo para activar'}
            </Text>
          </View>
          <IconBadge icon="chatbox-ellipses-outline" inverted size="sm" tone="accent" />
        </View>

        <Text
          style={[
            styles.heroTitle,
            {
              color: colors.white,
              fontSize: fontSizes.display * fontMultiplier,
              lineHeight: lineHeights.display * fontMultiplier,
            },
          ]}
        >
          Activa subtítulos sobre la pantalla.
        </Text>
        <Text
          style={[
            styles.heroText,
            {
              color: 'rgba(255,255,255,0.78)',
              fontSize: fontSizes.md * fontMultiplier,
              lineHeight: lineHeights.md * fontMultiplier,
            },
          ]}
        >
          El botón flotante queda disponible en la app. Al activarlo, AccesIA muestra una ventana inferior con subtítulos, tipo de audio detectado y nivel de sonido.
        </Text>

        <AccessibleButton
          accessibilityHint="Activa el panel flotante de subtítulos en la pantalla."
          icon={liveCaptionsActive ? 'radio-outline' : 'chatbox-ellipses-outline'}
          onPress={() => startLiveCaptions(liveCaptionSource)}
          title={liveCaptionsActive ? 'Subtítulos activos' : 'Activar subtítulos flotantes'}
          variant="accent"
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text
          style={[
            styles.sectionKicker,
            {
              color: colors.accent,
              fontSize: fontSizes.xs * fontMultiplier,
              lineHeight: lineHeights.xs * fontMultiplier,
            },
          ]}
        >
          Fuente de audio
        </Text>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
              fontSize: fontSizes.xxl * fontMultiplier,
              lineHeight: lineHeights.xxl * fontMultiplier,
            },
          ]}
        >
          ¿Qué quieres subtitular?
        </Text>
      </View>

      <View style={styles.sourceGrid}>
        {sourceOptions.map((option) => {
          const selected = liveCaptionSource === option.id;

          return (
            <Pressable
              accessibilityHint={`Selecciona ${option.title} como fuente para subtítulos.`}
              accessibilityLabel={`${option.title}. ${option.description}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={option.id}
              onPress={() => setLiveCaptionSource(option.id)}
              style={({ pressed }) => [
                styles.sourceCard,
                {
                  backgroundColor: selected ? colors.primaryDeep : colors.surface,
                  borderColor: selected ? colors.accent : colors.border,
                  opacity: pressed ? 0.9 : 1,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <View style={[styles.sourceIcon, { backgroundColor: selected ? 'rgba(255,255,255,0.14)' : colors.accentSoft }]}> 
                <Ionicons color={selected ? colors.white : colors.accent} name={option.icon} size={22} />
              </View>
              <Text
                style={[
                  styles.sourceTitle,
                  {
                    color: selected ? colors.white : colors.text,
                    fontSize: fontSizes.md * fontMultiplier,
                    lineHeight: lineHeights.md * fontMultiplier,
                  },
                ]}
              >
                {option.title}
              </Text>
              <Text
                style={[
                  styles.sourceDescription,
                  {
                    color: selected ? 'rgba(255,255,255,0.72)' : colors.textMuted,
                    fontSize: fontSizes.xs * fontMultiplier,
                    lineHeight: lineHeights.xs * fontMultiplier,
                  },
                ]}
              >
                {option.description}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={[
          styles.previewDevice,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={[styles.previewScreen, { backgroundColor: colors.primaryDeep }]}> 
          <View style={styles.fakeVideoTopBar}>
            <View style={[styles.fakeDot, { backgroundColor: colors.danger }]} />
            <View style={[styles.fakeDot, { backgroundColor: colors.warning }]} />
            <View style={[styles.fakeDot, { backgroundColor: colors.success }]} />
          </View>

          <View style={styles.fakeVideoContent}>
            <Ionicons color={colors.white} name="play" size={38} />
            <Text
              style={[
                styles.fakeVideoTitle,
                {
                  color: colors.white,
                  fontSize: fontSizes.lg * fontMultiplier,
                  lineHeight: lineHeights.lg * fontMultiplier,
                },
              ]}
            >
              Contenido con audio
            </Text>
          </View>

          <View style={[styles.fakeCaption, { backgroundColor: 'rgba(0,0,0,0.72)' }]}> 
            <Text
              style={[
                styles.fakeCaptionText,
                {
                  color: colors.white,
                  fontSize: fontSizes.sm * fontMultiplier,
                  lineHeight: lineHeights.sm * fontMultiplier,
                },
              ]}
            >
              {previewText}
            </Text>
          </View>
        </View>

        <View style={styles.previewActions}>
          <AccessibleButton
            accessibilityHint="Muestra otra línea de subtítulo de ejemplo."
            fullWidth={false}
            icon="refresh-outline"
            onPress={() => setPreviewIndex((current) => current + 1)}
            style={styles.previewButton}
            title="Cambiar línea"
            variant="secondary"
          />
          <AccessibleButton
            accessibilityHint="Detiene el panel flotante de subtítulos."
            fullWidth={false}
            icon="stop-outline"
            onPress={stopLiveCaptions}
            style={styles.previewButton}
            title="Detener"
            variant="ghost"
          />
        </View>
      </View>

      <InfoCard
        icon="shield-checkmark-outline"
        text="El acceso al micrófono o audio debe solicitar permiso del usuario. AccesIA muestra siempre un indicador visible cuando los subtítulos están activos."
        title="Privacidad visible"
        tone="primary"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroPanel: {
    gap: spacing.xl,
    borderWidth: 1,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.28,
    shadowRadius: 40,
    elevation: 10,
  },
  heroGlowOne: {
    position: 'absolute',
    top: -88,
    right: -74,
    width: 190,
    height: 190,
    borderRadius: 140,
    backgroundColor: 'rgba(124, 58, 237, 0.32)',
  },
  heroGlowTwo: {
    position: 'absolute',
    bottom: -90,
    left: -72,
    width: 180,
    height: 180,
    borderRadius: 130,
    backgroundColor: 'rgba(6, 182, 212, 0.24)',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modeDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  modePillText: {
    fontWeight: fontWeights.extraBold,
  },
  heroTitle: {
    fontWeight: fontWeights.black,
    letterSpacing: -1.2,
  },
  heroText: {
    fontWeight: fontWeights.medium,
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
  sourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  sourceCard: {
    width: '47.5%',
    minHeight: 168,
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 5,
  },
  sourceIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  sourceTitle: {
    fontWeight: fontWeights.black,
  },
  sourceDescription: {
    fontWeight: fontWeights.medium,
  },
  previewDevice: {
    gap: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.xxl,
    marginTop: spacing.section,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 30,
    elevation: 6,
  },
  previewScreen: {
    minHeight: 270,
    justifyContent: 'space-between',
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  fakeVideoTopBar: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  fakeDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
  },
  fakeVideoContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
  fakeVideoTitle: {
    fontWeight: fontWeights.black,
  },
  fakeCaption: {
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  fakeCaptionText: {
    fontWeight: fontWeights.extraBold,
    textAlign: 'center',
  },
  previewActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  previewButton: {
    flex: 1,
  },
});
