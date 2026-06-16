import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

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
import { useProfile } from '@/context/ProfileContext';
import { appModules, type AppIconName, type AppRoute } from '@/data/appModules';
import { startAndroidFloatingAssistant } from '@/services/systemOverlay';

type ProductFeature = {
  label: string;
  description: string;
  icon: AppIconName;
  route: AppRoute;
};

const productFeatures: ProductFeature[] = [
  {
    label: 'Subtítulos flotantes',
    description: 'Burbuja de Android para ver texto sobre otras apps.',
    icon: 'chatbox-ellipses-outline',
    route: '/subtitulos',
  },
  {
    label: 'Lectura por voz',
    description: 'Pega texto y escúchalo con ritmo configurable.',
    icon: 'volume-high-outline',
    route: '/lectura',
  },
  {
    label: 'Dictado y comandos',
    description: 'Controla acciones por voz cuando tú lo decidas.',
    icon: 'mic-outline',
    route: '/asistente',
  },
  {
    label: 'Accesibilidad visual',
    description: 'Ajusta contraste, tamaño de letra y lectura clara.',
    icon: 'eye-outline',
    route: '/configuracion',
  },
  {
    label: 'Modo simple',
    description: 'Menos opciones, botones grandes y acciones directas.',
    icon: 'sparkles-outline',
    route: '/modo-simplificado',
  },
  {
    label: 'Perfil personal',
    description: 'Guarda preferencias de uso para adaptar la app.',
    icon: 'person-circle-outline',
    route: '/perfil',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const {
    activeSettingsCount,
    captionFontMultiplier,
    colors,
    fontMultiplier,
    lastChangeLabel,
    liveCaptionSource,
    liveCaptionsActive,
    settings,
    decreaseFontScale,
    increaseFontScale,
    setHighContrast,
    setSimplifiedMode,
    startLiveCaptions,
  } = useAccessibility();
  const { profile, signedIn } = useProfile();

  async function openSystemBubble() {
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
        Alert.alert(
          'Permiso requerido',
          'Activa “Mostrar sobre otras apps” para usar la burbuja de AccesIA fuera de la aplicación.',
        );
        return;
      }

      Alert.alert(
        'APK nativa requerida',
        'La burbuja del sistema funciona en Android mediante una compilación nativa. Puedes configurar subtítulos desde la pantalla Subtítulos.',
      );
      router.push('/subtitulos' as never);
    } catch {
      Alert.alert(
        'No se pudo abrir la burbuja',
        'Revisa el permiso de superposición o vuelve a intentarlo desde Ajustes.',
      );
    }
  }

  return (
    <ScreenContainer>
      <AppHeader subtitle="Asistencia accesible para leer, escuchar y subtitular" />

      <View
        accessible
        accessibilityLabel="Inicio de AccesIA. Herramientas para subtítulos, lectura por voz, dictado, accesibilidad visual, modo simple y perfil personal."
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.heroTopRow}>
          <View style={[styles.statusPill, { backgroundColor: liveCaptionsActive ? colors.successSoft : colors.primarySoft }]}> 
            <View style={[styles.statusDot, { backgroundColor: liveCaptionsActive ? colors.success : colors.primary }]} />
            <Text
              style={[
                styles.statusPillText,
                {
                  color: liveCaptionsActive ? colors.success : colors.primary,
                  fontSize: fontSizes.xs * fontMultiplier,
                  lineHeight: lineHeights.xs * fontMultiplier,
                },
              ]}
            >
              {liveCaptionsActive ? 'Subtítulos activos' : 'Listo para asistir'}
            </Text>
          </View>
          <IconBadge icon="accessibility-outline" size="md" tone="accent" />
        </View>

        <Text
          style={[
            styles.heroTitle,
            {
              color: colors.text,
              fontSize: fontSizes.hero * fontMultiplier,
              lineHeight: lineHeights.hero * fontMultiplier,
            },
          ]}
        >
          {signedIn ? `Hola, ${profile.name.split(' ')[0]}. ¿Qué apoyo necesitas ahora?` : 'Asistencia accesible cuando la necesitas.'}
        </Text>
        <Text
          style={[
            styles.heroDescription,
            {
              color: colors.textMuted,
              fontSize: fontSizes.md * fontMultiplier,
              lineHeight: lineHeights.md * fontMultiplier,
            },
          ]}
        >
          AccesIA reúne subtítulos flotantes, lectura por voz, dictado, ajustes visuales, modo simple y perfil personal en una experiencia limpia y fácil de usar.
        </Text>

        <View style={styles.heroActions}>
          <AccessibleButton
            accessibilityHint="Solicita el permiso y abre la burbuja flotante del sistema Android."
            fullWidth={false}
            icon="albums-outline"
            onPress={() => void openSystemBubble()}
            style={styles.heroButton}
            title="Abrir burbuja"
            variant="accent"
          />
          <AccessibleButton
            accessibilityHint="Abre la pantalla de lectura por voz."
            fullWidth={false}
            icon="volume-high-outline"
            onPress={() => router.push('/lectura' as never)}
            style={styles.heroButton}
            title="Escuchar texto"
            variant="secondary"
          />
        </View>
      </View>

      <View style={styles.featureGrid}>
        {productFeatures.map((item) => (
          <Pressable
            accessibilityHint={`Abrir ${item.label}`}
            accessibilityLabel={`${item.label}. ${item.description}`}
            accessibilityRole="button"
            key={item.label}
            onPress={() => router.push(item.route as never)}
            style={({ pressed }) => [
              styles.featureCard,
              {
                backgroundColor: colors.surface,
                borderColor: pressed ? colors.primary : colors.border,
                opacity: pressed ? 0.9 : 1,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <View style={[styles.featureIcon, { backgroundColor: colors.primarySoft }]}> 
              <Ionicons color={colors.primary} name={item.icon} size={22} />
            </View>
            <Text
              style={[
                styles.featureTitle,
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
                styles.featureText,
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
          <Text style={[styles.statusNumber, { color: liveCaptionsActive ? colors.accent : colors.text, fontSize: fontSizes.xxl * fontMultiplier }]}>{liveCaptionsActive ? 'Activo' : 'Inactivo'}</Text>
          <Text style={[styles.statusLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>subtítulos</Text>
        </View>
      </View>

      <InfoCard
        icon="phone-portrait-outline"
        text="La burbuja flotante se administra desde Android y puede mantenerse visible sobre otras aplicaciones cuando el permiso está activo."
        title="Burbuja del sistema"
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
              Funciones principales
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
              {settings.quickAccessEnabled ? 'Visible' : 'Reducido'}
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
            backgroundColor: colors.surface,
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
              Ajustes rápidos
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
          label="Modo simple"
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
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 30,
    elevation: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
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
  statusPillText: {
    fontWeight: fontWeights.extraBold,
    textTransform: 'uppercase',
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
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  heroButton: {
    flex: 1,
    minWidth: 150,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  featureCard: {
    width: '47.5%',
    minHeight: 174,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
  },
  featureIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  featureTitle: {
    fontWeight: fontWeights.extraBold,
    marginTop: spacing.md,
  },
  featureText: {
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
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
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
