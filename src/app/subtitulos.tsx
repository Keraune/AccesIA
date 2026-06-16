import { Ionicons } from '@expo/vector-icons';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AccessibleButton } from '@/components/AccessibleButton';
import { AppHeader } from '@/components/AppHeader';
import { IconBadge } from '@/components/IconBadge';
import { InfoCard } from '@/components/InfoCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { CaptionSizeMode, CaptionThemeMode, LiveCaptionSource, useAccessibility } from '@/context/AccessibilityContext';
import type { AppIconName } from '@/data/appModules';
import { openAndroidOverlaySettings, startAndroidFloatingAssistant, stopAndroidFloatingAssistant } from '@/services/systemOverlay';

type SourceOption = {
  id: LiveCaptionSource;
  title: string;
  description: string;
  icon: AppIconName;
};

type OptionButton<T> = {
  label: string;
  value: T;
};

const sourceOptions: SourceOption[] = [
  {
    id: 'device',
    title: 'Micrófono',
    description: 'Audio cercano, conversaciones o reuniones presenciales.',
    icon: 'mic-outline',
  },
  {
    id: 'video',
    title: 'Multimedia',
    description: 'Videos, navegador o aplicaciones con contenido hablado.',
    icon: 'play-circle-outline',
  },
  {
    id: 'music',
    title: 'Sonido',
    description: 'Eventos sonoros, música o avisos importantes.',
    icon: 'musical-notes-outline',
  },
  {
    id: 'classroom',
    title: 'Clase o reunión',
    description: 'Explicaciones, indicaciones y participación grupal.',
    icon: 'school-outline',
  },
];

const captionSizeOptions: OptionButton<CaptionSizeMode>[] = [
  { label: 'Mediano', value: 'medium' },
  { label: 'Grande', value: 'large' },
  { label: 'Extra', value: 'extraLarge' },
];

const captionThemeOptions: OptionButton<CaptionThemeMode>[] = [
  { label: 'Oscuro', value: 'dark' },
  { label: 'Azul', value: 'blue' },
  { label: 'Claro', value: 'light' },
];

export default function CaptionsScreen() {
  const {
    captionFontMultiplier,
    colors,
    fontMultiplier,
    liveCaptionSource,
    liveCaptionsActive,
    settings,
    setCaptionSize,
    setCaptionTheme,
    setLiveCaptionSource,
    startLiveCaptions,
    stopLiveCaptions,
  } = useAccessibility();

  const selectedSource = sourceOptions.find((source) => source.id === liveCaptionSource) ?? sourceOptions[0];
  const captionPanelBackground = settings.captionTheme === 'light'
    ? colors.white
    : settings.captionTheme === 'blue'
      ? colors.primary
      : colors.primaryDeep;
  const captionPanelText = settings.captionTheme === 'light' ? colors.text : colors.white;
  const captionState = liveCaptionsActive ? 'Subtítulos activos' : 'Inactivo';
  const captionPreviewText = liveCaptionsActive ? 'Esperando audio…' : 'Activa la burbuja para iniciar.';

  async function startSystemBubble() {
    try {
      const result = await startAndroidFloatingAssistant({
        source: liveCaptionSource,
        theme: settings.captionTheme,
        scale: captionFontMultiplier,
        minimize: true,
      });

      if (result.started) {
        startLiveCaptions(liveCaptionSource);
        return;
      }

      if (result.reason === 'permission-required') {
        Alert.alert(
          'Permiso requerido',
          'Activa “Mostrar sobre otras apps” para que la burbuja pueda aparecer encima de otras aplicaciones.',
        );
        return;
      }

      Alert.alert(
        'APK nativa requerida',
        'La burbuja flotante funciona con el módulo nativo Android. Genera una APK nativa para probarla fuera de la app.',
      );
    } catch {
      Alert.alert(
        'No se pudo iniciar',
        'Revisa el permiso de superposición o intenta abrir la burbuja desde Ajustes.',
      );
    }
  }

  async function stopAllCaptions() {
    stopLiveCaptions();
    if (Platform.OS === 'android') {
      await stopAndroidFloatingAssistant();
    }
  }

  return (
    <ScreenContainer>
      <AppHeader title="Subtítulos" subtitle="Burbuja flotante y estilo de lectura" />

      <View
        style={[
          styles.heroPanel,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.heroTop}>
          <IconBadge icon="chatbox-ellipses-outline" size="lg" tone="accent" />
          <View style={[styles.statusPill, { backgroundColor: liveCaptionsActive ? colors.successSoft : colors.surfaceElevated }]}> 
            <View style={[styles.statusDot, { backgroundColor: liveCaptionsActive ? colors.success : colors.textSubtle }]} />
            <Text style={[styles.statusText, { color: liveCaptionsActive ? colors.success : colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}> 
              {captionState}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.heroTitle,
            {
              color: colors.text,
              fontSize: fontSizes.display * fontMultiplier,
              lineHeight: lineHeights.display * fontMultiplier,
            },
          ]}
        >
          Subtítulos sobre otras aplicaciones.
        </Text>
        <Text
          style={[
            styles.heroText,
            {
              color: colors.textMuted,
              fontSize: fontSizes.md * fontMultiplier,
              lineHeight: lineHeights.md * fontMultiplier,
            },
          ]}
        >
          Activa la burbuja del sistema Android, arrástrala donde prefieras y abre su panel para controlar subtítulos sin volver a AccesIA.
        </Text>

        <View style={styles.systemActions}>
          <AccessibleButton
            accessibilityHint="Abre la pantalla del sistema para permitir mostrar AccesIA sobre otras aplicaciones."
            fullWidth={false}
            icon="shield-checkmark-outline"
            onPress={() => void openAndroidOverlaySettings()}
            style={styles.systemButton}
            title="Dar permiso"
            variant="secondary"
          />
          <AccessibleButton
            accessibilityHint="Inicia o detiene la burbuja flotante de subtítulos."
            fullWidth={false}
            icon={liveCaptionsActive ? 'stop-circle-outline' : 'albums-outline'}
            onPress={() => liveCaptionsActive ? void stopAllCaptions() : void startSystemBubble()}
            style={styles.systemButton}
            title={liveCaptionsActive ? 'Detener' : 'Activar burbuja'}
            variant={liveCaptionsActive ? 'ghost' : 'accent'}
          />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionKicker, { color: colors.accent, fontSize: fontSizes.xs * fontMultiplier }]}>Fuente</Text>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.xxl * fontMultiplier }]}>Qué quieres subtitular</Text>
      </View>

      <View style={styles.sourceGrid}>
        {sourceOptions.map((option) => {
          const selected = liveCaptionSource === option.id;
          return (
            <Pressable
              accessibilityHint={`Selecciona ${option.title} como fuente de subtítulos.`}
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
              <Ionicons color={selected ? colors.white : colors.accent} name={option.icon} size={24} />
              <Text style={[styles.sourceTitle, { color: selected ? colors.white : colors.text, fontSize: fontSizes.md * fontMultiplier }]}>{option.title}</Text>
              <Text style={[styles.sourceDescription, { color: selected ? 'rgba(255,255,255,0.72)' : colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>{option.description}</Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={[
          styles.previewCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.previewHeader}>
          <View style={styles.previewTitleBlock}>
            <Text style={[styles.sectionKicker, { color: colors.accent, fontSize: fontSizes.xs * fontMultiplier }]}>Vista previa</Text>
            <Text style={[styles.previewTitle, { color: colors.text, fontSize: fontSizes.lg * fontMultiplier }]}>{selectedSource.title}</Text>
          </View>
          <Ionicons color={colors.textMuted} name={selectedSource.icon} size={24} />
        </View>
        <View style={[styles.captionPreview, { backgroundColor: captionPanelBackground, borderColor: colors.border }]}> 
          <Text
            accessibilityLabel={`Estado de subtítulos: ${captionPreviewText}`}
            style={[
              styles.captionPreviewText,
              {
                color: captionPanelText,
                fontSize: fontSizes.md * captionFontMultiplier,
                lineHeight: lineHeights.md * captionFontMultiplier,
              },
            ]}
          >
            {captionPreviewText}
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionKicker, { color: colors.accent, fontSize: fontSizes.xs * fontMultiplier }]}>Diseño</Text>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.xxl * fontMultiplier }]}>Apariencia del subtítulo</Text>
      </View>

      <View style={styles.optionPanel}>
        <Text style={[styles.smallLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>Tamaño</Text>
        <View style={styles.actionsGrid}>
          {captionSizeOptions.map((option) => (
            <AccessibleButton
              accessibilityHint={`Cambia el tamaño de subtítulos a ${option.label}.`}
              fullWidth={false}
              key={option.value}
              onPress={() => setCaptionSize(option.value)}
              style={styles.actionButton}
              title={option.label}
              variant={settings.captionSize === option.value ? 'accent' : 'secondary'}
            />
          ))}
        </View>
        <Text style={[styles.smallLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>Estilo</Text>
        <View style={styles.actionsGrid}>
          {captionThemeOptions.map((option) => (
            <AccessibleButton
              accessibilityHint={`Cambia el estilo visual de subtítulos a ${option.label}.`}
              fullWidth={false}
              key={option.value}
              onPress={() => setCaptionTheme(option.value)}
              style={styles.actionButton}
              title={option.label}
              variant={settings.captionTheme === option.value ? 'accent' : 'secondary'}
            />
          ))}
        </View>
      </View>

      <InfoCard
        icon="information-circle-outline"
        text="La captura de audio interno requiere permisos nativos de Android. La estructura de burbuja queda separada de la interfaz principal para integrarla de forma estable."
        title="Funcionamiento"
        tone="primary"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroPanel: {
    gap: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 5,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  statusText: {
    fontWeight: fontWeights.extraBold,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontWeight: fontWeights.black,
    letterSpacing: -1.1,
  },
  heroText: {
    fontWeight: fontWeights.medium,
  },
  systemActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  systemButton: {
    flex: 1,
    minWidth: 134,
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
    minHeight: 154,
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
  },
  sourceTitle: {
    fontWeight: fontWeights.black,
  },
  sourceDescription: {
    fontWeight: fontWeights.medium,
  },
  previewCard: {
    gap: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.xxl,
    marginTop: spacing.section,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 22,
    elevation: 4,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  previewTitleBlock: {
    flex: 1,
  },
  previewTitle: {
    fontWeight: fontWeights.black,
  },
  captionPreview: {
    minHeight: 92,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  captionPreviewText: {
    fontWeight: fontWeights.black,
    textAlign: 'center',
  },
  optionPanel: {
    gap: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    minWidth: 96,
  },
  smallLabel: {
    fontWeight: fontWeights.extraBold,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
});
