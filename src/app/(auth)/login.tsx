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

import { BrandBanner, GeometricBackground, GlassCard, Spacer } from '@/components';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { resetPassword, signIn } from '@/lib';
import { getAuthErrorMessage, isValidEmail } from '@/lib/auth-errors';
import { getPasswordResetRedirectUrl, getSupabaseRedirectAllowList } from '@/lib/auth-linking';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = isValidEmail(email) && password.length > 0 && !loading;

  async function handleLogin() {
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    const { error: authError } = await signIn({ email, password });

    setLoading(false);

    if (authError) {
      setError(getAuthErrorMessage(authError));
      return;
    }

    router.replace('/home');
  }

  async function handleForgotPassword() {
    if (!isValidEmail(email)) {
      Alert.alert('Enter your email', 'Add a valid email above, then tap Forgot password again.');
      return;
    }

    const redirectUrl = getPasswordResetRedirectUrl();
    const { error: resetError } = await resetPassword(email);

    if (resetError) {
      Alert.alert('Could not send reset email', getAuthErrorMessage(resetError));
      return;
    }

    if (__DEV__) {
      console.log('[auth] password reset redirectTo:', redirectUrl);
      console.log('[auth] add to Supabase Redirect URLs:', getSupabaseRedirectAllowList());
    }

    Alert.alert(
      'Check your email',
      'We sent a password reset link. Open it on the same device where Gifty is installed (simulator Mail or your phone — not Chrome on your Mac). Request a fresh link if the previous one expired.',
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
            <Spacer.Column numberOfSpaces={5} />
            <View style={styles.header}>
              <BrandBanner />
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to your Gifty account.</Text>
            </View>

            <GlassCard style={styles.formCard}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!loading}
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry
                  autoComplete="current-password"
                  editable={!loading}
                  style={styles.input}
                />
              </View>

              <Pressable onPress={handleForgotPassword} disabled={loading}>
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              </Pressable>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable
                onPress={handleLogin}
                disabled={!canSubmit}
                style={({ pressed }) => [
                  styles.button,
                  !canSubmit && styles.buttonDisabled,
                  pressed && canSubmit && styles.buttonPressed,
                ]}>
                {loading ? (
                  <ActivityIndicator color={Colors.text} />
                ) : (
                  <Text style={styles.buttonText}>Sign in</Text>
                )}
              </Pressable>
            </GlassCard>

            <Text style={styles.footer}>
              Don&apos;t have an account?{' '}
              <Link href="/" style={styles.footerLink}>
                Create account
              </Link>
            </Text>
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
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.one,
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
  forgotPassword: {
    color: Colors.accentLight,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
  },
  errorText: {
    color: 'rgba(220, 130, 130, 0.9)',
    fontSize: 12,
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
  footer: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  footerLink: {
    color: Colors.accentLight,
    fontWeight: '500',
  },
});
