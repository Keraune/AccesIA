import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AccessibilityToggle } from '@/components/AccessibilityToggle';
import { AccessibleButton } from '@/components/AccessibleButton';
import { AppHeader } from '@/components/AppHeader';
import { InfoCard } from '@/components/InfoCard';
import { ModuleCard } from '@/components/ModuleCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';
import { appModules } from '@/data/appModules';

export default function HomeScreen() {
  const router = useRouter();
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
          Propuesta funcional base
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
          AccesIA reúne lectura, voz, subtítulos, alto contraste, texto escalable
          y modo simplificado en una experiencia móvil adaptable.
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
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
            Menú principal
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
            Selecciona un módulo para probar el flujo de la aplicación.
          </Text>
        </View>

        <View style={styles.moduleList}>
          {appModules.map((module) => (
            <ModuleCard key={module.route} module={module} />
          ))}
        </View>
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
          Accesibilidad rápida
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
          onValueChange={(enabled) => {
            setSimplifiedMode(enabled);
            if (enabled) {
              router.push('/modo-simplificado' as never);
            }
          }}
          value={settings.simplifiedMode}
        />
      </View>

      <InfoCard
        text="Esta fase agrega navegación entre pantallas, menú inferior, menú principal y funciones demostrativas para validar la experiencia antes de integrar servicios avanzados."
        title="Fase 2 implementada"
        tone="primary"
      />
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
    textTransform: 'uppercase',
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
  sectionHeader: {
    gap: spacing.xs,
  },
  sectionTitle: {
    fontWeight: fontWeights.extraBold,
  },
  sectionDescription: {
    fontWeight: fontWeights.regular,
  },
  moduleList: {
    gap: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
