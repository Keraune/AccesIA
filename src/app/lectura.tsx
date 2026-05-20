import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AccessibleButton } from '@/components/AccessibleButton';
import { AppHeader } from '@/components/AppHeader';
import { InfoCard } from '@/components/InfoCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { radius, spacing } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';

const sampleText =
  'Hoy revisaremos una actividad de accesibilidad. Puedes aumentar el tamaño de letra, activar alto contraste o escuchar este contenido para recibir la información de otra forma.';

export default function ReadingScreen() {
  const {
    colors,
    fontMultiplier,
    settings,
    decreaseFontScale,
    increaseFontScale,
    setHighContrast,
  } = useAccessibility();
  const [isReading, setIsReading] = useState(false);

  return (
    <ScreenContainer>
      <AppHeader title="Lectura" subtitle="Texto claro y lectura por voz" />

      <View
        accessible
        accessibilityLabel={`Texto de ejemplo. ${sampleText}`}
        style={[
          styles.readingCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
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
          Contenido de ejemplo
        </Text>
        <Text
          style={[
            styles.readingText,
            {
              color: colors.text,
              fontSize: fontSizes.xl * fontMultiplier,
              lineHeight: lineHeights.xxl * fontMultiplier,
            },
          ]}
        >
          {sampleText}
        </Text>
      </View>

      <InfoCard
        text={
          isReading
            ? 'Leyendo contenido. En una integración completa esta acción usará texto a voz.'
            : 'Lectura detenida. Presiona el botón para iniciar la demostración.'
        }
        title={isReading ? 'Estado: lectura activa' : 'Estado: lectura detenida'}
        tone={isReading ? 'success' : 'default'}
      />

      <View style={styles.actions}>
        <AccessibleButton
          accessibilityHint="Activa o detiene la lectura demostrativa del texto mostrado."
          onPress={() => setIsReading((current) => !current)}
          title={isReading ? 'Detener lectura' : 'Escuchar contenido'}
          variant={isReading ? 'accent' : 'primary'}
        />
        <View style={styles.buttonRow}>
          <AccessibleButton
            accessibilityHint="Aumenta el tamaño del texto en toda la aplicación."
            fullWidth={false}
            onPress={increaseFontScale}
            title="Aumentar letra"
            variant="secondary"
          />
          <AccessibleButton
            accessibilityHint="Reduce el tamaño del texto en toda la aplicación."
            fullWidth={false}
            onPress={decreaseFontScale}
            title="Reducir letra"
            variant="secondary"
          />
        </View>
        <AccessibleButton
          accessibilityHint="Activa o desactiva el tema de alto contraste."
          onPress={() => setHighContrast(!settings.highContrast)}
          title={settings.highContrast ? 'Desactivar contraste' : 'Cambiar contraste'}
          variant="ghost"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  readingCard: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xxl,
  },
  kicker: {
    fontWeight: fontWeights.extraBold,
    letterSpacing: 0.8,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  readingText: {
    fontWeight: fontWeights.medium,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.section,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
