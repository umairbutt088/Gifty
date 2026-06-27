import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandBanner, GeometricBackground, GlassCard, Spacer, ThemedActivityIndicator } from '@/components';
import { Colors } from '@/constants/colors';
import { useThemedAuthStyles } from '@/hooks/use-themed-auth-styles';
import { getAuthErrorMessage, isValidEmail } from '@/lib/auth-errors';
import { getPasswordResetRedirectUrl, getSupabaseRedirectAllowList } from '@/lib/auth-linking';
import { getRoleHomeHref } from '@/lib/role-routes';
import { resetPassword, signIn } from '@/lib';
import type { UserRole } from '@/types/user';

export default function LoginScreen() {
  const styles = useThemedAuthStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = isValidEmail(email) && password.length > 0 && !loading;

  async function handleLogin() {
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    const { data, error: authError } = await signIn({ email, password });

    setLoading(false);

    if (authError) {
      setError(getAuthErrorMessage(authError));
      return;
    }

    const role = (data.user?.user_metadata?.role as UserRole | undefined) ?? 'buyer';
    router.replace(getRoleHomeHref(role));
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
                  <ThemedActivityIndicator />
                ) : (
                  <Text style={styles.buttonText}>Sign in</Text>
                )}
              </Pressable>
            </GlassCard>

            <Text style={styles.footerText}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" style={styles.footerLink}>
                Create account
              </Link>
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
