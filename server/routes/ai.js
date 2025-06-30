import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { classifyIntent, extractKeywords } from '../services/intentClassifier.js';
import { searchBooks, searchChallenges, getRecommendationsBasedOnHistory } from '../services/searchService.js';
import { generateAIResponse, generateLearningPlan } from '../services/openaiService.js';
import { supabase, handleSupabaseError } from '../database/supabase.js';

const router = express.Router();

// Main AI chat endpoint
router.post('/ask', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { user_id, message, context = {} } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Step 1: Classify intent
    const intentResult = await classifyIntent(message);
    console.log(`Intent classified: ${intentResult.intent} (confidence: ${intentResult.confidence})`);

    // Step 2: Get user preferences
    let userPreferences = {};
    if (user_id) {
      const { data: user, error } = await supabase
        .from('users')
        .select('preferences, learning_interests, language_preference')
        .eq('id', user_id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        handleSupabaseError(error);
      }

      if (user) {
        userPreferences = {
          ...user.preferences,
          learning_interests: user.learning_interests,
          language_preference: user.language_preference
        };
      }
    }

    // Step 3: Search internal database
    const keywords = extractKeywords(message);
    const searchQuery = keywords.join(' ');
    
    let searchResults = { books: [], challenges: [] };
    
    if (intentResult.intent === 'book_request' || intentResult.intent === 'general') {
      searchResults.books = await searchBooks(searchQuery, userPreferences);
    }
    
    if (intentResult.intent === 'challenge_request' || intentResult.intent === 'general') {
      searchResults.challenges = await searchChallenges(searchQuery, userPreferences);
    }

    // Step 4: Get personalized recommendations if no good search results
    if (searchResults.books.length === 0 && searchResults.challenges.length === 0 && user_id) {
      const recommendations = await getRecommendationsBasedOnHistory(user_id);
      searchResults = {
        books: recommendations.books,
        challenges: recommendations.challenges
      };
    }

    // Step 5: Prepare context for AI
    const aiContext = {
      intent: intentResult.intent,
      userPreferences,
      searchResults,
      userInterests: userPreferences.learning_interests || []
    };

    // Step 6: Generate AI response
    const aiStream = await generateAIResponse(message, aiContext);

    // Set up streaming response
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    let fullResponse = '';
    
    for await (const chunk of aiStream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        res.write(content);
      }
    }

    res.end();

    // Step 7: Log interaction
    const responseTime = Date.now() - startTime;
    const conversationId = uuidv4();
    
    const { error: insertError } = await supabase
      .from('ai_conversations')
      .insert({
        id: conversationId,
        user_id: user_id || null,
        message,
        intent: intentResult.intent,
        ai_response: fullResponse,
        recommendations_given: [...searchResults.books, ...searchResults.challenges],
        context_used: aiContext,
        response_time_ms: responseTime
      });

    if (insertError) {
      console.error('Error logging conversation:', insertError);
    }

    // Step 8: Update user interests (optional)
    if (user_id && keywords.length > 0) {
      await updateUserInterests(user_id, keywords);
    }

  } catch (error) {
    console.error('AI ask endpoint error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to process request',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
});

// Intent classification endpoint
router.post('/classify-intent', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await classifyIntent(message);
    res.json(result);
  } catch (error) {
    console.error('Intent classification error:', error);
    res.status(500).json({ error: 'Failed to classify intent' });
  }
});

// Generate learning plan endpoint
router.post('/generate-plan', async (req, res) => {
  try {
    const { user_id, goals, level, time_commitment } = req.body;

    if (!goals) {
      return res.status(400).json({ error: 'Goals are required' });
    }

    const plan = await generateLearningPlan(goals, level || 'beginner', time_commitment || '30 minutes daily');
    
    // Log the plan generation
    if (user_id) {
      const conversationId = uuidv4();
      const { error } = await supabase
        .from('ai_conversations')
        .insert({
          id: conversationId,
          user_id,
          message: `Generate learning plan: ${goals}`,
          intent: 'plan_request',
          ai_response: plan,
          response_time_ms: Date.now()
        });

      if (error) {
        console.error('Error logging plan generation:', error);
      }
    }

    res.json({ plan });
  } catch (error) {
    console.error('Learning plan generation error:', error);
    res.status(500).json({ error: 'Failed to generate learning plan' });
  }
});

// Log interaction feedback
router.post('/feedback', async (req, res) => {
  try {
    const { conversation_id, rating, feedback } = req.body;

    const { error } = await supabase
      .from('ai_conversations')
      .update({ 
        satisfaction_rating: rating,
        feedback: feedback 
      })
      .eq('id', conversation_id);

    handleSupabaseError(error);
    res.json({ success: true });
  } catch (error) {
    console.error('Feedback logging error:', error);
    res.status(500).json({ error: 'Failed to log feedback' });
  }
});

// Helper function to update user interests
const updateUserInterests = async (userId, keywords) => {
  try {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('learning_interests')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user interests:', fetchError);
      return;
    }

    const currentInterests = user?.learning_interests || [];
    const newInterests = [...new Set([...currentInterests, ...keywords])].slice(0, 20); // Limit to 20 interests

    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        learning_interests: newInterests,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user interests:', updateError);
    }
  } catch (error) {
    console.error('Error updating user interests:', error);
  }
};

export default router;