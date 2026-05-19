import { StyleSheet, Text, View } from "react-native";

import { AccessibilityToggle } from "@/components/AccessibilityToggle";
import { AccessibleButton } from "@/components/AccessibleButton";
import { AppHeader } from "@/components/AppHeader";
import { ScreenContainer } from "@/components/ScreenContainer";
import { radius, spacing } from "@/constants/layout";
import { fontSizes, fontWeights, lineHeights } from "@/constants/typography";
import { useAccessibility } from "@/context/AccessibilityContext";

export default function Index() {
  const {
    colors,
    fontMultiplier,
    settings,
    decreaseFontScale,
    increaseFontScale,
    setHighContrast,
    setSimplifiedMode,
  } = useAccessibility();

  return (
    <ScreenContainer>
      <AppHeader />

      <View
        accessible
        accessibilityLabel="Resumen de AccesIA. Aplicación de asistencia digital inclusiva para personas con discapacidad y adultos mayores."
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <Text
          style={[
            styles.kicker,
            {
              color: colors.accent,
              fontSize: fontSizes.sm * fontMultiplier,
              lineHeight: lineHeights.sm * fontMultiplier,
            },
          ]}
        >
          Fase 1 · Base visual
        </Text>
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
          Asistencia digital clara, accesible y fácil de usar.
        </Text>
        <Text
          style={[
            styles.description,
            {
              color: colors.textMuted,
              fontSize: fontSizes.md * fontMultiplier,
              lineHeight: lineHeights.md * fontMultiplier,
            },
          ]}
        >
          Esta primera base define el sistema visual, componentes reutilizables
          y preferencias globales de accesibilidad para construir las siguientes
          pantallas.
        </Text>
      </View>

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
          Controles rápidos
        </Text>

        <View style={styles.buttonRow}>
          <AccessibleButton
            accessibilityHint="Aumenta el tamaño de letra de la aplicación."
            fullWidth={false}
            onPress={increaseFontScale}
            title="Aumentar letra"
            variant="secondary"
          />
          <AccessibleButton
            accessibilityHint="Reduce el tamaño de letra de la aplicación."
            fullWidth={false}
            onPress={decreaseFontScale}
            title="Reducir letra"
            variant="secondary"
          />
        </View>
      </View>

      <View style={styles.section}>
        <AccessibilityToggle
          accessibilityHint="Cambia la interfaz a colores de alto contraste para mejorar la lectura."
          description="Mejora la legibilidad para personas con baja visión."
          label="Alto contraste"
          onValueChange={setHighContrast}
          value={settings.highContrast}
        />
        <AccessibilityToggle
          accessibilityHint="Activa una experiencia con menos opciones visibles y textos más directos."
          description="Reduce la carga visual y cognitiva."
          label="Modo simplificado"
          onValueChange={setSimplifiedMode}
          value={settings.simplifiedMode}
        />
      </View>

      <View
        style={[
          styles.infoCard,
          {
            backgroundColor: colors.primarySoft,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.infoTitle,
            {
              color: colors.text,
              fontSize: fontSizes.lg * fontMultiplier,
              lineHeight: lineHeights.lg * fontMultiplier,
            },
          ]}
        >
          Siguiente fase
        </Text>
        <Text
          style={[
            styles.infoText,
            {
              color: colors.textMuted,
              fontSize: fontSizes.md * fontMultiplier,
              lineHeight: lineHeights.md * fontMultiplier,
            },
          ]}
        >
          En la Fase 2 se configurará la navegación principal con las pantallas
          de Inicio, Lectura, Asistente de voz, Subtítulos, Configuración y Modo
          simplificado.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  kicker: {
    fontWeight: fontWeights.extraBold,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },
  title: {
    fontWeight: fontWeights.extraBold,
    marginBottom: spacing.md,
  },
  description: {
    fontWeight: fontWeights.regular,
  },
  section: {
    gap: spacing.md,
    marginTop: spacing.section,
  },
  sectionTitle: {
    fontWeight: fontWeights.extraBold,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    marginTop: spacing.section,
    padding: spacing.xl,
  },
  infoTitle: {
    fontWeight: fontWeights.extraBold,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontWeight: fontWeights.regular,
  },
});
