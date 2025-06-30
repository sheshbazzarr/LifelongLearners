import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Helper function to format Supabase errors for user display
export const formatSupabaseError = (error: any) => {
  if (!error) return null;
  
  if (error?.message?.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  
  if (error?.message?.includes('Email not confirmed')) {
    return 'Please check your email and click the confirmation link before signing in.';
  }
  
  if (error?.message?.includes('User already registered')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  
  return error?.message || 'An unexpected error occurred. Please try again.';
};

export default supabase;