import express from 'express';
import { searchBooks, searchChallenges, getRecommendationsBasedOnHistory } from '../services/searchService.js';
import { supabase } from '../database/supabase.js';

const router = express.Router();

// Search books endpoint
router.get('/books', async (req, res) => {
  try {
    const { q: query, language, difficulty, format, limit = 10 } = req.query;
    
    let books;
    if (query) {
      books = await searchBooks(query, { language, difficulty_level: difficulty });
    } else {
      // Get all books with filters
      let supabaseQuery = supabase
        .from('books')
        .select('*');
      
      if (language && language !== 'all') {
        supabaseQuery = supabaseQuery.eq('language', language);
      }
      
      if (difficulty && difficulty !== 'all') {
        supabaseQuery = supabaseQuery.eq('difficulty_level', difficulty);
      }
      
      if (format && format !== 'all') {
        supabaseQuery = supabaseQuery.eq('format', format);
      }
      
      supabaseQuery = supabaseQuery
        .order('created_at', { ascending: false })
        .limit(parseInt(limit));
      
      const { data, error } = await supabaseQuery;
      
      if (error) {
        throw error;
      }
      
      books = data || [];
    }

    res.json({ books, total: books.length });
  } catch (error) {
    console.error('Book search error:', error);
    res.status(500).json({ error: 'Failed to search books' });
  }
});

// Search challenges endpoint
router.get('/challenges', async (req, res) => {
  try {
    const { q: query, type, difficulty, status, limit = 10 } = req.query;
    
    let challenges;
    if (query) {
      challenges = await searchChallenges(query, { difficulty_level: difficulty });
    } else {
      // Get all challenges with filters
      let supabaseQuery = supabase
        .from('challenges')
        .select('*');
      
      if (type && type !== 'all') {
        supabaseQuery = supabaseQuery.eq('type', type);
      }
      
      if (difficulty && difficulty !== 'all') {
        supabaseQuery = supabaseQuery.eq('difficulty_level', difficulty);
      }
      
      if (status && status !== 'all') {
        supabaseQuery = supabaseQuery.eq('status', status);
      }
      
      supabaseQuery = supabaseQuery
        .order('created_at', { ascending: false })
        .limit(parseInt(limit));
      
      const { data, error } = await supabaseQuery;
      
      if (error) {
        throw error;
      }
      
      challenges = data || [];
    }

    res.json({ challenges, total: challenges.length });
  } catch (error) {
    console.error('Challenge search error:', error);
    res.status(500).json({ error: 'Failed to search challenges' });
  }
});

// Get recommendations for user
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const recommendations = await getRecommendationsBasedOnHistory(userId);
    res.json(recommendations);
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

export default router;