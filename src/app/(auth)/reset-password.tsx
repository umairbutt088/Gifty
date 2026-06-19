import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandBanner, GeometricBackground, GlassCard } from '@/components';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { updatePassword } from '@/lib';
import { useAuth } from '@/providers/auth-provider';

export default function ResetPasswordScreen() {
  const { session, isPasswordRecovery, recoveryLinkError, clearPasswordRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordsMatch = password === confirmPassword;
  const canSubmit =
    Boolean(session) &&
    isPasswordRecovery &&
    password.length >= 6 &&
    passwordsMatch &&
    !loading;

  async function handleUpdatePassword() {
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    const { error: authError } = await updatePassword(password);

    setLoading(false);

    if (authError) {
      setError(getAuthErrorMessage(authError));
      return;
    }

    clearPasswordRecovery();

    Alert.alert('Password updated', 'Your password has been changed. You can continue using Gifty.', [
      { text: 'Continue', onPress: () => router.replace('/home') },
    ]);
  }

  if (recoveryLinkError) {
    return (
      <View style={styles.root}>
        <GeometricBackground />
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <BrandBanner showTagline={false} />
            <GlassCard style={styles.formCard}>
              <Text style={styles.title}>Reset link expired</Text>
              <Text style={styles.subtitle}>{recoveryLinkError}</Text>
              <Text style={styles.helpText}>
                Request a new reset email from the sign in screen, then open the link on the same
                phone where Gifty is installed.
              </Text>
              <Link href="/login" style={styles.linkButtonText}>
                Back to sign in
              </Link>
            </GlassCard>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  if (!session || !isPasswordRecovery) {
    return (
      <View style={styles.root}>
        <GeometricBackground />
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <BrandBanner showTagline={false} />
            <GlassCard style={styles.formCard}>
              <Text style={styles.title}>Reset link required</Text>
              <Text style={styles.subtitle}>
                Open the password reset link from your email on this device, or request a new one
                from the sign in screen.
              </Text>
              <Link href="/login" style={styles.linkButtonText}>
                Back to sign in
              </Link>
            </GlassCard>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <GeometricBackground />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <BrandBanner showTagline={false} />
              <Text style={styles.title}>Choose a new password</Text>
              <Text style={styles.subtitle}>Enter and confirm your new password below.</Text>
            </View>

            <GlassCard style={styles.formCard}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>New password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 6 characters"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry
                  autoComplete="new-password"
                  editable={!loading}
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Confirm new password</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter your password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry
                  autoComplete="new-password"
                  editable={!loading}
                  style={[
                    styles.input,
                    confirmPassword.length > 0 && !passwordsMatch && styles.inputError,
                  ]}
                />
                {confirmPassword.length > 0 && !passwordsMatch ? (
                  <Text style={styles.errorText}>Passwords do not match</Text>
                ) : null}
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable
                onPress={handleUpdatePassword}
                disabled={!canSubmit}
                style={({ pressed }) => [
                  styles.button,
                  !canSubmit && styles.buttonDisabled,
                  pressed && canSubmit && styles.buttonPressed,
                ]}>
                {loading ? (
                  <ActivityIndicator color={Colors.text} />
                ) : (
                  <Text style={styles.buttonText}>Update password</Text>
                )}
              </Pressable>
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.three,
    alignItems: 'stretch',
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  helpText: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  formCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.one,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.input,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
    color: Colors.text,
    fontSize: 16,
  },
  inputError: {
    borderColor: 'rgba(220, 100, 100, 0.6)',
  },
  errorText: {
    color: 'rgba(220, 130, 130, 0.9)',
    fontSize: 12,
  },
  button: {
    backgroundColor: Colors.button,
    borderWidth: 1,
    borderColor: Colors.buttonBorder,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  buttonDisabled: {
    backgroundColor: Colors.buttonDisabled,
  },
  buttonPressed: {
    backgroundColor: Colors.buttonPressed,
  },
  buttonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  linkButtonText: {
    color: Colors.accentLight,
    fontSize: 15,
    fontWeight: '600',
    marginTop: Spacing.two,
  },
});
