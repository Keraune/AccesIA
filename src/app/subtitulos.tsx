import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AccessibleButton } from '@/components/AccessibleButton';
import { AppHeader } from '@/components/AppHeader';
import { IconBadge } from '@/components/IconBadge';
import { InfoCard } from '@/components/InfoCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import type { AppColorScheme } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import {
  CaptionLanguageMode,
  CaptionPositionMode,
  CaptionSizeMode,
  CaptionThemeMode,
  LiveCaptionSource,
  OverlayBubblePosition,
  OverlayBubbleSize,
  useAccessibility,
} from '@/context/AccessibilityContext';
import type { AppIconName } from '@/data/appModules';
import { buildCaptionEnginePlan, getCaptionStatusLabel, getCaptionStatusMessage } from '@/services/captionEngine';
import {
  hasAndroidOverlayPermission,
  isAndroidFloatingAssistantActive,
  isAndroidSystemOverlayAvailable,
  openAndroidOverlaySettings,
  startAndroidFloatingAssistant,
  stopAndroidFloatingAssistant,
} from '@/services/systemOverlay';

type SourceOption = {
  id: LiveCaptionSource;
  title: string;
  description: string;
  icon: AppIconName;
};

type OptionButton<T> = {
  label: string;
  value: T;
  description?: string;
};

const sourceOptions: SourceOption[] = [
  {
    id: 'device',
    title: 'Micrófono',
    description: 'Voz cercana, conversaciones o atención presencial.',
    icon: 'mic-outline',
  },
  {
    id: 'video',
    title: 'Multimedia del dispositivo',
    description: 'Videos, navegador o aplicaciones con audio hablado.',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'classroom',
    title: 'Clases y reuniones',
    description: 'Explicaciones, indicaciones y sesiones grupales.',
    icon: 'school-outline',
  },
  {
    id: 'music',
    title: 'Sonidos importantes',
    description: 'Avisos audibles y eventos sonoros del entorno.',
    icon: 'notifications-outline',
  },
];

const captionSizeOptions: OptionButton<CaptionSizeMode>[] = [
  { label: 'Mediano', value: 'medium' },
  { label: 'Grande', value: 'large' },
  { label: 'Extra', value: 'extraLarge' },
];

const captionThemeOptions: OptionButton<CaptionThemeMode>[] = [
  { label: 'Oscuro', value: 'dark', description: 'Fondo oscuro con texto claro' },
  { label: 'Claro', value: 'light', description: 'Fondo claro con texto oscuro' },
  { label: 'Alto contraste', value: 'highContrast', description: 'Máxima legibilidad visual' },
  { label: 'Compacto', value: 'compact', description: 'Ocupa menos espacio' },
];

const captionPositionOptions: OptionButton<CaptionPositionMode>[] = [
  { label: 'Superior', value: 'top' },
  { label: 'Centro', value: 'center' },
  { label: 'Inferior', value: 'bottom' },
];

const captionLanguageOptions: OptionButton<CaptionLanguageMode>[] = [
  { label: 'Español Perú', value: 'es-PE' },
  { label: 'Español España', value: 'es-ES' },
  { label: 'Inglés', value: 'en-US' },
  { label: 'Automático', value: 'auto' },
];

const bubbleSizeOptions: OptionButton<OverlayBubbleSize>[] = [
  { label: 'Compacta', value: 'compact', description: 'Menor espacio en pantalla' },
  { label: 'Estándar', value: 'standard', description: 'Equilibrada para el día a día' },
  { label: 'Grande', value: 'large', description: 'Mejor visibilidad táctil' },
];

const bubblePositionOptions: OptionButton<OverlayBubblePosition>[] = [
  { label: 'Arriba izquierda', value: 'topLeft' },
  { label: 'Arriba derecha', value: 'topRight' },
  { label: 'Abajo izquierda', value: 'bottomLeft' },
  { label: 'Abajo derecha', value: 'bottomRight' },
];

export default function CaptionsScreen() {
  const {
    applySettings,
    captionFontMultiplier,
    colors,
    fontMultiplier,
    liveCaptionSource,
    liveCaptionStatus,
    settings,
    setBubblePosition,
    setBubbleSize,
    setCaptionLanguage,
    setCaptionPosition,
    setCaptionSize,
    setCaptionTheme,
    setLiveCaptionSource,
    setLiveCaptionStatus,
    startLiveCaptions,
    stopLiveCaptions,
  } = useAccessibility();
  const [overlayPermission, setOverlayPermission] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);

  const selectedSource = sourceOptions.find((source) => source.id === liveCaptionSource) ?? sourceOptions[0];
  const nativeOverlayAvailable = isAndroidSystemOverlayAvailable();
  const enginePlan = useMemo(() => buildCaptionEnginePlan({
    source: liveCaptionSource,
    language: settings.captionLanguage,
    size: settings.captionSize,
    position: settings.captionPosition,
    theme: settings.captionTheme,
  }), [liveCaptionSource, settings.captionLanguage, settings.captionPosition, settings.captionSize, settings.captionTheme]);

  const effectiveStatus = !overlayPermission && Platform.OS === 'android'
    ? 'waitingPermission'
    : liveCaptionStatus;
  const statusLabel = getCaptionStatusLabel(effectiveStatus);
  const statusMessage = getCaptionStatusMessage(effectiveStatus);
  const captionPanelBackground = getCaptionBackground(settings.captionTheme, colors);
  const captionPanelText = getCaptionTextColor(settings.captionTheme, colors);

  const refreshOverlayStatus = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setOverlayPermission(false);
      setOverlayActive(false);
      setStatusChecked(true);
      return;
    }

    try {
      const [permission, active] = await Promise.all([
        hasAndroidOverlayPermission(),
        isAndroidFloatingAssistantActive(),
      ]);
      setOverlayPermission(permission);
      setOverlayActive(active);
    } catch {
      setOverlayPermission(false);
      setOverlayActive(false);
    } finally {
      setStatusChecked(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshOverlayStatus();
    }, [refreshOverlayStatus]),
  );

  async function startSystemBubble() {
    try {
      const result = await startAndroidFloatingAssistant({
        source: liveCaptionSource,
        theme: settings.captionTheme,
        scale: captionFontMultiplier,
        captionPosition: settings.captionPosition,
        captionLanguage: settings.captionLanguage,
        bubbleSize: settings.bubbleSize,
        initialPosition: settings.bubblePosition,
        minimize: true,
      });

      if (result.started) {
        startLiveCaptions(liveCaptionSource);
        setLiveCaptionStatus(enginePlan.capability.requiresMediaProjection ? 'waitingPermission' : 'listening');
        setOverlayActive(true);
        await refreshOverlayStatus();
        return;
      }

      if (result.reason === 'permission-required') {
        setLiveCaptionStatus('waitingPermission');
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
      setLiveCaptionStatus('permissionError');
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
    setOverlayActive(false);
    setLiveCaptionStatus('inactive');
    await refreshOverlayStatus();
  }

  function saveCaptionPreferences() {
    applySettings({}, 'Preferencias de subtítulos guardadas.');
    if (overlayActive) {
      void startSystemBubble();
    }
  }

  return (
    <ScreenContainer>
      <AppHeader title="Subtítulos" subtitle="Audio, burbuja y estilos accesibles" />

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
          <View style={[styles.statusPill, { backgroundColor: getStatusSoftColor(effectiveStatus, colors) }]}> 
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(effectiveStatus, colors) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(effectiveStatus, colors), fontSize: fontSizes.xs * fontMultiplier }]}> 
              {statusLabel}
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
          Subtítulos claros en una burbuja externa.
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
          Elige la fuente de audio, ajusta idioma, tamaño, posición y estilo para que el panel flotante use tus preferencias fuera de AccesIA.
        </Text>

        <View style={styles.systemActions}>
          <AccessibleButton
            accessibilityHint="Abre la pantalla del sistema para permitir mostrar AccesIA sobre otras aplicaciones."
            disabled={Platform.OS !== 'android'}
            fullWidth={false}
            icon="shield-checkmark-outline"
            onPress={() => void openAndroidOverlaySettings()}
            style={styles.systemButton}
            title="Dar permiso"
            variant="secondary"
          />
          <AccessibleButton
            accessibilityHint="Inicia o actualiza la burbuja flotante de subtítulos."
            disabled={Platform.OS !== 'android'}
            fullWidth={false}
            icon={overlayActive ? 'refresh-outline' : 'albums-outline'}
            onPress={() => void startSystemBubble()}
            style={styles.systemButton}
            title={overlayActive ? 'Actualizar burbuja' : 'Activar burbuja'}
            variant="accent"
          />
          <AccessibleButton
            accessibilityHint="Detiene la burbuja flotante de subtítulos."
            disabled={Platform.OS !== 'android' || !overlayActive}
            fullWidth={false}
            icon="stop-circle-outline"
            onPress={() => void stopAllCaptions()}
            style={styles.systemButton}
            title="Detener"
            variant="ghost"
          />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionKicker, { color: colors.accent, fontSize: fontSizes.xs * fontMultiplier }]}>Estado</Text>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.xxl * fontMultiplier }]}>Permisos y sesión</Text>
      </View>

      <View style={styles.statusGrid}>
        <StatusCard
          description={Platform.OS !== 'android'
            ? 'La superposición del sistema se prueba en Android.'
            : overlayPermission
              ? 'AccesIA puede mostrarse encima de otras apps.'
              : 'Abre el permiso para usar la burbuja flotante.'}
          label="Permiso"
          tone={overlayPermission ? 'success' : 'warning'}
          value={Platform.OS !== 'android' ? 'Solo Android' : overlayPermission ? 'Concedido' : 'Pendiente'}
        />
        <StatusCard
          description={statusChecked
            ? overlayActive
              ? 'El panel flotante está disponible fuera de la app.'
              : 'Inicia la burbuja para controlar subtítulos sobre otras apps.'
            : 'Comprobando el estado de Android…'}
          label="Burbuja"
          tone={overlayActive ? 'success' : 'default'}
          value={Platform.OS !== 'android' ? 'No disponible' : overlayActive ? 'Activa' : 'Detenida'}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionKicker, { color: colors.accent, fontSize: fontSizes.xs * fontMultiplier }]}>Fuente de audio</Text>
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
              onPress={() => {
                setLiveCaptionSource(option.id);
                setLiveCaptionStatus(option.id === 'device' ? 'listening' : 'waitingPermission');
              }}
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

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionKicker, { color: colors.accent, fontSize: fontSizes.xs * fontMultiplier }]}>Preferencias</Text>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.xxl * fontMultiplier }]}>Idioma, tamaño y posición</Text>
      </View>

      <View style={styles.optionPanel}>
        <OptionGroup
          currentValue={settings.captionLanguage}
          label="Idioma"
          options={captionLanguageOptions}
          onSelect={setCaptionLanguage}
        />
        <OptionGroup
          currentValue={settings.captionSize}
          label="Tamaño de texto"
          options={captionSizeOptions}
          onSelect={setCaptionSize}
        />
        <OptionGroup
          currentValue={settings.captionPosition}
          label="Posición del subtítulo"
          options={captionPositionOptions}
          onSelect={setCaptionPosition}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionKicker, { color: colors.accent, fontSize: fontSizes.xs * fontMultiplier }]}>Diseño</Text>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.xxl * fontMultiplier }]}>Estilo visual</Text>
      </View>

      <View style={styles.actionsGrid}>
        {captionThemeOptions.map((option) => (
          <AccessibleButton
            accessibilityHint={`Cambia el estilo visual de subtítulos a ${option.label}.`}
            description={option.description}
            fullWidth={false}
            key={option.value}
            onPress={() => setCaptionTheme(option.value)}
            style={styles.doubleButton}
            title={option.label}
            variant={settings.captionTheme === option.value ? 'accent' : 'secondary'}
          />
        ))}
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
        <View style={[styles.devicePreview, { backgroundColor: colors.backgroundAlt, borderColor: colors.border, justifyContent: getPreviewPosition(settings.captionPosition) }]}> 
          <View style={[
            styles.captionPreview,
            settings.captionTheme === 'compact' ? styles.captionPreviewCompact : null,
            { backgroundColor: captionPanelBackground, borderColor: colors.borderStrong },
          ]}> 
            <Text
              accessibilityLabel={`Estado de subtítulos: ${statusMessage}`}
              style={[
                styles.captionPreviewText,
                {
                  color: captionPanelText,
                  fontSize: fontSizes.md * captionFontMultiplier,
                  lineHeight: lineHeights.md * captionFontMultiplier,
                },
              ]}
            >
              {statusMessage}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionKicker, { color: colors.accent, fontSize: fontSizes.xs * fontMultiplier }]}>Burbuja</Text>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.xxl * fontMultiplier }]}>Tamaño y posición inicial</Text>
      </View>

      <View style={styles.optionPanel}>
        <OptionGroup
          currentValue={settings.bubbleSize}
          label="Tamaño de burbuja"
          options={bubbleSizeOptions}
          onSelect={setBubbleSize}
        />
        <OptionGroup
          currentValue={settings.bubblePosition}
          label="Posición inicial"
          options={bubblePositionOptions}
          onSelect={setBubblePosition}
          twoColumns
        />
      </View>

      <AccessibleButton
        accessibilityHint="Guarda las preferencias actuales para subtítulos y actualiza la burbuja si está activa."
        icon="save-outline"
        onPress={saveCaptionPreferences}
        title="Guardar preferencias"
        variant="primary"
      />

      {enginePlan.readyForMediaProjection ? (
        <InfoCard
          icon="phone-portrait-outline"
          text="Para audio de otras aplicaciones, Android solicitará autorización adicional antes de iniciar la transcripción."
          title="Audio del dispositivo"
          tone="primary"
        />
      ) : (
        <InfoCard
          icon={nativeOverlayAvailable ? 'checkmark-circle-outline' : 'warning-outline'}
          text={nativeOverlayAvailable ? 'La burbuja usará el micrófono como fuente inicial y mostrará el estado real del subtitulado.' : 'La burbuja del sistema necesita una compilación nativa de Android.'}
          title={nativeOverlayAvailable ? 'Configuración lista' : 'Compilación nativa requerida'}
          tone={nativeOverlayAvailable ? 'success' : 'warning'}
        />
      )}
    </ScreenContainer>
  );
}

function StatusCard({ label, value, description, tone }: { label: string; value: string; description: string; tone: 'success' | 'warning' | 'default' }) {
  const { colors, fontMultiplier } = useAccessibility();
  const valueColor = tone === 'success' ? colors.success : tone === 'warning' ? colors.warning : colors.text;

  return (
    <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
      <Text style={[styles.statusCardLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>{label}</Text>
      <Text style={[styles.statusCardValue, { color: valueColor, fontSize: fontSizes.lg * fontMultiplier }]}>{value}</Text>
      <Text style={[styles.statusCardDescription, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>{description}</Text>
    </View>
  );
}

function OptionGroup<T extends string>({
  currentValue,
  label,
  onSelect,
  options,
  twoColumns = false,
}: {
  currentValue: T;
  label: string;
  onSelect: (value: T) => void;
  options: OptionButton<T>[];
  twoColumns?: boolean;
}) {
  const { colors, fontMultiplier } = useAccessibility();

  return (
    <View style={styles.groupBlock}>
      <Text style={[styles.smallLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>{label}</Text>
      <View style={styles.actionsGrid}>
        {options.map((option) => (
          <AccessibleButton
            accessibilityHint={`Selecciona ${option.label}.`}
            description={option.description}
            fullWidth={false}
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={twoColumns ? styles.doubleButton : styles.actionButton}
            title={option.label}
            variant={currentValue === option.value ? 'accent' : 'secondary'}
          />
        ))}
      </View>
    </View>
  );
}

function getCaptionBackground(theme: CaptionThemeMode, colors: AppColorScheme) {
  if (theme === 'light') return colors.white;
  if (theme === 'highContrast') return colors.black;
  if (theme === 'compact') return 'rgba(15, 23, 42, 0.92)';
  return colors.primaryDeep;
}

function getCaptionTextColor(theme: CaptionThemeMode, colors: AppColorScheme) {
  if (theme === 'light') return colors.text;
  if (theme === 'highContrast') return '#FDE047';
  return colors.white;
}

function getPreviewPosition(position: CaptionPositionMode) {
  if (position === 'top') return 'flex-start';
  if (position === 'center') return 'center';
  return 'flex-end';
}

function getStatusColor(status: string, colors: AppColorScheme) {
  if (status === 'permissionError') return colors.danger;
  if (status === 'waitingPermission') return colors.warning;
  if (status === 'inactive') return colors.textMuted;
  if (status === 'paused') return colors.warning;
  return colors.success;
}

function getStatusSoftColor(status: string, colors: AppColorScheme) {
  if (status === 'permissionError') return colors.dangerSoft;
  if (status === 'waitingPermission') return colors.warningSoft;
  if (status === 'inactive') return colors.surfaceElevated;
  if (status === 'paused') return colors.warningSoft;
  return colors.successSoft;
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
    minWidth: 140,
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
  statusGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statusCard: {
    flex: 1,
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  statusCardLabel: {
    fontWeight: fontWeights.extraBold,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  statusCardValue: {
    fontWeight: fontWeights.black,
  },
  statusCardDescription: {
    fontWeight: fontWeights.medium,
  },
  sourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  sourceCard: {
    width: '47.5%',
    minHeight: 158,
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
  optionPanel: {
    gap: spacing.xl,
  },
  groupBlock: {
    gap: spacing.md,
  },
  smallLabel: {
    fontWeight: fontWeights.extraBold,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    minWidth: 104,
  },
  doubleButton: {
    width: '47.5%',
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
  devicePreview: {
    minHeight: 228,
    borderWidth: 1,
    borderRadius: radius.xxl,
    padding: spacing.md,
  },
  captionPreview: {
    minHeight: 82,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  captionPreviewCompact: {
    minHeight: 54,
    paddingVertical: spacing.md,
  },
  captionPreviewText: {
    fontWeight: fontWeights.black,
    textAlign: 'center',
  },
});
