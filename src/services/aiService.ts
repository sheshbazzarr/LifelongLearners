import { supabase } from './supabaseClient';
import { bookService } from './bookService';
import { challengeService } from './challengeService';
import type { Database } from '../types/database';

type AIConversation = Database['public']['Tables']['ai_conversations']['Row'];

export interface AIRequest {
  user_id?: string;
  message: string;
  context?: Record<string, any>;
}

export interface AIResponse {
  response: string;
  intent?: string;
  recommendations?: {
    books?: any[];
    challenges?: any[];
  };
}

// Enhanced AI response generation with personalization
const generatePersonalizedResponse = async (message: string, context: any) => {
  const { userProfile, books, challenges, intent, conversationHistory } = context;
  
  // Analyze user's learning patterns
  const userInterests = userProfile?.learning_interests || [];
  const userLanguage = userProfile?.language_preference || 'english';
  const userName = userProfile?.name || 'friend';
  
  // Get user's recent activity for personalization
  const recentActivity = await getUserRecentActivity(userProfile?.id);
  
  let response = '';
  
  switch (intent) {
    case 'book_request':
      response = await generateBookRecommendationResponse(message, books, userProfile, recentActivity);
      break;
    case 'challenge_request':
      response = await generateChallengeRecommendationResponse(message, challenges, userProfile, recentActivity);
      break;
    case 'motivation_request':
      response = generateMotivationalResponse(userName, userProfile, recentActivity);
      break;
    case 'plan_request':
      response = await generateLearningPlanResponse(message, userProfile, books, challenges);
      break;
    case 'progress_inquiry':
      response = await generateProgressResponse(userProfile, recentActivity);
      break;
    default:
      response = generatePersonalizedGreeting(message, userName, userProfile, recentActivity);
      break;
  }
  
  return response;
};

const classifyIntent = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  // Enhanced intent classification
  const intentPatterns = {
    book_request: ['book', 'read', 'reading', 'recommend', 'suggestion', 'literature', 'author', 'novel'],
    challenge_request: ['challenge', 'practice', 'exercise', 'learn', 'skill', 'improve', 'training', 'bootcamp'],
    plan_request: ['plan', 'roadmap', 'path', 'journey', 'guide', 'how to', 'steps', 'strategy', 'schedule'],
    motivation_request: ['motivation', 'inspire', 'encourage', 'quote', 'wisdom', 'advice', 'support', 'stuck'],
    progress_inquiry: ['progress', 'how am i doing', 'my stats', 'achievements', 'completed', 'status'],
    greeting: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'how are you']
  };
  
  for (const [intent, keywords] of Object.entries(intentPatterns)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return intent;
    }
  }
  
  return 'general';
};

const getUserRecentActivity = async (userId: string) => {
  if (!userId) return null;
  
  try {
    // Get user's recent interactions
    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get user's joined challenges
    const { data: userChallenges } = await supabase
      .from('user_challenges')
      .select(`
        *,
        challenge:challenges(title, type, status)
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })
      .limit(5);

    // Get conversation history for context
    const { data: conversations } = await supabase
      .from('ai_conversations')
      .select('message, intent, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      interactions: interactions || [],
      joinedChallenges: userChallenges || [],
      recentConversations: conversations || []
    };
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return null;
  }
};

const generateBookRecommendationResponse = async (message: string, books: any[], userProfile: any, recentActivity: any) => {
  const userName = userProfile?.name?.split(' ')[0] || 'friend';
  const userInterests = userProfile?.learning_interests || [];
  
  if (books.length === 0) {
    return `Hi ${userName}! 🐢 I'd love to help you find some great books! Based on your interests in ${userInterests.join(', ')}, let me search our curated library for perfect matches. Could you tell me more about what specific topics you're curious about right now?`;
  }

  let response = `Hello ${userName}! 🐢 Based on your learning journey and interests, I've found some excellent books that align perfectly with your goals:\n\n`;
  
  books.forEach((book, index) => {
    response += `📚 **${book.title}** by ${book.author}\n`;
    response += `${book.description}\n`;
    
    // Add personalized reasoning
    const matchingInterests = userInterests.filter(interest => 
      book.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
    );
    
    if (matchingInterests.length > 0) {
      response += `✨ *Perfect for your interest in ${matchingInterests.join(' and ')}*\n`;
    }
    
    response += `📖 Format: ${book.format} | 🌍 Language: ${book.language}\n\n`;
  });

  // Add personalized encouragement based on recent activity
  if (recentActivity?.joinedChallenges?.length > 0) {
    response += `I noticed you're actively participating in challenges - these books will complement your current learning path beautifully! 🌱`;
  } else {
    response += `These books are perfect starting points for your learning journey. Remember, as we tortoises say: "Slow and steady wins the race!" 🏆`;
  }
  
  return response;
};

const generateChallengeRecommendationResponse = async (message: string, challenges: any[], userProfile: any, recentActivity: any) => {
  const userName = userProfile?.name?.split(' ')[0] || 'friend';
  const userRole = userProfile?.role || 'learner';
  
  if (challenges.length === 0) {
    let response = `Hi ${userName}! 🐢 I'd love to help you find engaging challenges! `;
    
    if (userRole === 'creator') {
      response += `As a creator, you might want to consider creating a new challenge that matches your expertise. `;
    }
    
    response += `What type of skills are you looking to develop? I can help you find or suggest challenges in reading, coding, speaking, or custom learning paths.`;
    return response;
  }

  let response = `Wonderful, ${userName}! 🎯 I've found some exciting challenges that match your learning style:\n\n`;
  
  challenges.forEach((challenge, index) => {
    response += `🎯 **${challenge.title}**\n`;
    response += `${challenge.description}\n`;
    response += `📅 ${challenge.status === 'active' ? 'Currently Active' : 'Starting Soon'} | 🎚️ ${challenge.difficulty_level}\n`;
    
    // Add personalized insights
    if (challenge.type === 'reading' && userProfile?.learning_interests?.includes('reading')) {
      response += `✨ *Perfect match for your love of reading!*\n`;
    }
    
    response += '\n';
  });

  // Personalized encouragement based on user's history
  const joinedChallengesCount = recentActivity?.joinedChallenges?.length || 0;
  
  if (joinedChallengesCount === 0) {
    response += `This would be a perfect first challenge for you! Remember, every expert was once a beginner. 🌱`;
  } else if (joinedChallengesCount < 3) {
    response += `Building on your previous challenge experience - you're developing great learning momentum! 🚀`;
  } else {
    response += `Wow! You're becoming quite the challenge champion! Your dedication to continuous learning is inspiring. 🏆`;
  }
  
  return response;
};

const generateMotivationalResponse = (userName: string, userProfile: any, recentActivity: any) => {
  const motivationalQuotes = [
    "The journey of a thousand miles begins with a single step.",
    "Learning never exhausts the mind.",
    "The beautiful thing about learning is that no one can take it away from you.",
    "Every expert was once a beginner.",
    "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice."
  ];
  
  const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  const joinedChallenges = recentActivity?.joinedChallenges?.length || 0;
  
  let response = `Hello ${userName}! 🐢 As your wise learning companion, I want to remind you that `;
  
  if (joinedChallenges > 0) {
    response += `you're already on an amazing learning journey! You've joined ${joinedChallenges} challenge${joinedChallenges > 1 ? 's' : ''}, which shows your commitment to growth.\n\n`;
  } else {
    response += `every learning journey starts with curiosity - and you're here, which means you're ready to grow!\n\n`;
  }
  
  response += `💭 *"${quote}"*\n\n`;
  response += `Remember, as a tortoise, I believe in the power of consistent, steady progress. You don't need to rush - just keep moving forward, one step at a time. 🌱\n\n`;
  response += `What would you like to learn or improve today? I'm here to guide you! 🎯`;
  
  return response;
};

const generateLearningPlanResponse = async (message: string, userProfile: any, books: any[], challenges: any[]) => {
  const userName = userProfile?.name?.split(' ')[0] || 'friend';
  const userInterests = userProfile?.learning_interests || [];
  
  let response = `Excellent question, ${userName}! 🐢 Let me create a personalized learning plan for you.\n\n`;
  
  // Analyze the request to understand what they want to learn
  const planKeywords = extractLearningGoals(message);
  
  response += `🎯 **Your Personalized Learning Path**\n\n`;
  
  // Phase 1: Foundation
  response += `**Phase 1: Foundation Building (Weeks 1-2)**\n`;
  if (books.length > 0) {
    const foundationBook = books.find(book => 
      book.difficulty_level === 'beginner' || 
      book.tags.some(tag => planKeywords.includes(tag.toLowerCase()))
    );
    if (foundationBook) {
      response += `📚 Start with "${foundationBook.title}" - perfect for building your foundation\n`;
    }
  }
  response += `⏰ Dedicate 30 minutes daily to reading and note-taking\n\n`;
  
  // Phase 2: Practice
  response += `**Phase 2: Active Practice (Weeks 3-4)**\n`;
  if (challenges.length > 0) {
    const practiceChallenge = challenges.find(challenge => 
      challenge.difficulty_level === 'beginner' ||
      planKeywords.some(keyword => challenge.title.toLowerCase().includes(keyword))
    );
    if (practiceChallenge) {
      response += `🎯 Join "${practiceChallenge.title}" to apply what you've learned\n`;
    }
  }
  response += `💪 Practice daily with small, consistent actions\n\n`;
  
  // Phase 3: Mastery
  response += `**Phase 3: Skill Mastery (Weeks 5-8)**\n`;
  response += `🚀 Take on more advanced challenges\n`;
  response += `👥 Share your knowledge with the community\n`;
  response += `📈 Track your progress and celebrate milestones\n\n`;
  
  response += `Remember, ${userName}, learning is like being a tortoise - slow, steady, and persistent wins the race! 🏆\n\n`;
  response += `Would you like me to help you get started with any specific part of this plan?`;
  
  return response;
};

const generateProgressResponse = async (userProfile: any, recentActivity: any) => {
  const userName = userProfile?.name?.split(' ')[0] || 'friend';
  const joinedChallenges = recentActivity?.joinedChallenges || [];
  const interactions = recentActivity?.interactions || [];
  
  let response = `Great question, ${userName}! 🐢 Let me give you a personalized progress update:\n\n`;
  
  response += `📊 **Your Learning Journey So Far**\n\n`;
  
  // Challenge progress
  if (joinedChallenges.length > 0) {
    response += `🎯 **Challenges**: You've joined ${joinedChallenges.length} challenge${joinedChallenges.length > 1 ? 's' : ''}!\n`;
    joinedChallenges.forEach(uc => {
      const daysSinceJoined = Math.floor((Date.now() - new Date(uc.joined_at).getTime()) / (1000 * 60 * 60 * 24));
      response += `   • ${uc.challenge.title} (${daysSinceJoined} days ago)\n`;
    });
    response += '\n';
  } else {
    response += `🎯 **Challenges**: Ready to join your first challenge? I can help you find the perfect one!\n\n`;
  }
  
  // Activity level
  const recentInteractionCount = interactions.filter(i => 
    Date.now() - new Date(i.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
  ).length;
  
  response += `📈 **Activity Level**: `;
  if (recentInteractionCount > 10) {
    response += `Highly Active! You're really engaged with your learning. 🔥\n`;
  } else if (recentInteractionCount > 5) {
    response += `Good momentum! You're building consistent learning habits. 📈\n`;
  } else if (recentInteractionCount > 0) {
    response += `Getting started! Every step counts in your learning journey. 🌱\n`;
  } else {
    response += `Let's get you more engaged! I can help you find interesting content. 💪\n`;
  }
  
  response += '\n';
  
  // Encouragement and next steps
  response += `🌟 **What's Next?**\n`;
  if (joinedChallenges.length === 0) {
    response += `Consider joining a beginner-friendly challenge to kickstart your learning!\n`;
  } else {
    response += `You're doing great! Consider exploring new topics or taking on a slightly more challenging goal.\n`;
  }
  
  response += `\nRemember, progress isn't always about speed - it's about consistency and growth. Keep up the wonderful work! 🐢💚`;
  
  return response;
};

const generatePersonalizedGreeting = (message: string, userName: string, userProfile: any, recentActivity: any) => {
  const timeOfDay = new Date().getHours();
  let greeting = '';
  
  if (timeOfDay < 12) greeting = 'Good morning';
  else if (timeOfDay < 17) greeting = 'Good afternoon';
  else greeting = 'Good evening';
  
  let response = `${greeting}, ${userName}! 🐢 `;
  
  // Personalize based on recent activity
  const recentChallenges = recentActivity?.joinedChallenges?.length || 0;
  
  if (recentChallenges > 0) {
    response += `I see you're actively working on your learning challenges - that's the spirit! `;
  }
  
  response += `I'm your wise learning companion, here to help you discover amazing books, find perfect challenges, and create personalized learning plans.\n\n`;
  
  response += `✨ I can help you with:\n`;
  response += `📚 Finding books that match your interests\n`;
  response += `🎯 Discovering challenges to grow your skills\n`;
  response += `🗺️ Creating personalized learning roadmaps\n`;
  response += `💪 Staying motivated on your journey\n`;
  response += `📊 Tracking your learning progress\n\n`;
  
  response += `What would you like to explore today? Remember, life is teaching - never stop learning! 🌱`;
  
  return response;
};

const extractLearningGoals = (message: string): string[] => {
  const lowerMessage = message.toLowerCase();
  const goals = [];
  
  const goalKeywords = {
    'programming': ['programming', 'coding', 'development', 'javascript', 'python', 'web'],
    'productivity': ['productivity', 'efficiency', 'time management', 'organization'],
    'communication': ['communication', 'speaking', 'presentation', 'writing'],
    'leadership': ['leadership', 'management', 'team', 'leading'],
    'mindfulness': ['mindfulness', 'meditation', 'wellness', 'mental health'],
    'reading': ['reading', 'books', 'literature'],
    'learning': ['learning', 'study', 'education', 'knowledge']
  };
  
  for (const [goal, keywords] of Object.entries(goalKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      goals.push(goal);
    }
  }
  
  return goals;
};

export const aiService = {
  // Main AI chat function with enhanced personalization
  async askAI(request: AIRequest): Promise<string> {
    const startTime = Date.now();
    
    try {
      // Get user profile for personalization
      let userProfile = null;
      if (request.user_id) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', request.user_id)
          .single();
        userProfile = data;
      }

      // Get conversation history for context
      const conversationHistory = request.user_id ? 
        await this.getConversationHistory(request.user_id, 5) : [];

      // Classify intent with enhanced detection
      const intent = classifyIntent(request.message);
      const searchQuery = extractKeywords(request.message).join(' ');
      
      let books: any[] = [];
      let challenges: any[] = [];
      
      // Search for relevant content based on intent and user interests
      if (intent === 'book_request' || intent === 'general' || intent === 'plan_request') {
        books = await bookService.searchBooksForAI(
          searchQuery, 
          userProfile?.learning_interests || []
        );
      }
      
      if (intent === 'challenge_request' || intent === 'general' || intent === 'plan_request') {
        challenges = await challengeService.searchChallengesForAI(
          searchQuery,
          userProfile?.learning_interests || []
        );
      }

      // Generate personalized AI response
      const context = {
        userProfile,
        books,
        challenges,
        intent,
        conversationHistory
      };

      const aiResponse = await generatePersonalizedResponse(request.message, context);
      const responseTime = Date.now() - startTime;

      // Log conversation with enhanced metadata
      if (request.user_id) {
        await supabase
          .from('ai_conversations')
          .insert({
            user_id: request.user_id,
            message: request.message,
            intent,
            ai_response: aiResponse,
            recommendations_given: [...books, ...challenges],
            context_used: {
              ...context,
              response_time_ms: responseTime,
              personalization_level: userProfile ? 'high' : 'low'
            },
            response_time_ms: responseTime
          });

        // Log user interaction
        await supabase
          .from('user_interactions')
          .insert({
            user_id: request.user_id,
            interaction_type: 'ai_chat',
            entity_type: 'conversation',
            metadata: {
              intent,
              message_length: request.message.length,
              response_length: aiResponse.length,
              recommendations_count: books.length + challenges.length
            }
          });
      }

      return aiResponse;
    } catch (error) {
      console.error('AI service error:', error);
      
      // Personalized error message
      const userName = request.user_id ? 'friend' : 'there';
      return `I apologize, ${userName}! 🐢 I'm having a bit of trouble processing your request right now. As a wise tortoise, I know that sometimes we need to slow down and try again. Please give me a moment and ask again - I'm here to help you on your learning journey! 💚`;
    }
  },

  // Get conversation history with enhanced context
  async getConversationHistory(userId: string, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  },

  // Enhanced feedback system
  async submitFeedback(conversationId: string, rating: number, feedback?: string) {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .update({ 
          satisfaction_rating: rating,
          ...(feedback && { feedback })
        })
        .eq('id', conversationId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },

  // Get personalized learning insights
  async getLearningInsights(userId: string) {
    try {
      // Get user's learning patterns
      const { data: conversations } = await supabase
        .from('ai_conversations')
        .select('intent, created_at, satisfaction_rating')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: challenges } = await supabase
        .from('user_challenges')
        .select('joined_at, completed_at, challenge:challenges(type, difficulty_level)')
        .eq('user_id', userId);

      // Analyze patterns
      const insights = {
        most_discussed_topics: this.analyzeMostDiscussedTopics(conversations || []),
        learning_frequency: this.calculateLearningFrequency(conversations || []),
        preferred_challenge_types: this.analyzePreferredChallengeTypes(challenges || []),
        satisfaction_trend: this.calculateSatisfactionTrend(conversations || [])
      };

      return insights;
    } catch (error) {
      console.error('Error getting learning insights:', error);
      return null;
    }
  },

  // Helper methods for insights
  analyzeMostDiscussedTopics(conversations: any[]) {
    const topicCount: Record<string, number> = {};
    conversations.forEach(conv => {
      if (conv.intent) {
        topicCount[conv.intent] = (topicCount[conv.intent] || 0) + 1;
      }
    });
    return Object.entries(topicCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([topic, count]) => ({ topic, count }));
  },

  calculateLearningFrequency(conversations: any[]) {
    if (conversations.length < 2) return 'new_user';
    
    const dates = conversations.map(c => new Date(c.created_at));
    const daysBetween = (dates[0].getTime() - dates[dates.length - 1].getTime()) / (1000 * 60 * 60 * 24);
    const frequency = conversations.length / Math.max(daysBetween, 1);
    
    if (frequency > 1) return 'very_active';
    if (frequency > 0.5) return 'active';
    if (frequency > 0.2) return 'moderate';
    return 'occasional';
  },

  analyzePreferredChallengeTypes(challenges: any[]) {
    const typeCount: Record<string, number> = {};
    challenges.forEach(uc => {
      if (uc.challenge?.type) {
        typeCount[uc.challenge.type] = (typeCount[uc.challenge.type] || 0) + 1;
      }
    });
    return Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([type, count]) => ({ type, count }));
  },

  calculateSatisfactionTrend(conversations: any[]) {
    const ratingsWithDates = conversations
      .filter(c => c.satisfaction_rating)
      .map(c => ({ rating: c.satisfaction_rating, date: new Date(c.created_at) }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (ratingsWithDates.length < 2) return 'insufficient_data';

    const recent = ratingsWithDates.slice(-3);
    const older = ratingsWithDates.slice(0, -3);

    if (older.length === 0) return 'new_feedback';

    const recentAvg = recent.reduce((sum, r) => sum + r.rating, 0) / recent.length;
    const olderAvg = older.reduce((sum, r) => sum + r.rating, 0) / older.length;

    if (recentAvg > olderAvg + 0.5) return 'improving';
    if (recentAvg < olderAvg - 0.5) return 'declining';
    return 'stable';
  }
};

// Helper function to extract keywords from message
const extractKeywords = (message: string): string[] => {
  const words = message.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  const stopWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'way', 'what', 'when', 'with', 'want', 'will', 'would', 'like', 'just', 'know', 'think', 'good', 'make', 'help'];
  
  return words.filter(word => !stopWords.includes(word));
};