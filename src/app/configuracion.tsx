import { StyleSheet, Text, View } from 'react-native';

import { AccessibilityToggle } from '@/components/AccessibilityToggle';
import { AccessibleButton } from '@/components/AccessibleButton';
import { AppHeader } from '@/components/AppHeader';
import { InfoCard } from '@/components/InfoCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { FontScaleMode, useAccessibility } from '@/context/AccessibilityContext';

const fontOptions: { label: string; value: FontScaleMode; hint: string }[] = [
  {
    label: 'Normal',
    value: 'standard',
    hint: 'Usa el tamaño de letra estándar.',
  },
  {
    label: 'Grande',
    value: 'large',
    hint: 'Aumenta la letra para mejorar la lectura.',
  },
  {
    label: 'Muy grande',
    value: 'extraLarge',
    hint: 'Usa el tamaño máximo de letra disponible.',
  },
];

export default function SettingsScreen() {
  const {
    colors,
    fontMultiplier,
    settings,
    setFontScale,
    setHighContrast,
    setQuickAccessEnabled,
    setScreenReaderSupportEnabled,
    setSimplifiedMode,
    setSubtitlesEnabled,
    setVoiceCommandsEnabled,
  } = useAccessibility();

  return (
    <ScreenContainer>
      <AppHeader title="Configuración" subtitle="Centro de accesibilidad" />

      <InfoCard
        text="Los cambios se aplican en toda la aplicación porque se guardan en el estado global de accesibilidad."
        title="Preferencias globales"
        tone="primary"
      />

      <View style={styles.section}>
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
        <View style={styles.fontRow}>
          {fontOptions.map((option) => (
            <AccessibleButton
              accessibilityHint={option.hint}
              fullWidth={false}
              key={option.value}
              onPress={() => setFontScale(option.value)}
              title={option.label}
              variant={settings.fontScale === option.value ? 'accent' : 'secondary'}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <AccessibilityToggle
          accessibilityHint="Activa colores de alto contraste para mejorar la lectura."
          description="Útil para personas con baja visión o sensibilidad al contraste."
          label="Alto contraste"
          onValueChange={setHighContrast}
          value={settings.highContrast}
        />
        <AccessibilityToggle
          accessibilityHint="Activa subtítulos automáticos simulados para contenido multimedia."
          description="Muestra texto visible cuando el contenido tiene audio."
          label="Subtítulos automáticos"
          onValueChange={setSubtitlesEnabled}
          value={settings.subtitlesEnabled}
        />
        <AccessibilityToggle
          accessibilityHint="Activa comandos de voz simulados para navegación."
          description="Permite validar la interacción por voz antes de integrar reconocimiento real."
          label="Comandos de voz"
          onValueChange={setVoiceCommandsEnabled}
          value={settings.voiceCommandsEnabled}
        />
        <AccessibilityToggle
          accessibilityHint="Activa una interfaz con menos opciones visibles."
          description="Reduce la carga cognitiva y prioriza cuatro acciones esenciales."
          label="Modo simplificado"
          onValueChange={setSimplifiedMode}
          value={settings.simplifiedMode}
        />
        <AccessibilityToggle
          accessibilityHint="Muestra accesos principales para reducir pasos."
          description="Facilita tareas frecuentes desde la pantalla de inicio."
          label="Accesos rápidos"
          onValueChange={setQuickAccessEnabled}
          value={settings.quickAccessEnabled}
        />
        <AccessibilityToggle
          accessibilityHint="Mantiene etiquetas descriptivas para tecnologías de apoyo."
          description="Refuerza compatibilidad conceptual con lectores de pantalla."
          label="Lectores de pantalla"
          onValueChange={setScreenReaderSupportEnabled}
          value={settings.screenReaderSupportEnabled}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
    marginTop: spacing.section,
  },
  sectionTitle: {
    fontWeight: fontWeights.extraBold,
  },
  fontRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
