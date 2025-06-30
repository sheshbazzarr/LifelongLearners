import Fuse from 'fuse.js';
import { supabase } from '../database/supabase.js';

export const searchBooks = async (query, userPreferences = {}) => {
  try {
    const { data: books, error } = await supabase
      .from('books')
      .select('*');

    if (error) {
      console.error('Error fetching books:', error);
      return [];
    }

    if (!query || query.trim() === '') {
      return books.slice(0, 5);
    }

    const fuseOptions = {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'author', weight: 0.3 },
        { name: 'description', weight: 0.2 },
        { name: 'tags', weight: 0.1 }
      ],
      threshold: 0.6,
      includeScore: true
    };

    // Convert tags array to searchable string for Fuse
    const searchableBooks = books.map(book => ({
      ...book,
      tags: Array.isArray(book.tags) ? book.tags.join(' ') : ''
    }));

    const fuse = new Fuse(searchableBooks, fuseOptions);
    const results = fuse.search(query);

    // Apply user preferences
    let filteredResults = results.map(result => ({
      ...result.item,
      tags: Array.isArray(result.item.tags) ? result.item.tags : [],
      score: result.score
    }));

    // Filter by language preference
    if (userPreferences.language_preference && userPreferences.language_preference !== 'any') {
      filteredResults = filteredResults.filter(book => 
        book.language === userPreferences.language_preference
      );
    }

    // Filter by difficulty level
    if (userPreferences.difficulty_level) {
      filteredResults = filteredResults.filter(book => 
        book.difficulty_level === userPreferences.difficulty_level
      );
    }

    return filteredResults.slice(0, 3);
  } catch (error) {
    console.error('Book search error:', error);
    return [];
  }
};

export const searchChallenges = async (query, userPreferences = {}) => {
  try {
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('*')
      .in('status', ['active', 'upcoming']);

    if (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }

    if (!query || query.trim() === '') {
      return challenges.slice(0, 5);
    }

    const fuseOptions = {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'type', weight: 0.2 },
        { name: 'tags', weight: 0.1 }
      ],
      threshold: 0.6,
      includeScore: true
    };

    // Convert tags array to searchable string for Fuse
    const searchableChallenges = challenges.map(challenge => ({
      ...challenge,
      tags: Array.isArray(challenge.tags) ? challenge.tags.join(' ') : ''
    }));

    const fuse = new Fuse(searchableChallenges, fuseOptions);
    const results = fuse.search(query);

    // Apply user preferences
    let filteredResults = results.map(result => ({
      ...result.item,
      tags: Array.isArray(result.item.tags) ? result.item.tags : [],
      score: result.score
    }));

    // Filter by difficulty level
    if (userPreferences.difficulty_level) {
      filteredResults = filteredResults.filter(challenge => 
        challenge.difficulty_level === userPreferences.difficulty_level
      );
    }

    return filteredResults.slice(0, 3);
  } catch (error) {
    console.error('Challenge search error:', error);
    return [];
  }
};

export const getRecommendationsBasedOnHistory = async (userId) => {
  try {
    // Get user's interaction history
    const { data: interactions, error: interactionsError } = await supabase
      .from('user_interactions')
      .select('entity_type, entity_id, metadata')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (interactionsError) {
      console.error('Error fetching interactions:', interactionsError);
    }

    // Get user's AI conversation history for interests
    const { data: conversations, error: conversationsError } = await supabase
      .from('ai_conversations')
      .select('intent, recommendations_given')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError);
    }

    // Extract patterns and interests
    const interests = extractInterestsFromHistory(interactions || [], conversations || []);
    
    // Get recommendations based on interests
    const bookRecommendations = await getBooksByInterests(interests);
    const challengeRecommendations = await getChallengesByInterests(interests);

    return {
      books: bookRecommendations,
      challenges: challengeRecommendations,
      interests
    };
  } catch (error) {
    console.error('Recommendation error:', error);
    return { books: [], challenges: [], interests: [] };
  }
};

const extractInterestsFromHistory = (interactions, conversations) => {
  const interests = new Set();
  
  // Extract from interactions
  interactions.forEach(interaction => {
    try {
      const metadata = interaction.metadata || {};
      if (metadata.tags && Array.isArray(metadata.tags)) {
        metadata.tags.forEach(tag => interests.add(tag));
      }
    } catch (e) {
      // Ignore parsing errors
    }
  });

  // Extract from conversations
  conversations.forEach(conversation => {
    try {
      const recommendations = conversation.recommendations_given || [];
      if (Array.isArray(recommendations)) {
        recommendations.forEach(rec => {
          if (rec.tags && Array.isArray(rec.tags)) {
            rec.tags.forEach(tag => interests.add(tag));
          }
        });
      }
    } catch (e) {
      // Ignore parsing errors
    }
  });

  return Array.from(interests);
};

const getBooksByInterests = async (interests) => {
  if (interests.length === 0) return [];
  
  try {
    // Use Supabase's array contains operator to find books with matching tags
    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .overlaps('tags', interests)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching books by interests:', error);
      return [];
    }

    return books || [];
  } catch (error) {
    console.error('Error in getBooksByInterests:', error);
    return [];
  }
};

const getChallengesByInterests = async (interests) => {
  if (interests.length === 0) return [];
  
  try {
    // Use Supabase's array contains operator to find challenges with matching tags
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('*')
      .overlaps('tags', interests)
      .in('status', ['active', 'upcoming'])
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching challenges by interests:', error);
      return [];
    }

    return challenges || [];
  } catch (error) {
    console.error('Error in getChallengesByInterests:', error);
    return [];
  }
};