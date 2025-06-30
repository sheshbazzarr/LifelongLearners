/*
  # Complete LifelongLearners Platform Database Setup

  1. New Tables
    - `users` - User profiles with roles and preferences
    - `books` - Curated book library with metadata
    - `challenges` - Learning challenges with tracking
    - `ai_conversations` - AI chat history and recommendations
    - `user_interactions` - User activity tracking

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for data access
    - Ensure users can only access their own data

  3. Performance
    - Add indexes for common queries
    - GIN indexes for JSONB columns

  4. Sample Data
    - Demo users, challenges, and books for testing
*/

-- =====================================================
-- 1. Create all tables with proper constraints
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'participant' CHECK (role IN ('participant', 'giver', 'admin')),
  preferences jsonb DEFAULT '{}',
  learning_interests jsonb DEFAULT '[]',
  language_preference text DEFAULT 'english',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  language text DEFAULT 'english',
  format text DEFAULT 'pdf' CHECK (format IN ('pdf', 'audio', 'print')),
  tags jsonb DEFAULT '[]',
  description text,
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  curated_by text,
  challenge_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('reading', 'coding', 'speaking', 'custom')),
  creator_id uuid,
  creator_name text,
  creator_role text,
  start_date timestamptz,
  end_date timestamptz,
  tags jsonb DEFAULT '[]',
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_public boolean DEFAULT true,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- AI Conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  message text NOT NULL,
  intent text,
  ai_response text,
  recommendations_given jsonb DEFAULT '[]',
  context_used jsonb DEFAULT '{}',
  response_time_ms integer,
  satisfaction_rating integer CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- User Interactions table
CREATE TABLE IF NOT EXISTS user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  interaction_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. Drop existing policies and create new ones
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Anyone can read books" ON books;
DROP POLICY IF EXISTS "Authenticated users can create books" ON books;
DROP POLICY IF EXISTS "Anyone can read public challenges" ON challenges;
DROP POLICY IF EXISTS "Users can read their own challenges" ON challenges;
DROP POLICY IF EXISTS "Authenticated users can create challenges" ON challenges;
DROP POLICY IF EXISTS "Users can update their own challenges" ON challenges;
DROP POLICY IF EXISTS "Users can read own conversations" ON ai_conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON ai_conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON ai_conversations;
DROP POLICY IF EXISTS "Users can read own interactions" ON user_interactions;
DROP POLICY IF EXISTS "Users can create interactions" ON user_interactions;

-- Users table policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Books table policies (public read access)
CREATE POLICY "Anyone can read books"
  ON books
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create books"
  ON books
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Challenges table policies
CREATE POLICY "Anyone can read public challenges"
  ON challenges
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "Users can read their own challenges"
  ON challenges
  FOR SELECT
  TO authenticated
  USING (creator_id::text = auth.uid()::text);

CREATE POLICY "Authenticated users can create challenges"
  ON challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own challenges"
  ON challenges
  FOR UPDATE
  TO authenticated
  USING (creator_id::text = auth.uid()::text);

-- AI Conversations table policies
CREATE POLICY "Users can read own conversations"
  ON ai_conversations
  FOR SELECT
  TO authenticated
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create conversations"
  ON ai_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id::text = auth.uid()::text OR user_id IS NULL);

CREATE POLICY "Users can update own conversations"
  ON ai_conversations
  FOR UPDATE
  TO authenticated
  USING (user_id::text = auth.uid()::text);

-- User Interactions table policies
CREATE POLICY "Users can read own interactions"
  ON user_interactions
  FOR SELECT
  TO authenticated
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create interactions"
  ON user_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id::text = auth.uid()::text);

-- =====================================================
-- 4. Add Foreign Key Constraints (with safety checks)
-- =====================================================

DO $$
BEGIN
  -- Add foreign key constraints only if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'books_challenge_id_fkey'
  ) THEN
    ALTER TABLE books ADD CONSTRAINT books_challenge_id_fkey 
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'challenges_creator_id_fkey'
  ) THEN
    ALTER TABLE challenges ADD CONSTRAINT challenges_creator_id_fkey 
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ai_conversations_user_id_fkey'
  ) THEN
    ALTER TABLE ai_conversations ADD CONSTRAINT ai_conversations_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_interactions_user_id_fkey'
  ) THEN
    ALTER TABLE user_interactions ADD CONSTRAINT user_interactions_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =====================================================
-- 5. Create Performance Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_books_language ON books(language);
CREATE INDEX IF NOT EXISTS idx_books_difficulty ON books(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_books_tags ON books USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_type ON challenges(type);
CREATE INDEX IF NOT EXISTS idx_challenges_tags ON challenges USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);

-- =====================================================
-- 6. Insert Sample Data
-- =====================================================

-- Sample users
INSERT INTO users (id, name, email, role, preferences, learning_interests, language_preference) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'Sarah Johnson',
  'sarah@example.com',
  'giver',
  '{"notification_frequency": "daily", "preferred_time": "morning"}'::jsonb,
  '["productivity", "leadership", "personal development"]'::jsonb,
  'english'
),
(
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'Alex Rodriguez',
  'alex@example.com',
  'giver',
  '{"notification_frequency": "weekly", "preferred_time": "evening"}'::jsonb,
  '["programming", "web development", "technology"]'::jsonb,
  'english'
),
(
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  'Dr. Michael Chen',
  'michael@university.edu',
  'giver',
  '{"notification_frequency": "daily", "preferred_time": "afternoon"}'::jsonb,
  '["communication", "education", "psychology"]'::jsonb,
  'english'
),
(
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  'Alem Bekele',
  'alem@example.com',
  'participant',
  '{"notification_frequency": "weekly", "preferred_time": "morning"}'::jsonb,
  '["language learning", "culture", "literature"]'::jsonb,
  'amharic'
),
(
  '550e8400-e29b-41d4-a716-446655440005'::uuid,
  'Demo User',
  'demo@lifelonglearners.com',
  'participant',
  '{"notification_frequency": "daily", "preferred_time": "evening"}'::jsonb,
  '["reading", "self-improvement", "technology"]'::jsonb,
  'english'
)
ON CONFLICT (id) DO NOTHING;

-- Sample challenges
INSERT INTO challenges (id, title, description, type, creator_id, creator_name, creator_role, start_date, end_date, tags, difficulty_level, status) VALUES
(
  '660e8400-e29b-41d4-a716-446655440001'::uuid,
  'Daily Reading: 21-Day Book Challenge',
  'Read for 30 minutes daily for 21 days. Choose any book that inspires growth and share weekly insights with the community.',
  'reading',
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'Sarah Johnson',
  'Learning Coach',
  '2024-12-23'::timestamptz,
  '2025-01-12'::timestamptz,
  '["personal growth", "habits", "consistency"]'::jsonb,
  'beginner',
  'active'
),
(
  '660e8400-e29b-41d4-a716-446655440002'::uuid,
  'JavaScript Fundamentals Bootcamp',
  'Master JavaScript basics through daily coding exercises. Perfect for beginners or those looking to strengthen their foundation.',
  'coding',
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'Alex Rodriguez',
  'Senior Developer',
  '2024-12-30'::timestamptz,
  '2025-02-28'::timestamptz,
  '["programming", "web development", "beginner-friendly"]'::jsonb,
  'beginner',
  'upcoming'
),
(
  '660e8400-e29b-41d4-a716-446655440003'::uuid,
  'Public Speaking Mastery',
  'Practice speaking for 5 minutes daily, record yourself, and get feedback from peers. Build confidence through consistent practice.',
  'speaking',
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  'Dr. Michael Chen',
  'Communication Professor',
  '2025-01-01'::timestamptz,
  '2025-01-31'::timestamptz,
  '["communication", "confidence", "professional development"]'::jsonb,
  'intermediate',
  'upcoming'
),
(
  '660e8400-e29b-41d4-a716-446655440004'::uuid,
  'Mindful Morning Routine',
  'Establish a 15-minute morning mindfulness practice. Includes meditation, journaling, and intention setting.',
  'custom',
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'Sarah Johnson',
  'Wellness Coach',
  '2024-12-01'::timestamptz,
  '2024-12-21'::timestamptz,
  '["mindfulness", "wellness", "morning routine"]'::jsonb,
  'beginner',
  'completed'
)
ON CONFLICT (id) DO NOTHING;

-- Sample books
INSERT INTO books (id, title, author, language, format, tags, description, difficulty_level, curated_by, challenge_id) VALUES
(
  '770e8400-e29b-41d4-a716-446655440001'::uuid,
  'Atomic Habits',
  'James Clear',
  'english',
  'pdf',
  '["habits", "productivity", "self-improvement"]'::jsonb,
  'A proven framework for improving every day through tiny changes that compound over time.',
  'beginner',
  'Sarah Johnson',
  '660e8400-e29b-41d4-a716-446655440001'::uuid
),
(
  '770e8400-e29b-41d4-a716-446655440002'::uuid,
  'The Power of Now',
  'Eckhart Tolle',
  'english',
  'audio',
  '["mindfulness", "spirituality", "present moment"]'::jsonb,
  'A guide to spiritual enlightenment through presence and mindful awareness.',
  'intermediate',
  'Dr. Michael Chen',
  null
),
(
  '770e8400-e29b-41d4-a716-446655440003'::uuid,
  'Clean Code',
  'Robert C. Martin',
  'english',
  'pdf',
  '["programming", "software development", "best practices"]'::jsonb,
  'A handbook of agile software craftsmanship with practical advice for writing clean code.',
  'intermediate',
  'Tech Community',
  null
),
(
  '770e8400-e29b-41d4-a716-446655440004'::uuid,
  'የአምሳያ ቋንቋ',
  'በላይ ገብረ',
  'amharic',
  'print',
  '["language", "amharic", "communication"]'::jsonb,
  'የአማርኛ ቋንቋ ችሎታ ለማሻሻል የሚረዳ መምሪያ መጽሐፍ።',
  'beginner',
  'Ethiopian Literature Society',
  null
),
(
  '770e8400-e29b-41d4-a716-446655440005'::uuid,
  'Deep Work',
  'Cal Newport',
  'english',
  'pdf',
  '["productivity", "focus", "professional development"]'::jsonb,
  'Rules for focused success in a distracted world. Learn to work deeply and produce better results.',
  'intermediate',
  'Productivity Experts',
  null
),
(
  '770e8400-e29b-41d4-a716-446655440006'::uuid,
  'Eloquent JavaScript',
  'Marijn Haverbeke',
  'english',
  'pdf',
  '["programming", "javascript", "web development"]'::jsonb,
  'A modern introduction to programming and JavaScript fundamentals with practical examples.',
  'beginner',
  'Web Development Community',
  '660e8400-e29b-41d4-a716-446655440002'::uuid
)
ON CONFLICT (id) DO NOTHING;

-- Sample AI conversations for demonstration
INSERT INTO ai_conversations (id, user_id, message, intent, ai_response, recommendations_given, response_time_ms) VALUES
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440005'::uuid,
  'I want to improve my productivity',
  'book_request',
  'I recommend starting with "Atomic Habits" by James Clear. It provides a proven framework for building productive habits through small, consistent changes.',
  '[{"type": "book", "id": "770e8400-e29b-41d4-a716-446655440001", "title": "Atomic Habits"}]'::jsonb,
  1250
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440005'::uuid,
  'Find me a coding challenge for beginners',
  'challenge_request',
  'Perfect! I found the "JavaScript Fundamentals Bootcamp" challenge starting December 30th. It''s designed specifically for beginners and includes daily coding exercises.',
  '[{"type": "challenge", "id": "660e8400-e29b-41d4-a716-446655440002", "title": "JavaScript Fundamentals Bootcamp"}]'::jsonb,
  980
)
ON CONFLICT (id) DO NOTHING;

-- Sample user interactions
INSERT INTO user_interactions (user_id, interaction_type, entity_type, entity_id, metadata) VALUES
('550e8400-e29b-41d4-a716-446655440005'::uuid, 'view', 'book', '770e8400-e29b-41d4-a716-446655440001'::uuid, '{"source": "ai_recommendation", "timestamp": "2024-12-26T10:30:00Z"}'::jsonb),
('550e8400-e29b-41d4-a716-446655440005'::uuid, 'join', 'challenge', '660e8400-e29b-41d4-a716-446655440001'::uuid, '{"join_date": "2024-12-26T11:00:00Z", "source": "browse"}'::jsonb),
('550e8400-e29b-41d4-a716-446655440004'::uuid, 'view', 'book', '770e8400-e29b-41d4-a716-446655440004'::uuid, '{"source": "language_filter", "timestamp": "2024-12-26T09:15:00Z"}'::jsonb)
ON CONFLICT (id) DO NOTHING;