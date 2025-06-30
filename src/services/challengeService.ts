import { supabase } from './supabaseClient';
import type { Database } from '../types/database';

type Challenge = Database['public']['Tables']['challenges']['Row'];
type ChallengeInsert = Database['public']['Tables']['challenges']['Insert'];
type UserChallenge = Database['public']['Tables']['user_challenges']['Row'];

export const challengeService = {
  // Get all public challenges with optional filters
  async getChallenges(filters?: {
    type?: string;
    status?: string;
    difficulty?: string;
    search?: string;
  }) {
    try {
      let query = supabase
        .from('challenges')
        .select(`
          *,
          creator:created_by(name, role),
          participants:user_challenges(count)
        `)
        .eq('visibility', 'public');

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.difficulty && filters.difficulty !== 'all') {
        query = query.eq('difficulty_level', filters.difficulty);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  },

  // Get challenges created by a specific user
  async getUserCreatedChallenges(userId: string) {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          participants:user_challenges(count)
        `)
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user created challenges:', error);
      throw error;
    }
  },

  // Get challenges a user has joined
  async getUserJoinedChallenges(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .select(`
          *,
          challenge:challenges(
            *,
            creator:created_by(name, role)
          )
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user joined challenges:', error);
      throw error;
    }
  },

  // Create a new challenge (creators only)
  async createChallenge(challenge: ChallengeInsert) {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .insert(challenge)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  },

  // Join a challenge
  async joinChallenge(challengeId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          progress: {}
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error joining challenge:', error);
      throw error;
    }
  },

  // Check if user has joined a challenge
  async hasUserJoinedChallenge(challengeId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .select('id')
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking challenge membership:', error);
      return false;
    }
  },

  // Search challenges for AI recommendations
  async searchChallengesForAI(query: string, userInterests?: string[]) {
    try {
      let searchQuery = supabase
        .from('challenges')
        .select('*')
        .eq('visibility', 'public')
        .in('status', ['active', 'upcoming']);

      // Text search
      if (query) {
        searchQuery = searchQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }

      // Interest-based filtering
      if (userInterests && userInterests.length > 0) {
        searchQuery = searchQuery.overlaps('tags', userInterests);
      }

      const { data, error } = await searchQuery
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error searching challenges for AI:', error);
      return [];
    }
  }
};