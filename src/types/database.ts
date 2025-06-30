export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'learner' | 'creator';
          preferences: Record<string, any>;
          learning_interests: string[];
          language_preference: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role?: 'learner' | 'creator';
          preferences?: Record<string, any>;
          learning_interests?: string[];
          language_preference?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'learner' | 'creator';
          preferences?: Record<string, any>;
          learning_interests?: string[];
          language_preference?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          description: string | null;
          tags: string[];
          language: string;
          format: 'pdf' | 'audio' | 'print' | 'ebook';
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          author: string;
          description?: string | null;
          tags?: string[];
          language?: string;
          format?: 'pdf' | 'audio' | 'print' | 'ebook';
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string;
          description?: string | null;
          tags?: string[];
          language?: string;
          format?: 'pdf' | 'audio' | 'print' | 'ebook';
          created_by?: string | null;
          created_at?: string;
        };
      };
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          type: 'reading' | 'coding' | 'speaking' | 'custom';
          created_by: string;
          start_date: string | null;
          end_date: string | null;
          visibility: 'public' | 'private';
          tags: string[];
          difficulty_level: 'beginner' | 'intermediate' | 'advanced';
          status: 'upcoming' | 'active' | 'completed';
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          type: 'reading' | 'coding' | 'speaking' | 'custom';
          created_by: string;
          start_date?: string | null;
          end_date?: string | null;
          visibility?: 'public' | 'private';
          tags?: string[];
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
          status?: 'upcoming' | 'active' | 'completed';
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          type?: 'reading' | 'coding' | 'speaking' | 'custom';
          created_by?: string;
          start_date?: string | null;
          end_date?: string | null;
          visibility?: 'public' | 'private';
          tags?: string[];
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
          status?: 'upcoming' | 'active' | 'completed';
          created_at?: string;
        };
      };
      user_challenges: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          joined_at: string;
          completed_at: string | null;
          progress: Record<string, any>;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_id: string;
          joined_at?: string;
          completed_at?: string | null;
          progress?: Record<string, any>;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_id?: string;
          joined_at?: string;
          completed_at?: string | null;
          progress?: Record<string, any>;
        };
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string | null;
          message: string;
          intent: string | null;
          ai_response: string | null;
          recommendations_given: any[];
          context_used: Record<string, any>;
          response_time_ms: number | null;
          satisfaction_rating: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          message: string;
          intent?: string | null;
          ai_response?: string | null;
          recommendations_given?: any[];
          context_used?: Record<string, any>;
          response_time_ms?: number | null;
          satisfaction_rating?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          message?: string;
          intent?: string | null;
          ai_response?: string | null;
          recommendations_given?: any[];
          context_used?: Record<string, any>;
          response_time_ms?: number | null;
          satisfaction_rating?: number | null;
          created_at?: string;
        };
      };
      user_interactions: {
        Row: {
          id: string;
          user_id: string | null;
          interaction_type: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          interaction_type: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          interaction_type?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
        };
      };
    };
  };
}