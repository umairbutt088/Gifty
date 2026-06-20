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

import { BrandBanner, GeometricBackground, GlassCard, RoleTabBar } from '@/components';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { getAuthErrorMessage, isValidEmail } from '@/lib/auth-errors';
import { getRoleHomeHref } from '@/lib/role-routes';
import { signUp } from '@/lib';
import type { UserRole } from '@/types/user';

export default function SignupScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordsMatch = password === confirmPassword;
  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    isValidEmail(email) &&
    password.length >= 6 &&
    passwordsMatch &&
    !loading;

  async function handleSignup() {
    if (!canSubmit) return;

    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: authError } = await signUp({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    setLoading(false);

    if (authError) {
      setError(getAuthErrorMessage(authError));
      return;
    }

    if (data.session) {
      router.replace(getRoleHomeHref(role));
      return;
    }

    Alert.alert(
      'Check your email',
      'We sent a confirmation link. After confirming, sign in with your email and password.',
      [{ text: 'Go to sign in', onPress: () => router.push('/') }],
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
            <RoleTabBar selectedRole={role} onSelectRole={setRole} />

            <View style={styles.header}>
              <BrandBanner />
              <Text style={styles.title}>Create your account</Text>
              <Text style={styles.subtitle}>Fill in your details to get started as a {role}.</Text>
            </View>

            <GlassCard style={styles.formCard}>
              <View style={styles.nameRow}>
                <View style={[styles.field, styles.halfField]}>
                  <Text style={styles.fieldLabel}>First name</Text>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Jane"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="words"
                    autoComplete="given-name"
                    editable={!loading}
                    style={styles.input}
                  />
                </View>

                <View style={[styles.field, styles.halfField]}>
                  <Text style={styles.fieldLabel}>Last name</Text>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Doe"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="words"
                    autoComplete="family-name"
                    editable={!loading}
                    style={styles.input}
                  />
                </View>
              </View>

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
                  placeholder="At least 6 characters"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry
                  autoComplete="new-password"
                  editable={!loading}
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Confirm password</Text>
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
                onPress={handleSignup}
                disabled={!canSubmit}
                style={({ pressed }) => [
                  styles.button,
                  !canSubmit && styles.buttonDisabled,
                  pressed && canSubmit && styles.buttonPressed,
                ]}>
                {loading ? (
                  <ActivityIndicator color={Colors.text} />
                ) : (
                  <Text style={styles.buttonText}>Create account</Text>
                )}
              </Pressable>
            </GlassCard>

            <Text style={styles.footer}>
              Already have an account?{' '}
              <Link href="/" style={styles.footerLink}>
                Sign in
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
    textTransform: 'capitalize',
  },
  formCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  nameRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  halfField: {
    flex: 1,
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
