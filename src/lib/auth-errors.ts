const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Incorrect email or password.',
  email_not_confirmed: 'Please confirm your email before signing in.',
  user_already_registered: 'An account with this email already exists. Try signing in.',
  weak_password: 'Password is too weak. Use at least 6 characters.',
  over_request_rate_limit: 'Too many attempts. Please wait a moment and try again.',
};

export function getAuthErrorMessage(error: { message: string; code?: string } | null): string {
  if (!error) return 'Something went wrong. Please try again.';

  if (error.code && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code];
  }

  const normalized = error.message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return AUTH_ERROR_MESSAGES.invalid_credentials;
  }

  if (normalized.includes('email not confirmed')) {
    return AUTH_ERROR_MESSAGES.email_not_confirmed;
  }

  if (normalized.includes('user already registered')) {
    return AUTH_ERROR_MESSAGES.user_already_registered;
  }

  return error.message;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
