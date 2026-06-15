import { StyleSheet, Text, View } from 'react-native';

import { AccessibilityPresetCard } from '@/components/AccessibilityPresetCard';
import { AccessibilityToggle } from '@/components/AccessibilityToggle';
import { AccessibleButton } from '@/components/AccessibleButton';
import { AppHeader } from '@/components/AppHeader';
import { IconBadge } from '@/components/IconBadge';
import { InfoCard } from '@/components/InfoCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { FontScaleMode, ReadingSpeedMode, useAccessibility } from '@/context/AccessibilityContext';
import { accessibilityPresets } from '@/data/accessibilityPresets';

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

export default function SettingsScreen() {
  const {
    activeSettingsCount,
    applySettings,
    colors,
    fontMultiplier,
    lastChangeLabel,
    resetSettings,
    settings,
    setFontScale,
    setHighContrast,
    setQuickAccessEnabled,
    setReadingSpeed,
    setScreenReaderSupportEnabled,
    setSimplifiedMode,
    setSubtitlesEnabled,
    setVoiceCommandsEnabled,
  } = useAccessibility();

  return (
    <ScreenContainer>
      <AppHeader title="Configuración" subtitle="Centro de accesibilidad" showSettings={false} />

      <View
        style={[
          styles.hero,
          {
            backgroundColor: colors.primaryDeep,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <IconBadge icon="options-outline" inverted size="lg" tone="accent" />
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
          Personaliza AccesIA a tu forma de interactuar.
        </Text>
        <Text
          style={[
            styles.heroDescription,
            {
              color: 'rgba(255,255,255,0.78)',
              fontSize: fontSizes.md * fontMultiplier,
              lineHeight: lineHeights.md * fontMultiplier,
            },
          ]}
        >
          Los cambios se aplican en toda la aplicación y se guardan localmente en la demostración web.
        </Text>
      </View>

      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.metricValue, { color: colors.text, fontSize: fontSizes.xl * fontMultiplier }]}>{activeSettingsCount}</Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>ajustes activos</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.metricValue, { color: colors.text, fontSize: fontSizes.xl * fontMultiplier }]}>{settings.readingSpeed}×</Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>lectura</Text>
        </View>
      </View>

      <InfoCard
        icon="sync-outline"
        text={lastChangeLabel}
        title="Último cambio aplicado"
        tone="primary"
      />

      <View style={styles.section}>
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
          Perfiles rápidos
        </Text>
        <Text
          style={[
            styles.sectionDescription,
            {
              color: colors.textMuted,
              fontSize: fontSizes.md * fontMultiplier,
              lineHeight: lineHeights.md * fontMultiplier,
            },
          ]}
        >
          Aplica configuraciones recomendadas según el perfil del usuario.
        </Text>
        <View style={styles.presetsGrid}>
          {accessibilityPresets.map((preset) => (
            <AccessibilityPresetCard
              key={preset.id}
              onApply={() => applySettings(preset.settings, `Perfil aplicado: ${preset.title}.`)}
              preset={preset}
            />
          ))}
        </View>
      </View>

      <View
        style={[
          styles.fontPanel,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.panelHeader}>
          <IconBadge icon="text-outline" size="sm" tone="secondary" />
          <View>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  fontSize: fontSizes.xl * fontMultiplier,
                  lineHeight: lineHeights.xl * fontMultiplier,
                },
              ]}
            >
              Tamaño de letra
            </Text>
            <Text
              style={[
                styles.sectionDescription,
                {
                  color: colors.textMuted,
                  fontSize: fontSizes.sm * fontMultiplier,
                  lineHeight: lineHeights.sm * fontMultiplier,
                },
              ]}
            >
              Elige un nivel cómodo para leer.
            </Text>
          </View>
        </View>

        <View style={styles.fontRow}>
          {fontOptions.map((option) => (
            <AccessibleButton
              accessibilityHint={option.hint}
              fullWidth={false}
              key={option.value}
              onPress={() => setFontScale(option.value)}
              style={styles.fontButton}
              title={option.label}
              variant={settings.fontScale === option.value ? 'accent' : 'secondary'}
            />
          ))}
        </View>
      </View>

      <View
        style={[
          styles.fontPanel,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.panelHeader}>
          <IconBadge icon="speedometer-outline" size="sm" tone="accent" />
          <View>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  fontSize: fontSizes.xl * fontMultiplier,
                  lineHeight: lineHeights.xl * fontMultiplier,
                },
              ]}
            >
              Velocidad de lectura
            </Text>
            <Text
              style={[
                styles.sectionDescription,
                {
                  color: colors.textMuted,
                  fontSize: fontSizes.sm * fontMultiplier,
                  lineHeight: lineHeights.sm * fontMultiplier,
                },
              ]}
            >
              Ajusta el ritmo de la síntesis de voz.
            </Text>
          </View>
        </View>

        <View style={styles.fontRow}>
          {speedOptions.map((option) => (
            <AccessibleButton
              accessibilityHint={`Cambia la velocidad de lectura a ${option.label}.`}
              fullWidth={false}
              key={option.value}
              onPress={() => setReadingSpeed(option.value)}
              style={styles.fontButton}
              title={option.label}
              variant={settings.readingSpeed === option.value ? 'accent' : 'secondary'}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
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
          Opciones inclusivas
        </Text>
        <AccessibilityToggle
          accessibilityHint="Activa colores de alto contraste para mejorar la lectura."
          description="Útil para personas con baja visión o sensibilidad al contraste."
          icon="contrast-outline"
          label="Alto contraste"
          onValueChange={setHighContrast}
          value={settings.highContrast}
        />
        <AccessibilityToggle
          accessibilityHint="Activa subtítulos automáticos simulados para contenido multimedia."
          description="Muestra texto visible cuando el contenido tiene audio."
          icon="chatbubbles-outline"
          label="Subtítulos automáticos"
          onValueChange={setSubtitlesEnabled}
          value={settings.subtitlesEnabled}
        />
        <AccessibilityToggle
          accessibilityHint="Activa comandos de voz simulados para navegación."
          description="Permite validar la interacción por voz antes de integrar reconocimiento real."
          icon="mic-outline"
          label="Comandos de voz"
          onValueChange={setVoiceCommandsEnabled}
          value={settings.voiceCommandsEnabled}
        />
        <AccessibilityToggle
          accessibilityHint="Activa una interfaz con menos opciones visibles."
          description="Reduce la carga cognitiva y prioriza cuatro acciones esenciales."
          icon="sparkles-outline"
          label="Modo simplificado"
          onValueChange={setSimplifiedMode}
          value={settings.simplifiedMode}
        />
        <AccessibilityToggle
          accessibilityHint="Muestra accesos principales para reducir pasos."
          description="Facilita tareas frecuentes desde la pantalla de inicio."
          icon="apps-outline"
          label="Accesos rápidos"
          onValueChange={setQuickAccessEnabled}
          value={settings.quickAccessEnabled}
        />
        <AccessibilityToggle
          accessibilityHint="Mantiene etiquetas descriptivas para tecnologías de apoyo."
          description="Refuerza compatibilidad conceptual con lectores de pantalla."
          icon="ear-outline"
          label="Lectores de pantalla"
          onValueChange={setScreenReaderSupportEnabled}
          value={settings.screenReaderSupportEnabled}
        />
      </View>

      <AccessibleButton
        accessibilityHint="Vuelve a la configuración inicial de AccesIA."
        icon="refresh-outline"
        onPress={resetSettings}
        title="Restablecer preferencias"
        variant="ghost"
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
  heroTitle: {
    fontWeight: fontWeights.black,
    letterSpacing: -1,
  },
  heroDescription: {
    fontWeight: fontWeights.medium,
  },
  metricsRow: {
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
  section: {
    gap: spacing.md,
    marginTop: spacing.section,
  },
  sectionTitle: {
    fontWeight: fontWeights.black,
    letterSpacing: -0.6,
  },
  sectionDescription: {
    fontWeight: fontWeights.medium,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  fontPanel: {
    gap: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.xxl,
    marginTop: spacing.section,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  fontRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  fontButton: {
    flex: 1,
    minWidth: 100,
  },
});
