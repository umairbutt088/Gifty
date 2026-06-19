export type UserRole = 'vendor' | 'buyer' | 'admin';

export type LoginFormData = {
  email: string;
  password: string;
  role: UserRole;
};

export type SignupFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
};
