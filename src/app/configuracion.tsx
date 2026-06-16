import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AccessibilityToggle } from '@/components/AccessibilityToggle';
import { AccessibleButton } from '@/components/AccessibleButton';
import { AppHeader } from '@/components/AppHeader';
import { InfoCard } from '@/components/InfoCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { CaptionSizeMode, CaptionThemeMode, FontScaleMode, ReadingSpeedMode, useAccessibility } from '@/context/AccessibilityContext';
import type { AppIconName } from '@/data/appModules';
import {
  isAccesiaAccessibilityServiceEnabled,
  openAndroidAccessibilitySettings,
  openAndroidCaptionSettings,
  openAndroidDisplaySettings,
  performAndroidGlobalAction,
} from '@/services/deviceControl';
import { openAndroidOverlaySettings, startAndroidFloatingAssistant, stopAndroidFloatingAssistant } from '@/services/systemOverlay';

const fontOptions: { label: string; value: FontScaleMode; hint: string }[] = [
  { label: 'Normal', value: 'standard', hint: 'Usa el tamaño de letra estándar.' },
  { label: 'Grande', value: 'large', hint: 'Aumenta la letra para mejorar la lectura.' },
  { label: 'Muy grande', value: 'extraLarge', hint: 'Usa el tamaño máximo de letra disponible.' },
];

const speedOptions: { label: string; value: ReadingSpeedMode }[] = [
  { label: '0.75×', value: 0.75 },
  { label: '1×', value: 1 },
  { label: '1.25×', value: 1.25 },
  { label: '1.5×', value: 1.5 },
];

const captionSizeOptions: { label: string; value: CaptionSizeMode }[] = [
  { label: 'Mediano', value: 'medium' },
  { label: 'Grande', value: 'large' },
  { label: 'Extra', value: 'extraLarge' },
];

const captionThemeOptions: { label: string; value: CaptionThemeMode }[] = [
  { label: 'Oscuro', value: 'dark' },
  { label: 'Claro', value: 'light' },
  { label: 'Alto contraste', value: 'highContrast' },
  { label: 'Compacto', value: 'compact' },
];

type DeviceRowProps = {
  title: string;
  description: string;
  icon: AppIconName;
  onPress: () => void;
};

function DeviceRow({ title, description, icon, onPress }: DeviceRowProps) {
  const { colors, fontMultiplier } = useAccessibility();

  return (
    <Pressable
      accessibilityHint={description}
      accessibilityLabel={title}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.deviceRow,
        {
          backgroundColor: pressed ? colors.surfaceElevated : colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={[styles.deviceIcon, { backgroundColor: colors.accentSoft }]}> 
        <Ionicons color={colors.text} name={icon} size={20} />
      </View>
      <View style={styles.deviceTextBlock}>
        <Text style={[styles.deviceTitle, { color: colors.text, fontSize: fontSizes.md * fontMultiplier, lineHeight: lineHeights.md * fontMultiplier }]}>
          {title}
        </Text>
        <Text style={[styles.deviceDescription, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier, lineHeight: lineHeights.xs * fontMultiplier }]}>
          {description}
        </Text>
      </View>
      <Ionicons color={colors.textSubtle} name="chevron-forward" size={18} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const {
    activeSettingsCount,
    colors,
    fontMultiplier,
    lastChangeLabel,
    liveCaptionSource,
    resetSettings,
    settings,
    setFontScale,
    setHighContrast,
    setQuickAccessEnabled,
    setReadingSpeed,
    setCaptionSize,
    setCaptionTheme,
    setScreenReaderSupportEnabled,
    setSimplifiedMode,
    setSubtitlesEnabled,
    setVoiceCommandsEnabled,
    startLiveCaptions,
    stopLiveCaptions,
    captionFontMultiplier,
  } = useAccessibility();

  async function startOverlayBubble() {
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
        return;
      }

      if (result.reason === 'permission-required') {
        Alert.alert('Permiso requerido', 'Activa “Mostrar sobre otras apps” y vuelve a AccesIA para iniciar la burbuja.');
        return;
      }

      Alert.alert('APK nativa requerida', 'La burbuja del sistema funciona en Android con una compilación nativa.');
    } catch {
      Alert.alert('No disponible', 'No se pudo abrir la burbuja del sistema. Revisa el permiso de superposición.');
    }
  }

  async function stopOverlayBubble() {
    stopLiveCaptions();
    await stopAndroidFloatingAssistant();
  }

  async function runGlobalAction(action: 'home' | 'back' | 'recents' | 'notifications' | 'quickSettings') {
    const enabled = await isAccesiaAccessibilityServiceEnabled();
    if (!enabled) {
      Alert.alert('Activa AccesIA', 'Para controlar el dispositivo con acciones globales, activa AccesIA en los ajustes de accesibilidad.');
      await openAndroidAccessibilitySettings();
      return;
    }
    await performAndroidGlobalAction(action);
  }

  return (
    <ScreenContainer>
      <AppHeader title="Ajustes" subtitle="Accesibilidad del dispositivo y de AccesIA" showSettings={false} />

      <View style={[styles.walletHeader, { backgroundColor: colors.primaryDeep }]}> 
        <Text style={[styles.kicker, { color: colors.accent, fontSize: fontSizes.xs * fontMultiplier }]}>Centro AccesIA</Text>
        <Text style={[styles.heroTitle, { color: colors.white, fontSize: fontSizes.display * fontMultiplier, lineHeight: lineHeights.display * fontMultiplier }]}>Control visual, voz y subtítulos.</Text>
        <Text style={[styles.heroDescription, { color: 'rgba(255,255,255,0.76)', fontSize: fontSizes.sm * fontMultiplier, lineHeight: lineHeights.sm * fontMultiplier }]}>{lastChangeLabel}</Text>
      </View>

      <View style={styles.quickStatsRow}>
        <View style={[styles.statItem, { borderColor: colors.border }]}> 
          <Text style={[styles.statValue, { color: colors.text, fontSize: fontSizes.xl * fontMultiplier }]}>{activeSettingsCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>activos</Text>
        </View>
        <View style={[styles.statItem, { borderColor: colors.border }]}> 
          <Text style={[styles.statValue, { color: colors.text, fontSize: fontSizes.xl * fontMultiplier }]}>{settings.readingSpeed}×</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>lectura</Text>
        </View>
        <View style={[styles.statItem, { borderColor: colors.border }]}> 
          <Text style={[styles.statValue, { color: colors.text, fontSize: fontSizes.xl * fontMultiplier }]}>{settings.captionSize === 'extraLarge' ? 'XL' : settings.captionSize === 'large' ? 'L' : 'M'}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>subtítulo</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.xl * fontMultiplier }]}>Android</Text>
        <Text style={[styles.sectionDescription, { color: colors.textMuted, fontSize: fontSizes.sm * fontMultiplier }]}>Accesos directos para permisos y controles reales del dispositivo.</Text>
      </View>

      <View style={[styles.deviceList, { borderColor: colors.border }]}> 
        <DeviceRow
          description="Activa AccesIA para permitir comandos como Inicio, Atrás, Recientes y Notificaciones."
          icon="accessibility-outline"
          onPress={() => void openAndroidAccessibilitySettings()}
          title="Servicio de accesibilidad"
        />
        <DeviceRow
          description="Abre Android para aumentar tamaño de texto, visualización y opciones de pantalla."
          icon="text-outline"
          onPress={() => void openAndroidDisplaySettings()}
          title="Tamaño y pantalla del sistema"
        />
        <DeviceRow
          description="Abre los subtítulos del sistema Android, similar al estilo de subtítulos de video."
          icon="chatbox-ellipses-outline"
          onPress={() => void openAndroidCaptionSettings()}
          title="Subtítulos de Android"
        />
      </View>

      <View style={styles.actionStrip}>
        <AccessibleButton fullWidth={false} icon="home-outline" onPress={() => void runGlobalAction('home')} style={styles.stripButton} title="Inicio" variant="secondary" />
        <AccessibleButton fullWidth={false} icon="arrow-back-outline" onPress={() => void runGlobalAction('back')} style={styles.stripButton} title="Atrás" variant="secondary" />
        <AccessibleButton fullWidth={false} icon="albums-outline" onPress={() => void runGlobalAction('recents')} style={styles.stripButton} title="Recientes" variant="secondary" />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.xl * fontMultiplier }]}>Burbuja y subtítulos</Text>
      </View>
      <View style={styles.actionStrip}>
        <AccessibleButton fullWidth={false} icon="shield-checkmark-outline" onPress={() => void openAndroidOverlaySettings()} style={styles.stripButton} title="Permiso" variant="secondary" />
        <AccessibleButton fullWidth={false} icon="radio-button-on-outline" onPress={() => void startOverlayBubble()} style={styles.stripButton} title="Activar" variant="accent" />
        <AccessibleButton fullWidth={false} icon="stop-circle-outline" onPress={() => void stopOverlayBubble()} style={styles.stripButton} title="Detener" variant="ghost" />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.xl * fontMultiplier }]}>Apariencia</Text>
      </View>
      <View style={styles.optionGroup}>
        <Text style={[styles.optionLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>Letra de AccesIA</Text>
        <View style={styles.actionStrip}>
          {fontOptions.map((option) => (
            <AccessibleButton key={option.value} accessibilityHint={option.hint} fullWidth={false} onPress={() => setFontScale(option.value)} style={styles.stripButton} title={option.label} variant={settings.fontScale === option.value ? 'accent' : 'secondary'} />
          ))}
        </View>
        <Text style={[styles.optionLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>Velocidad de lectura</Text>
        <View style={styles.actionStrip}>
          {speedOptions.map((option) => (
            <AccessibleButton key={option.value} fullWidth={false} onPress={() => setReadingSpeed(option.value)} style={styles.stripButton} title={option.label} variant={settings.readingSpeed === option.value ? 'accent' : 'secondary'} />
          ))}
        </View>
        <Text style={[styles.optionLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>Subtítulos</Text>
        <View style={styles.actionStrip}>
          {captionSizeOptions.map((option) => (
            <AccessibleButton key={option.value} fullWidth={false} onPress={() => setCaptionSize(option.value)} style={styles.stripButton} title={option.label} variant={settings.captionSize === option.value ? 'accent' : 'secondary'} />
          ))}
        </View>
        <View style={styles.actionStrip}>
          {captionThemeOptions.map((option) => (
            <AccessibleButton key={option.value} fullWidth={false} onPress={() => setCaptionTheme(option.value)} style={styles.stripButton} title={option.label} variant={settings.captionTheme === option.value ? 'accent' : 'secondary'} />
          ))}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.xl * fontMultiplier }]}>Preferencias rápidas</Text>
      </View>
      <View style={styles.toggleList}>
        <AccessibilityToggle accessibilityHint="Activa colores de alto contraste para mejorar la lectura." description="Mejora legibilidad dentro de AccesIA." icon="contrast-outline" label="Alto contraste" onValueChange={setHighContrast} value={settings.highContrast} />
        <AccessibilityToggle accessibilityHint="Activa subtítulos automáticos dentro de AccesIA." description="Mantiene visible el estado de subtítulos." icon="chatbubbles-outline" label="Subtítulos" onValueChange={setSubtitlesEnabled} value={settings.subtitlesEnabled} />
        <AccessibilityToggle accessibilityHint="Activa comandos de voz para navegación." description="Permite usar comandos hablados o escritos." icon="mic-outline" label="Comandos de voz" onValueChange={setVoiceCommandsEnabled} value={settings.voiceCommandsEnabled} />
        <AccessibilityToggle accessibilityHint="Activa una interfaz con menos opciones visibles." description="Reduce carga visual." icon="sparkles-outline" label="Modo simple" onValueChange={setSimplifiedMode} value={settings.simplifiedMode} />
        <AccessibilityToggle accessibilityHint="Muestra accesos principales en el inicio." description="Permite entrar rápido a funciones importantes." icon="apps-outline" label="Accesos rápidos" onValueChange={setQuickAccessEnabled} value={settings.quickAccessEnabled} />
        <AccessibilityToggle accessibilityHint="Mantiene etiquetas descriptivas para lectores de pantalla." description="Mejora compatibilidad con tecnologías de apoyo." icon="ear-outline" label="Lectores de pantalla" onValueChange={setScreenReaderSupportEnabled} value={settings.screenReaderSupportEnabled} />
      </View>

      <InfoCard
        icon="information-circle-outline"
        text="Por seguridad de Android, AccesIA abre los ajustes del sistema para cambios globales como tamaño de letra o contraste. Los comandos globales requieren activar el servicio de accesibilidad."
        title="Control del dispositivo"
        tone="primary"
      />

      <AccessibleButton accessibilityHint="Vuelve a la configuración inicial de AccesIA." icon="refresh-outline" onPress={resetSettings} title="Restablecer preferencias" variant="ghost" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  walletHeader: {
    gap: spacing.md,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
  },
  kicker: {
    fontWeight: fontWeights.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontWeight: fontWeights.black,
    letterSpacing: -0.9,
  },
  heroDescription: {
    fontWeight: fontWeights.medium,
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  statItem: {
    flex: 1,
    borderBottomWidth: 1,
    paddingBottom: spacing.md,
  },
  statValue: {
    fontWeight: fontWeights.black,
  },
  statLabel: {
    fontWeight: fontWeights.extraBold,
    textTransform: 'uppercase',
  },
  sectionHeader: {
    gap: spacing.xs,
    marginTop: spacing.section,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontWeight: fontWeights.black,
    letterSpacing: -0.4,
  },
  sectionDescription: {
    fontWeight: fontWeights.medium,
  },
  deviceList: {
    borderTopWidth: 1,
  },
  deviceRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
  },
  deviceIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  deviceTextBlock: {
    flex: 1,
  },
  deviceTitle: {
    fontWeight: fontWeights.extraBold,
  },
  deviceDescription: {
    fontWeight: fontWeights.medium,
  },
  actionStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stripButton: {
    flex: 1,
    minWidth: 96,
  },
  optionGroup: {
    gap: spacing.md,
  },
  optionLabel: {
    fontWeight: fontWeights.extraBold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  toggleList: {
    gap: spacing.md,
  },
});
