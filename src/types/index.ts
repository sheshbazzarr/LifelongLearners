export interface User {
  id: string;
  name: string;
  email: string;
  role: 'participant' | 'giver' | 'admin';
  avatar?: string;
  joinedChallenges: string[];
  createdChallenges: string[];
  createdAt: Date;
  preferences?: Record<string, any>;
  learning_interests?: string[];
  language_preference?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'reading' | 'coding' | 'speaking' | 'custom';
  creatorId: string;
  creatorName: string;
  creatorRole: string;
  startDate: Date;
  endDate: Date;
  participants: string[];
  isPublic: boolean;
  tags: string[];
  status: 'upcoming' | 'active' | 'completed';
  difficulty_level?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  language: 'english' | 'amharic' | 'other';
  format: 'pdf' | 'audio' | 'print';
  tags: string[];
  curatedBy: string;
  description: string;
  coverUrl?: string;
  challengeId?: string;
  difficulty_level?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  recommendations?: {
    books?: Book[];
    challenges?: Challenge[];
    learningPlan?: string;
  };
  feedbackSubmitted?: boolean;
}

export interface AIConversation {
  id: string;
  user_id?: string;
  message: string;
  intent?: string;
  ai_response: string;
  recommendations_given: any[];
  satisfaction_rating?: number;
  created_at: string;
}