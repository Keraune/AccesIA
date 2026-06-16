import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AccessibleButton } from '@/components/AccessibleButton';
import { AppHeader } from '@/components/AppHeader';
import { InfoCard } from '@/components/InfoCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';
import { useProfile } from '@/context/ProfileContext';
import { appModules, type AppIconName } from '@/data/appModules';
import { openAndroidAccessibilitySettings, openAndroidAppByName } from '@/services/deviceControl';
import { startAndroidFloatingAssistant } from '@/services/systemOverlay';

type QuickAction = {
  label: string;
  icon: AppIconName;
  action: () => void;
};

export default function HomeScreen() {
  const router = useRouter();
  const {
    activeSettingsCount,
    captionFontMultiplier,
    colors,
    fontMultiplier,
    liveCaptionSource,
    liveCaptionsActive,
    settings,
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
        Alert.alert('Permiso requerido', 'Activa “Mostrar sobre otras apps” para usar la burbuja de AccesIA fuera de la aplicación.');
        return;
      }

      Alert.alert('APK nativa requerida', 'La burbuja del sistema funciona en Android mediante una compilación nativa.');
      router.push('/subtitulos' as never);
    } catch {
      Alert.alert('No se pudo abrir la burbuja', 'Revisa el permiso de superposición o vuelve a intentarlo desde Ajustes.');
    }
  }

  const quickActions: QuickAction[] = [
    { label: 'Burbuja', icon: 'radio-button-on-outline', action: () => void openSystemBubble() },
    { label: 'YouTube', icon: 'logo-youtube', action: () => void openAndroidAppByName('youtube') },
    { label: 'Accesibilidad', icon: 'accessibility-outline', action: () => void openAndroidAccessibilitySettings() },
    { label: 'Lectura', icon: 'volume-high-outline', action: () => router.push('/lectura' as never) },
  ];

  return (
    <ScreenContainer>
      <AppHeader subtitle="Control accesible para Android" />

      <View style={[styles.heroPanel, { backgroundColor: colors.primaryDeep }]}> 
        <View style={styles.heroStatusRow}>
          <Text style={[styles.kicker, { color: colors.accent, fontSize: fontSizes.xs * fontMultiplier }]}>AccesIA</Text>
          <View style={[styles.statusBadge, { backgroundColor: liveCaptionsActive ? colors.successSoft : 'rgba(255,255,255,0.1)' }]}> 
            <View style={[styles.statusDot, { backgroundColor: liveCaptionsActive ? colors.success : colors.accent }]} />
            <Text style={[styles.statusBadgeText, { color: liveCaptionsActive ? colors.success : colors.white, fontSize: fontSizes.xs * fontMultiplier }]}>{liveCaptionsActive ? 'Subtítulos' : 'Lista'}</Text>
          </View>
        </View>
        <Text style={[styles.heroTitle, { color: colors.white, fontSize: fontSizes.display * fontMultiplier, lineHeight: lineHeights.display * fontMultiplier }]}> 
          {signedIn ? `Hola, ${profile.name.split(' ')[0]}.` : 'Control accesible para tu celular.'}
        </Text>
        <Text style={[styles.heroDescription, { color: 'rgba(255,255,255,0.76)', fontSize: fontSizes.sm * fontMultiplier, lineHeight: lineHeights.sm * fontMultiplier }]}> 
          Usa voz, subtítulos flotantes, lectura y accesos de Android desde una interfaz limpia y rápida.
        </Text>
      </View>

      <View style={styles.quickActionRow}>
        {quickActions.map((item) => (
          <Pressable
            accessibilityLabel={item.label}
            accessibilityRole="button"
            key={item.label}
            onPress={item.action}
            style={({ pressed }) => [styles.quickAction, { opacity: pressed ? 0.76 : 1 }]}
          >
            <View style={[styles.quickIcon, { backgroundColor: colors.accentSoft }]}> 
              <Ionicons color={colors.text} name={item.icon} size={20} />
            </View>
            <Text numberOfLines={1} style={[styles.quickLabel, { color: colors.text, fontSize: fontSizes.xs * fontMultiplier }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.statsLine}>
        <View style={[styles.statCell, { borderColor: colors.border }]}> 
          <Text style={[styles.statValue, { color: colors.text, fontSize: fontSizes.xl * fontMultiplier }]}>{activeSettingsCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>ajustes activos</Text>
        </View>
        <View style={[styles.statCell, { borderColor: colors.border }]}> 
          <Text style={[styles.statValue, { color: liveCaptionsActive ? colors.success : colors.text, fontSize: fontSizes.xl * fontMultiplier }]}>{liveCaptionsActive ? 'Activo' : 'Inactivo'}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>subtítulos</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.xl * fontMultiplier }]}>Funciones</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textMuted, fontSize: fontSizes.sm * fontMultiplier }]}>Menos tarjetas, más acciones directas.</Text>
      </View>

      <View style={[styles.moduleList, { borderColor: colors.border }]}> 
        {appModules.slice(0, 5).map((module) => (
          <Pressable
            accessibilityHint={module.accessibilityHint}
            accessibilityLabel={`${module.label}. ${module.description}`}
            accessibilityRole="button"
            key={module.route}
            onPress={() => router.push(module.route as never)}
            style={({ pressed }) => [
              styles.moduleRow,
              {
                backgroundColor: pressed ? colors.surfaceElevated : colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.moduleIcon, { backgroundColor: colors.secondarySoft }]}> 
              <Ionicons color={colors.text} name={module.icon} size={20} />
            </View>
            <View style={styles.moduleTextBlock}>
              <Text style={[styles.moduleTitle, { color: colors.text, fontSize: fontSizes.md * fontMultiplier }]}>{module.label}</Text>
              <Text numberOfLines={2} style={[styles.moduleDescription, { color: colors.textMuted, fontSize: fontSizes.xs * fontMultiplier }]}>{module.description}</Text>
            </View>
            <Ionicons color={colors.textSubtle} name="chevron-forward" size={18} />
          </Pressable>
        ))}
      </View>

      <InfoCard
        icon="mic-outline"
        text="Ejemplos: abrir YouTube, abrir WhatsApp, ir a inicio, atrás, abrir subtítulos, aumentar letra o activar alto contraste."
        title="Comandos de voz"
        tone="primary"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroPanel: {
    gap: spacing.md,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
  },
  heroStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    fontWeight: fontWeights.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  statusBadgeText: {
    fontWeight: fontWeights.extraBold,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontWeight: fontWeights.black,
    letterSpacing: -0.9,
  },
  heroDescription: {
    fontWeight: fontWeights.medium,
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  quickIcon: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  quickLabel: {
    fontWeight: fontWeights.extraBold,
    textAlign: 'center',
  },
  statsLine: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.section,
  },
  statCell: {
    flex: 1,
    borderBottomWidth: 1,
    paddingBottom: spacing.md,
  },
  statValue: {
    fontWeight: fontWeights.black,
  },
  statLabel: {
    fontWeight: fontWeights.extraBold,
    letterSpacing: 0.4,
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
  sectionSubtitle: {
    fontWeight: fontWeights.medium,
  },
  moduleList: {
    borderTopWidth: 1,
  },
  moduleRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
  },
  moduleIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  moduleTextBlock: {
    flex: 1,
  },
  moduleTitle: {
    fontWeight: fontWeights.black,
  },
  moduleDescription: {
    fontWeight: fontWeights.medium,
  },
});
