export type ProfileRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: 'vendor' | 'buyer' | 'admin';
  created_at: string;
  updated_at: string;
};
