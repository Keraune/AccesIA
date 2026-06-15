import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AccessibilityToggle } from '@/components/AccessibilityToggle';
import { AccessibleButton } from '@/components/AccessibleButton';
import { AppHeader } from '@/components/AppHeader';
import { IconBadge } from '@/components/IconBadge';
import { InfoCard } from '@/components/InfoCard';
import { ModuleCard } from '@/components/ModuleCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';
import { appModules } from '@/data/appModules';

const insightCards = [
  {
    label: 'Perfiles',
    value: '5',
    description: 'usuarios objetivo',
    icon: 'people-outline' as const,
  },
  {
    label: 'Módulos',
    value: '4',
    description: 'funcionales',
    icon: 'grid-outline' as const,
  },
  {
    label: 'Prueba',
    value: '3-5',
    description: 'usuarios',
    icon: 'analytics-outline' as const,
  },
];

const improvements = [
  'Botones principales más grandes.',
  'Menús con menos pasos.',
  'Contraste mejorado.',
  'Ayuda contextual visible.',
];

export default function HomeScreen() {
  const router = useRouter();
  const {
    activeSettingsCount,
    colors,
    fontMultiplier,
    lastChangeLabel,
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
        accessibilityLabel="Panel principal de AccesIA. Aplicación de asistencia digital inclusiva para personas con discapacidad y adultos mayores."
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.primaryDeep,
            borderColor: settings.highContrast ? colors.border : 'rgba(255,255,255,0.14)',
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.heroTopRow}>
          <View style={[styles.livePill, { backgroundColor: 'rgba(255,255,255,0.12)' }]}> 
            <View style={[styles.liveDot, { backgroundColor: colors.secondary }]} />
            <Text
              style={[
                styles.livePillText,
                {
                  color: colors.white,
                  fontSize: fontSizes.xs * fontMultiplier,
                  lineHeight: lineHeights.xs * fontMultiplier,
                },
              ]}
            >
              Propuesta funcional activa
            </Text>
          </View>
          <IconBadge icon="accessibility-outline" inverted size="sm" tone="accent" />
        </View>

        <Text
          style={[
            styles.heroTitle,
            {
              color: colors.white,
              fontSize: fontSizes.hero * fontMultiplier,
              lineHeight: lineHeights.hero * fontMultiplier,
            },
          ]}
        >
          Accesibilidad moderna para cada usuario.
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
          Lectura por voz, comandos hablados, subtítulos, alto contraste, texto escalable y modo simple en una experiencia móvil clara.
        </Text>

        <View style={styles.heroActions}>
          <AccessibleButton
            accessibilityHint="Abre el módulo de lectura accesible."
            fullWidth={false}
            icon="book-outline"
            onPress={() => router.push('/lectura' as never)}
            style={styles.heroButton}
            title="Escuchar"
            variant="accent"
          />
          <AccessibleButton
            accessibilityHint="Abre el modo simplificado."
            fullWidth={false}
            icon="sparkles-outline"
            onPress={() => router.push('/modo-simplificado' as never)}
            style={styles.heroButton}
            title="Modo simple"
            variant="dark"
          />
        </View>
      </View>

      <View style={styles.insightGrid}>
        {insightCards.map((item) => (
          <View
            accessible
            accessibilityLabel={`${item.label}: ${item.value}. ${item.description}`}
            key={item.label}
            style={[
              styles.insightCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Ionicons color={colors.secondary} name={item.icon} size={20} />
            <Text
              style={[
                styles.insightValue,
                {
                  color: colors.text,
                  fontSize: fontSizes.xl * fontMultiplier,
                  lineHeight: lineHeights.xl * fontMultiplier,
                },
              ]}
            >
              {item.value}
            </Text>
            <Text
              style={[
                styles.insightLabel,
                {
                  color: colors.textMuted,
                  fontSize: fontSizes.xs * fontMultiplier,
                  lineHeight: lineHeights.xs * fontMultiplier,
                },
              ]}
            >
              {item.description}
            </Text>
          </View>
        ))}
      </View>

      <InfoCard
        icon="checkmark-circle-outline"
        text="Se aplicaron mejoras de botones, contraste, navegación simplificada y ayuda contextual para responder a la evaluación heurística."
        title="Mejoras aplicadas"
        tone="success"
      />

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderText}>
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
              Módulos principales
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
              Menú de asistencia
            </Text>
          </View>
          <View style={[styles.countPill, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <Text
              style={[
                styles.countPillText,
                {
                  color: colors.text,
                  fontSize: fontSizes.sm * fontMultiplier,
                  lineHeight: lineHeights.sm * fontMultiplier,
                },
              ]}
            >
              {settings.quickAccessEnabled ? `${appModules.length} opciones` : 'Oculto'}
            </Text>
          </View>
        </View>

        {settings.quickAccessEnabled ? (
          <View style={styles.moduleList}>
            {appModules.map((module) => (
              <ModuleCard key={module.route} module={module} />
            ))}
          </View>
        ) : (
          <InfoCard
            icon="eye-off-outline"
            text="Los accesos rápidos están desactivados. Puedes volver a activarlos desde Configuración."
            title="Menú simplificado"
            tone="warning"
          />
        )}
      </View>

      <View
        style={[
          styles.quickPanel,
          {
            backgroundColor: colors.surfaceGlass,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.quickHeader}>
          <IconBadge icon="options-outline" size="sm" tone="secondary" />
          <View style={styles.quickHeaderText}>
            <Text
              style={[
                styles.quickTitle,
                {
                  color: colors.text,
                  fontSize: fontSizes.xl * fontMultiplier,
                  lineHeight: lineHeights.xl * fontMultiplier,
                },
              ]}
            >
              Accesibilidad rápida
            </Text>
            <Text
              style={[
                styles.quickDescription,
                {
                  color: colors.textMuted,
                  fontSize: fontSizes.sm * fontMultiplier,
                  lineHeight: lineHeights.sm * fontMultiplier,
                },
              ]}
            >
              {lastChangeLabel} Ajustes activos: {activeSettingsCount}.
            </Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <AccessibleButton
            accessibilityHint="Aumenta el tamaño de letra de la aplicación."
            fullWidth={false}
            icon="text-outline"
            onPress={increaseFontScale}
            style={styles.quickButton}
            title="A+"
            variant="secondary"
          />
          <AccessibleButton
            accessibilityHint="Reduce el tamaño de letra de la aplicación."
            fullWidth={false}
            icon="text-outline"
            onPress={decreaseFontScale}
            style={styles.quickButton}
            title="A−"
            variant="secondary"
          />
        </View>

        <AccessibilityToggle
          accessibilityHint="Cambia la interfaz a colores de alto contraste para mejorar la lectura."
          description="Mejora la legibilidad para personas con baja visión."
          icon="contrast-outline"
          label="Alto contraste"
          onValueChange={setHighContrast}
          value={settings.highContrast}
        />
        <AccessibilityToggle
          accessibilityHint="Activa una experiencia con menos opciones visibles y textos más directos."
          description="Reduce la carga visual y cognitiva."
          icon="sparkles-outline"
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

      <View style={styles.improvementPanel}>
        {improvements.map((item) => (
          <View key={item} style={[styles.improvementItem, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <Ionicons color={colors.success} name="checkmark-circle-outline" size={18} />
            <Text
              style={[
                styles.improvementText,
                {
                  color: colors.text,
                  fontSize: fontSizes.sm * fontMultiplier,
                  lineHeight: lineHeights.sm * fontMultiplier,
                },
              ]}
            >
              {item}
            </Text>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderWidth: 1,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.24,
    shadowRadius: 34,
    elevation: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  livePillText: {
    fontWeight: fontWeights.extraBold,
  },
  heroTitle: {
    fontWeight: fontWeights.black,
    letterSpacing: -1.4,
    marginBottom: spacing.md,
  },
  heroDescription: {
    fontWeight: fontWeights.medium,
  },
  heroActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  heroButton: {
    flex: 1,
  },
  insightGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  insightCard: {
    flex: 1,
    minHeight: 118,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 3,
  },
  insightValue: {
    fontWeight: fontWeights.black,
    marginTop: spacing.md,
  },
  insightLabel: {
    fontWeight: fontWeights.medium,
  },
  section: {
    gap: spacing.lg,
    marginTop: spacing.section,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionKicker: {
    fontWeight: fontWeights.extraBold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontWeight: fontWeights.black,
    letterSpacing: -0.8,
  },
  countPill: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  countPillText: {
    fontWeight: fontWeights.extraBold,
  },
  moduleList: {
    gap: spacing.md,
  },
  quickPanel: {
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.xxl,
    marginTop: spacing.section,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 30,
    elevation: 5,
  },
  quickHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quickHeaderText: {
    flex: 1,
  },
  quickTitle: {
    fontWeight: fontWeights.extraBold,
  },
  quickDescription: {
    fontWeight: fontWeights.medium,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickButton: {
    flex: 1,
  },
  improvementPanel: {
    gap: spacing.md,
    marginTop: spacing.section,
  },
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  improvementText: {
    flex: 1,
    fontWeight: fontWeights.extraBold,
  },
});
