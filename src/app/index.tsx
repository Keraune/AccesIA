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

const dailyActions = [
  {
    label: 'Escuchar un texto',
    description: 'Lee información extensa sin forzar la vista.',
    icon: 'volume-high-outline' as const,
  },
  {
    label: 'Dictar una acción',
    description: 'Usa la voz para reducir pasos táctiles.',
    icon: 'mic-outline' as const,
  },
  {
    label: 'Ver subtítulos',
    description: 'Comprende contenido con audio mediante texto visible.',
    icon: 'chatbubbles-outline' as const,
  },
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
        accessibilityLabel="Panel principal de AccesIA. Asistente de accesibilidad para lectura, voz, subtítulos y ajustes visuales."
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
              Asistente listo
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
          Tu centro de accesibilidad diario.
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
          Abre AccesIA cuando necesites escuchar textos, dictar acciones, activar subtítulos o adaptar la interfaz a tu forma de usar el móvil.
        </Text>

        <View style={styles.heroActions}>
          <AccessibleButton
            accessibilityHint="Abre lectura accesible."
            fullWidth={false}
            icon="volume-high-outline"
            onPress={() => router.push('/lectura' as never)}
            style={styles.heroButton}
            title="Leer ahora"
            variant="accent"
          />
          <AccessibleButton
            accessibilityHint="Abre el asistente por voz."
            fullWidth={false}
            icon="mic-outline"
            onPress={() => router.push('/asistente' as never)}
            style={styles.heroButton}
            title="Usar voz"
            variant="dark"
          />
        </View>
      </View>

      <View style={styles.actionGrid}>
        {dailyActions.map((item) => (
          <View
            accessible
            accessibilityLabel={`${item.label}. ${item.description}`}
            key={item.label}
            style={[
              styles.actionCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Ionicons color={colors.secondary} name={item.icon} size={22} />
            <Text
              style={[
                styles.actionTitle,
                {
                  color: colors.text,
                  fontSize: fontSizes.md * fontMultiplier,
                  lineHeight: lineHeights.md * fontMultiplier,
                },
              ]}
            >
              {item.label}
            </Text>
            <Text
              style={[
                styles.actionText,
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
        icon="shield-checkmark-outline"
        text="AccesIA se usa cuando el usuario necesita apoyo. Las preferencias se guardan localmente y el usuario mantiene el control de lectura, voz, subtítulos y ajustes visuales."
        title="Control del usuario"
        tone="primary"
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
              Funciones
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
              ¿Qué necesitas hacer?
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
              {settings.quickAccessEnabled ? 'Acceso rápido' : 'Reducido'}
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
            text="Los accesos rápidos están ocultos para reducir distracciones. Puedes volver a activarlos desde Ajustes."
            title="Interfaz reducida"
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
  actionGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  actionCard: {
    flex: 1,
    minHeight: 132,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 3,
  },
  actionTitle: {
    fontWeight: fontWeights.extraBold,
    marginTop: spacing.md,
  },
  actionText: {
    fontWeight: fontWeights.medium,
    marginTop: spacing.xs,
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
});
