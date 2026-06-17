import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AccessibilityToggle } from '@/components/AccessibilityToggle';
import { AccessibleButton } from '@/components/AccessibleButton';
import { AppHeader } from '@/components/AppHeader';
import { InfoCard } from '@/components/InfoCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import {
  AppThemeMode,
  ButtonSizeMode,
  CaptionPositionMode,
  CaptionSizeMode,
  CaptionThemeMode,
  FontScaleMode,
  FontStyleMode,
  ReadingSpeedMode,
  useAccessibility,
} from '@/context/AccessibilityContext';
import type { AppIconName } from '@/data/appModules';
import {
  isAccesiaAccessibilityServiceEnabled,
  openAndroidAccessibilitySettings,
  openAndroidCaptionSettings,
  openAndroidDisplaySettings,
  performAndroidGlobalAction,
} from '@/services/deviceControl';
import { openAndroidOverlaySettings, startAndroidFloatingAssistant, stopAndroidFloatingAssistant } from '@/services/systemOverlay';

type ChoiceOption<T extends string | number> = {
  label: string;
  value: T;
};

const themeOptions: ChoiceOption<AppThemeMode>[] = [
  { label: 'Claro', value: 'light' },
  { label: 'Oscuro', value: 'dark' },
  { label: 'Alto contraste', value: 'highContrast' },
];

const fontOptions: ChoiceOption<FontScaleMode>[] = [
  { label: 'Normal', value: 'standard' },
  { label: 'Grande', value: 'large' },
  { label: 'Extra', value: 'extraLarge' },
];

const fontStyleOptions: ChoiceOption<FontStyleMode>[] = [
  { label: 'Sistema', value: 'system' },
  { label: 'Redondeada', value: 'rounded' },
  { label: 'Mono', value: 'mono' },
];

const buttonSizeOptions: ChoiceOption<ButtonSizeMode>[] = [
  { label: 'Compacto', value: 'compact' },
  { label: 'Cómodo', value: 'comfortable' },
  { label: 'Grande', value: 'large' },
];

const speedOptions: ChoiceOption<ReadingSpeedMode>[] = [
  { label: '0.75×', value: 0.75 },
  { label: '1×', value: 1 },
  { label: '1.25×', value: 1.25 },
  { label: '1.5×', value: 1.5 },
];

const captionSizeOptions: ChoiceOption<CaptionSizeMode>[] = [
  { label: 'Mediano', value: 'medium' },
  { label: 'Grande', value: 'large' },
  { label: 'Extra', value: 'extraLarge' },
];

const captionThemeOptions: ChoiceOption<CaptionThemeMode>[] = [
  { label: 'Oscuro', value: 'dark' },
  { label: 'Claro', value: 'light' },
  { label: 'Contraste', value: 'highContrast' },
  { label: 'Compacto', value: 'compact' },
];

const captionPositionOptions: ChoiceOption<CaptionPositionMode>[] = [
  { label: 'Arriba', value: 'top' },
  { label: 'Centro', value: 'center' },
  { label: 'Abajo', value: 'bottom' },
];

type DeviceRowProps = {
  title: string;
  description: string;
  icon: AppIconName;
  onPress: () => void;
};

function DeviceRow({ title, description, icon, onPress }: DeviceRowProps) {
  const { colors, fontMultiplier, preferredFontFamily } = useAccessibility();

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
        <Text style={[styles.deviceTitle, { color: colors.text, fontFamily: preferredFontFamily, fontSize: fontSizes.md * fontMultiplier, lineHeight: lineHeights.md * fontMultiplier }]}> 
          {title}
        </Text>
        <Text style={[styles.deviceDescription, { color: colors.textMuted, fontFamily: preferredFontFamily, fontSize: fontSizes.xs * fontMultiplier, lineHeight: lineHeights.xs * fontMultiplier }]}> 
          {description}
        </Text>
      </View>
      <Ionicons color={colors.textSubtle} name="chevron-forward" size={18} />
    </Pressable>
  );
}

type ChoiceRowProps<T extends string | number> = {
  title: string;
  value: T;
  options: ChoiceOption<T>[];
  onChange: (value: T) => void;
};

function ChoiceRow<T extends string | number>({ title, value, options, onChange }: ChoiceRowProps<T>) {
  const { colors, fontMultiplier, preferredFontFamily } = useAccessibility();

  return (
    <View style={[styles.choiceRow, { borderColor: colors.border }]}> 
      <Text style={[styles.choiceTitle, { color: colors.text, fontFamily: preferredFontFamily, fontSize: fontSizes.sm * fontMultiplier, lineHeight: lineHeights.sm * fontMultiplier }]}> 
        {title}
      </Text>
      <View style={styles.choicePills}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              accessibilityLabel={`${title}: ${option.label}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={String(option.value)}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.choicePill,
                {
                  backgroundColor: selected ? colors.accent : pressed ? colors.surfaceElevated : colors.surface,
                  borderColor: selected ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.choicePillText,
                  {
                    color: selected ? colors.black : colors.text,
                    fontFamily: preferredFontFamily,
                    fontSize: fontSizes.xs * fontMultiplier,
                    lineHeight: lineHeights.xs * fontMultiplier,
                  },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const {
    activeSettingsCount,
    captionFontMultiplier,
    colors,
    fontMultiplier,
    lastChangeLabel,
    liveCaptionSource,
    preferredFontFamily,
    resetSettings,
    settings,
    setAutoStartBubble,
    setButtonSize,
    setCaptionPosition,
    setCaptionSize,
    setCaptionTheme,
    setFontScale,
    setFontStyle,
    setQuickAccessEnabled,
    setReadingSpeed,
    setReduceMotion,
    setScreenReaderSupportEnabled,
    setSimplifiedMode,
    setSubtitlesAlwaysVisible,
    setSubtitlesEnabled,
    setThemeMode,
    setVoiceCommandsEnabled,
    startLiveCaptions,
    stopLiveCaptions,
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
        <Text style={[styles.kicker, { color: colors.accent, fontFamily: preferredFontFamily, fontSize: fontSizes.xs * fontMultiplier }]}>Centro AccesIA</Text>
        <Text style={[styles.heroTitle, { color: colors.white, fontFamily: preferredFontFamily, fontSize: fontSizes.display * fontMultiplier, lineHeight: lineHeights.display * fontMultiplier }]}>Ajusta tu celular y tu experiencia.</Text>
        <Text style={[styles.heroDescription, { color: 'rgba(255,255,255,0.76)', fontFamily: preferredFontFamily, fontSize: fontSizes.sm * fontMultiplier, lineHeight: lineHeights.sm * fontMultiplier }]}>{lastChangeLabel}</Text>
      </View>

      <View style={styles.quickStatsRow}>
        <View style={[styles.statItem, { borderColor: colors.border }]}> 
          <Text style={[styles.statValue, { color: colors.text, fontFamily: preferredFontFamily, fontSize: fontSizes.xl * fontMultiplier }]}>{activeSettingsCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted, fontFamily: preferredFontFamily, fontSize: fontSizes.xs * fontMultiplier }]}>activos</Text>
        </View>
        <View style={[styles.statItem, { borderColor: colors.border }]}> 
          <Text style={[styles.statValue, { color: colors.text, fontFamily: preferredFontFamily, fontSize: fontSizes.xl * fontMultiplier }]}>{settings.buttonSize === 'large' ? 'XL' : settings.buttonSize === 'comfortable' ? 'M' : 'S'}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted, fontFamily: preferredFontFamily, fontSize: fontSizes.xs * fontMultiplier }]}>botones</Text>
        </View>
        <View style={[styles.statItem, { borderColor: colors.border }]}> 
          <Text style={[styles.statValue, { color: colors.text, fontFamily: preferredFontFamily, fontSize: fontSizes.xl * fontMultiplier }]}>{settings.captionPosition === 'bottom' ? 'Abajo' : settings.captionPosition === 'top' ? 'Arriba' : 'Centro'}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted, fontFamily: preferredFontFamily, fontSize: fontSizes.xs * fontMultiplier }]}>subtítulo</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: preferredFontFamily, fontSize: fontSizes.xl * fontMultiplier }]}>Android</Text>
        <Text style={[styles.sectionDescription, { color: colors.textMuted, fontFamily: preferredFontFamily, fontSize: fontSizes.sm * fontMultiplier }]}>Accesos directos para permisos y controles reales del dispositivo.</Text>
      </View>

      <View style={[styles.deviceList, { borderColor: colors.border }]}> 
        <DeviceRow
          description="Activa AccesIA para comandos globales como Inicio, Atrás, Recientes y Notificaciones."
          icon="accessibility-outline"
          onPress={() => void openAndroidAccessibilitySettings()}
          title="Servicio de accesibilidad"
        />
        <DeviceRow
          description="Abre Android para aumentar tamaño de texto, escala de pantalla y contraste del sistema."
          icon="text-outline"
          onPress={() => void openAndroidDisplaySettings()}
          title="Pantalla y tamaño del sistema"
        />
        <DeviceRow
          description="Abre los subtítulos del sistema para configurar estilo tipo reproductor de video."
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
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: preferredFontFamily, fontSize: fontSizes.xl * fontMultiplier }]}>Visual</Text>
      </View>
      <View style={[styles.choiceList, { borderColor: colors.border }]}> 
        <ChoiceRow onChange={setThemeMode} options={themeOptions} title="Tema" value={settings.themeMode} />
        <ChoiceRow onChange={setFontScale} options={fontOptions} title="Tamaño de letra" value={settings.fontScale} />
        <ChoiceRow onChange={setFontStyle} options={fontStyleOptions} title="Fuente" value={settings.fontStyle} />
        <ChoiceRow onChange={setButtonSize} options={buttonSizeOptions} title="Tamaño de botones" value={settings.buttonSize} />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: preferredFontFamily, fontSize: fontSizes.xl * fontMultiplier }]}>Subtítulos y lectura</Text>
      </View>
      <View style={[styles.choiceList, { borderColor: colors.border }]}> 
        <ChoiceRow onChange={setCaptionPosition} options={captionPositionOptions} title="Posición subtítulo" value={settings.captionPosition} />
        <ChoiceRow onChange={setCaptionSize} options={captionSizeOptions} title="Tamaño subtítulo" value={settings.captionSize} />
        <ChoiceRow onChange={setCaptionTheme} options={captionThemeOptions} title="Estilo subtítulo" value={settings.captionTheme} />
        <ChoiceRow onChange={setReadingSpeed} options={speedOptions} title="Velocidad lectura" value={settings.readingSpeed} />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: preferredFontFamily, fontSize: fontSizes.xl * fontMultiplier }]}>Burbuja flotante</Text>
      </View>
      <View style={styles.actionStrip}>
        <AccessibleButton fullWidth={false} icon="shield-checkmark-outline" onPress={() => void openAndroidOverlaySettings()} style={styles.stripButton} title="Permiso" variant="secondary" />
        <AccessibleButton fullWidth={false} icon="radio-button-on-outline" onPress={() => void startOverlayBubble()} style={styles.stripButton} title="Activar" variant="accent" />
        <AccessibleButton fullWidth={false} icon="stop-circle-outline" onPress={() => void stopOverlayBubble()} style={styles.stripButton} title="Detener" variant="ghost" />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: preferredFontFamily, fontSize: fontSizes.xl * fontMultiplier }]}>Preferencias rápidas</Text>
      </View>
      <View style={styles.toggleList}>
        <AccessibilityToggle accessibilityHint="Reduce animaciones y transiciones dentro de AccesIA." description="Disminuye movimiento visual en navegación y botones." icon="remove-circle-outline" label="Reducir movimiento" onValueChange={setReduceMotion} value={settings.reduceMotion} />
        <AccessibilityToggle accessibilityHint="Mantiene el modo de subtítulos listo aunque cambies de pantalla." description="Útil para usar subtítulos como apoyo permanente." icon="chatbubbles-outline" label="Subtítulos siempre visibles" onValueChange={setSubtitlesAlwaysVisible} value={settings.subtitlesAlwaysVisible} />
        <AccessibilityToggle accessibilityHint="Intenta abrir la burbuja automáticamente al iniciar AccesIA." description="No abre permisos solo; necesita permiso de superposición ya concedido." icon="radio-button-on-outline" label="Burbuja al abrir" onValueChange={setAutoStartBubble} value={settings.autoStartBubble} />
        <AccessibilityToggle accessibilityHint="Activa subtítulos flotantes dentro de AccesIA." description="Mantiene visible el estado de subtítulos." icon="chatbox-outline" label="Subtítulos" onValueChange={setSubtitlesEnabled} value={settings.subtitlesEnabled} />
        <AccessibilityToggle accessibilityHint="Activa comandos de voz para navegación." description="Permite usar comandos hablados o escritos." icon="mic-outline" label="Comandos de voz" onValueChange={setVoiceCommandsEnabled} value={settings.voiceCommandsEnabled} />
        <AccessibilityToggle accessibilityHint="Activa una interfaz con menos opciones visibles." description="Reduce carga visual." icon="sparkles-outline" label="Modo simple" onValueChange={setSimplifiedMode} value={settings.simplifiedMode} />
        <AccessibilityToggle accessibilityHint="Muestra accesos principales en el inicio." description="Permite entrar rápido a funciones importantes." icon="apps-outline" label="Accesos rápidos" onValueChange={setQuickAccessEnabled} value={settings.quickAccessEnabled} />
        <AccessibilityToggle accessibilityHint="Mantiene etiquetas descriptivas para lectores de pantalla." description="Mejora compatibilidad con tecnologías de apoyo." icon="ear-outline" label="Lectores de pantalla" onValueChange={setScreenReaderSupportEnabled} value={settings.screenReaderSupportEnabled} />
      </View>

      <InfoCard
        icon="information-circle-outline"
        text="Android protege los cambios globales del sistema. AccesIA abre los ajustes correctos y usa el servicio de accesibilidad para acciones como Inicio, Atrás o Notificaciones."
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
  choiceList: {
    borderTopWidth: 1,
  },
  choiceRow: {
    gap: spacing.sm,
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
  },
  choiceTitle: {
    fontWeight: fontWeights.extraBold,
  },
  choicePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  choicePill: {
    minHeight: 38,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  choicePillText: {
    fontWeight: fontWeights.extraBold,
  },
  toggleList: {
    gap: spacing.md,
  },
});
