import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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

const quickUseCases = [
  {
    label: 'Video o clase',
    description: 'Activa subtítulos sobre el contenido.',
    icon: 'play-circle-outline' as const,
  },
  {
    label: 'Texto largo',
    description: 'Escúchalo con voz natural.',
    icon: 'document-text-outline' as const,
  },
  {
    label: 'Manos ocupadas',
    description: 'Dicta una acción por voz.',
    icon: 'mic-circle-outline' as const,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const {
    activeSettingsCount,
    colors,
    fontMultiplier,
    lastChangeLabel,
    liveCaptionsActive,
    settings,
    decreaseFontScale,
    increaseFontScale,
    setHighContrast,
    setSimplifiedMode,
    startLiveCaptions,
  } = useAccessibility();

  return (
    <ScreenContainer>
      <AppHeader subtitle="Lectura, voz y subtítulos en una sola app" />

      <View
        accessible
        accessibilityLabel="Panel principal de AccesIA. Herramientas de accesibilidad para leer, dictar, subtitular y adaptar la interfaz."
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.primaryDeep,
            borderColor: settings.highContrast ? colors.border : 'rgba(255,255,255,0.14)',
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.heroDecorOne} />
        <View style={styles.heroDecorTwo} />

        <View style={styles.heroTopRow}>
          <View style={[styles.livePill, { backgroundColor: 'rgba(255,255,255,0.12)' }]}> 
            <View style={[styles.liveDot, { backgroundColor: liveCaptionsActive ? colors.accent : colors.secondary }]} />
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
              {liveCaptionsActive ? 'Subtítulos activos' : 'Asistente listo'}
            </Text>
          </View>
          <IconBadge icon="sparkles-outline" inverted size="sm" tone="accent" />
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
          Accesibilidad que aparece cuando la necesitas.
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
          Usa AccesIA para escuchar textos, dictar acciones, activar subtítulos flotantes sobre contenido con audio y adaptar la app a tu forma de interactuar.
        </Text>

        <View style={styles.heroActions}>
          <AccessibleButton
            accessibilityHint="Activa subtítulos flotantes sobre la pantalla."
            fullWidth={false}
            icon="chatbox-ellipses-outline"
            onPress={() => startLiveCaptions('device')}
            style={styles.heroButton}
            title="Subtitular ahora"
            variant="accent"
          />
          <AccessibleButton
            accessibilityHint="Abre lectura inteligente."
            fullWidth={false}
            icon="volume-high-outline"
            onPress={() => router.push('/lectura' as never)}
            style={styles.heroButton}
            title="Escuchar texto"
            variant="dark"
          />
        </View>
      </View>

      <View style={styles.devicePreviewRow}>
        {quickUseCases.map((item) => (
          <Pressable
            accessibilityHint={`Abrir función relacionada con ${item.label}`}
            accessibilityLabel={`${item.label}. ${item.description}`}
            accessibilityRole="button"
            key={item.label}
            onPress={() => {
              if (item.label === 'Video o clase') startLiveCaptions('video');
              if (item.label === 'Texto largo') router.push('/lectura' as never);
              if (item.label === 'Manos ocupadas') router.push('/asistente' as never);
            }}
            style={({ pressed }) => [
              styles.useCaseCard,
              {
                backgroundColor: colors.surface,
                borderColor: pressed ? colors.primary : colors.border,
                opacity: pressed ? 0.9 : 1,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <View style={[styles.useCaseIcon, { backgroundColor: colors.primarySoft }]}> 
              <Ionicons color={colors.primary} name={item.icon} size={22} />
            </View>
            <Text
              style={[
                styles.useCaseTitle,
                {
                  color: colors.text,
                  fontSize: fontSizes.sm * fontMultiplier,
                  lineHeight: lineHeights.sm * fontMultiplier,
                },
              ]}
            >
              {item.label}
            </Text>
            <Text
              style={[
                styles.useCaseText,
                {
                  color: colors.textMuted,
                  fontSize: fontSizes.xs * fontMultiplier,
                  lineHeight: lineHeights.xs * fontMultiplier,
                },
              ]}
            >
              {item.description}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.statusGrid}>
        <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.statusNumber, { color: colors.text, fontSize: fontSizes.xxl * fontMultiplier }]}>{activeSettingsCount}</Text>
          <Text style={[styles.statusLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>ajustes activos</Text>
        </View>
        <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.statusNumber, { color: liveCaptionsActive ? colors.accent : colors.text, fontSize: fontSizes.xxl * fontMultiplier }]}>{liveCaptionsActive ? 'ON' : 'OFF'}</Text>
          <Text style={[styles.statusLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>subtítulos</Text>
        </View>
      </View>

      <InfoCard
        icon="layers-outline"
        text="AccesIA funciona como un centro de asistencia: abre la app, activa la herramienta que necesitas y mantén el control de lectura, voz, subtítulos y ajustes visuales."
        title="¿Qué ofrece?"
        tone="secondary"
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
              Herramientas
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
              Elige una función
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
              {settings.quickAccessEnabled ? 'Menú rápido' : 'Reducido'}
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
              {lastChangeLabel}
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
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.28,
    shadowRadius: 40,
    elevation: 10,
  },
  heroDecorOne: {
    position: 'absolute',
    top: -72,
    right: -64,
    width: 178,
    height: 178,
    borderRadius: 120,
    backgroundColor: 'rgba(124, 58, 237, 0.36)',
  },
  heroDecorTwo: {
    position: 'absolute',
    bottom: -92,
    left: -70,
    width: 190,
    height: 190,
    borderRadius: 130,
    backgroundColor: 'rgba(6, 182, 212, 0.22)',
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
    letterSpacing: -1.5,
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
  devicePreviewRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  useCaseCard: {
    flex: 1,
    minHeight: 154,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 4,
  },
  useCaseIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  useCaseTitle: {
    fontWeight: fontWeights.extraBold,
    marginTop: spacing.md,
  },
  useCaseText: {
    fontWeight: fontWeights.medium,
    marginTop: spacing.xs,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  statusCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  statusNumber: {
    fontWeight: fontWeights.black,
  },
  statusLabel: {
    fontWeight: fontWeights.extraBold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
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
