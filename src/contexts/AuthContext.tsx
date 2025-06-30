import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, formatSupabaseError } from '../services/supabaseClient';
import type { Database } from '../types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: 'learner' | 'creator') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to fetch user profile
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Don't log PGRST116 errors as they indicate no user profile exists yet (expected scenario)
        if (error.code !== 'PGRST116') {
          console.error('Error fetching user profile:', error);
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Helper function to ensure user profile exists in users table
  const ensureUserProfile = async (user: User, role?: 'learner' | 'creator') => {
    try {
      // Check if user profile already exists
      const existingProfile = await fetchUserProfile(user.id);
      
      if (!existingProfile) {
        // Create new profile
        const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
        
        const newProfile: Database['public']['Tables']['users']['Insert'] = {
          id: user.id,
          name: userName,
          email: user.email || '',
          role: role || 'learner',
          preferences: {},
          learning_interests: [],
          language_preference: 'english'
        };

        const { data, error } = await supabase
          .from('users')
          .insert(newProfile)
          .select()
          .single();

        if (error) {
          console.error('Error creating user profile:', error);
          throw error;
        }

        setUserProfile(data);
        console.log('User profile created successfully');
      } else {
        setUserProfile(existingProfile);
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: 'learner' | 'creator') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await ensureUserProfile(data.user, role);
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(formatSupabaseError(error) || 'Failed to create account');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await ensureUserProfile(data.user);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(formatSupabaseError(error) || 'Failed to sign in');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setUserProfile(null);
      setSession(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(formatSupabaseError(error) || 'Failed to sign out');
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) {
      throw new Error('No user logged in');
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setUserProfile(data);
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(formatSupabaseError(error) || 'Failed to update profile');
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Fetch user profile if user is authenticated
          if (session?.user) {
            const profile = await fetchUserProfile(session.user.id);
            setUserProfile(profile);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch user profile when user signs in
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    userProfile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};