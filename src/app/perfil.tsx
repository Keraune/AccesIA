import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AccessibleButton } from '@/components/AccessibleButton';
import { AppHeader } from '@/components/AppHeader';
import { InfoCard } from '@/components/InfoCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { radius, spacing, touchTarget } from '@/constants/layout';
import { fontSizes, fontWeights, lineHeights } from '@/constants/typography';
import { useAccessibility } from '@/context/AccessibilityContext';
import { UserProfile, useProfile } from '@/context/ProfileContext';
import type { AppIconName } from '@/data/appModules';

const useOptions: { label: string; value: UserProfile['preferredUse']; icon: AppIconName }[] = [
  { label: 'Lectura', value: 'lectura', icon: 'volume-high-outline' },
  { label: 'Subtítulos', value: 'subtitulos', icon: 'chatbox-ellipses-outline' },
  { label: 'Voz', value: 'voz', icon: 'mic-outline' },
  { label: 'Simple', value: 'simple', icon: 'sparkles-outline' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, fontMultiplier } = useAccessibility();
  const { initials, profile, signedIn, signIn, signOut, updateProfile } = useProfile();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [message, setMessage] = useState('Personaliza AccesIA para que la app se adapte a ti.');

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setMessage('No se concedió permiso para acceder a tus fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.82,
    });

    if (result.canceled) return;

    const uri = result.assets[0]?.uri;
    if (uri) {
      updateProfile({ avatarUri: uri });
      setMessage('Foto de perfil actualizada.');
    }
  }

  function saveProfile() {
    const cleanName = name.trim() || 'Usuario AccesIA';
    const cleanEmail = email.trim();
    updateProfile({ name: cleanName, email: cleanEmail });
    if (cleanEmail) {
      signIn({ name: cleanName, email: cleanEmail });
      setMessage('Perfil guardado e inicio con correo activo.');
    } else {
      setMessage('Perfil guardado. Agrega un correo para iniciar sesión local.');
    }
  }

  return (
    <ScreenContainer>
      <AppHeader title="Perfil" subtitle="Tu cuenta y preferencias" />

      <View
        style={[
          styles.profileCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.avatarRow}>
          <Pressable
            accessibilityHint="Selecciona una imagen de tu galería como foto de perfil."
            accessibilityLabel="Cambiar foto de perfil"
            accessibilityRole="button"
            onPress={pickImage}
            style={({ pressed }) => [
              styles.avatar,
              {
                backgroundColor: colors.primaryDeep,
                borderColor: colors.border,
                opacity: pressed ? 0.86 : 1,
              },
            ]}
          >
            {profile.avatarUri ? (
              <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} contentFit="cover" />
            ) : (
              <Text style={[styles.avatarInitials, { color: colors.white, fontSize: 28 * fontMultiplier }]}>{initials}</Text>
            )}
            <View style={[styles.cameraBadge, { backgroundColor: colors.accent }]}> 
              <Ionicons color={colors.white} name="camera" size={16} />
            </View>
          </Pressable>

          <View style={styles.profileInfo}>
            <Text
              style={[
                styles.namePreview,
                {
                  color: colors.text,
                  fontSize: fontSizes.xxl * fontMultiplier,
                  lineHeight: lineHeights.xxl * fontMultiplier,
                },
              ]}
            >
              {profile.name}
            </Text>
            <Text
              style={[
                styles.emailPreview,
                {
                  color: colors.textMuted,
                  fontSize: fontSizes.sm * fontMultiplier,
                  lineHeight: lineHeights.sm * fontMultiplier,
                },
              ]}
            >
              {signedIn ? profile.email : 'Cuenta local sin correo'}
            </Text>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text, fontSize: fontSizes.sm * fontMultiplier }]}>Nombre</Text>
          <TextInput
            accessibilityLabel="Nombre de usuario"
            onChangeText={setName}
            placeholder="Tu nombre"
            placeholderTextColor={colors.textSubtle}
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
                fontSize: fontSizes.md * fontMultiplier,
              },
            ]}
            value={name}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text, fontSize: fontSizes.sm * fontMultiplier }]}>Correo</Text>
          <TextInput
            accessibilityLabel="Correo electrónico"
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={colors.textSubtle}
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
                fontSize: fontSizes.md * fontMultiplier,
              },
            ]}
            value={email}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.lg * fontMultiplier }]}>Uso principal</Text>
        <View style={styles.preferencesGrid}>
          {useOptions.map((option) => {
            const selected = profile.preferredUse === option.value;
            return (
              <Pressable
                accessibilityLabel={`Seleccionar ${option.label} como uso principal`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={option.value}
                onPress={() => updateProfile({ preferredUse: option.value })}
                style={({ pressed }) => [
                  styles.preferenceItem,
                  {
                    backgroundColor: selected ? colors.primaryDeep : colors.background,
                    borderColor: selected ? colors.accent : colors.border,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}
              >
                <Ionicons color={selected ? colors.white : colors.primary} name={option.icon} size={22} />
                <Text
                  style={[
                    styles.preferenceLabel,
                    {
                      color: selected ? colors.white : colors.text,
                      fontSize: fontSizes.sm * fontMultiplier,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <AccessibleButton
          accessibilityHint="Guarda nombre, correo y preferencias del perfil."
          icon="save-outline"
          onPress={saveProfile}
          title="Guardar perfil"
          variant="accent"
        />
        {signedIn ? (
          <AccessibleButton
            accessibilityHint="Cierra la sesión local en AccesIA."
            icon="log-out-outline"
            onPress={() => {
              signOut();
              setName('Usuario AccesIA');
              setEmail('');
              setMessage('Sesión local cerrada.');
            }}
            title="Cerrar sesión local"
            variant="ghost"
          />
        ) : null}
      </View>

      <InfoCard
        icon="information-circle-outline"
        text={message}
        title="Estado del perfil"
        tone="primary"
      />

      <AccessibleButton
        accessibilityHint="Regresa al inicio de AccesIA."
        icon="home-outline"
        onPress={() => router.push('/' as never)}
        title="Volver al inicio"
        variant="secondary"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    gap: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.xxl,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 6,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 32,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    fontWeight: fontWeights.black,
  },
  cameraBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  profileInfo: {
    flex: 1,
  },
  namePreview: {
    fontWeight: fontWeights.black,
    letterSpacing: -0.7,
  },
  emailPreview: {
    fontWeight: fontWeights.medium,
  },
  formGroup: {
    gap: spacing.sm,
  },
  label: {
    fontWeight: fontWeights.extraBold,
  },
  input: {
    minHeight: touchTarget.comfortable,
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    fontWeight: fontWeights.medium,
  },
  sectionTitle: {
    fontWeight: fontWeights.black,
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  preferenceItem: {
    width: '47.5%',
    minHeight: 92,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  preferenceLabel: {
    fontWeight: fontWeights.extraBold,
    textAlign: 'center',
  },
});
