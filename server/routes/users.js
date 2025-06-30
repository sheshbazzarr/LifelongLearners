import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase, handleSupabaseError } from '../database/supabase.js';

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      handleSupabaseError(error);
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user preferences
router.post('/:id/preferences', async (req, res) => {
  try {
    const { id } = req.params;
    const { preferences, learning_interests, language_preference } = req.body;

    const { error } = await supabase
      .from('users')
      .update({
        preferences: preferences || {},
        learning_interests: learning_interests || [],
        language_preference: language_preference || 'english',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    handleSupabaseError(error);
    res.json({ success: true });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Log user interaction
router.post('/:id/interactions', async (req, res) => {
  try {
    const { id: userId } = req.params;
    const { interaction_type, entity_type, entity_id, metadata = {} } = req.body;

    const interactionId = uuidv4();
    const { error } = await supabase
      .from('user_interactions')
      .insert({
        id: interactionId,
        user_id: userId,
        interaction_type,
        entity_type,
        entity_id,
        metadata
      });

    handleSupabaseError(error);
    res.json({ success: true, interaction_id: interactionId });
  } catch (error) {
    console.error('Log interaction error:', error);
    res.status(500).json({ error: 'Failed to log interaction' });
  }
});

// Get user's conversation history
router.get('/:id/conversations', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20 } = req.query;

    const { data: conversations, error } = await supabase
      .from('ai_conversations')
      .select('id, message, intent, ai_response, recommendations_given, satisfaction_rating, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    handleSupabaseError(error);
    res.json(conversations || []);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

export default router;