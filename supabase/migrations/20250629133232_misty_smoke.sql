/*
  # Complete Learning Platform Database Schema

  1. New Tables
    - `users` - User profiles with learner/creator roles
    - `books` - Curated book database
    - `challenges` - Learning challenges with role-based creation
    - `user_challenges` - Pivot table for challenge participation
    - `ai_conversations` - AI chat history
    - `user_interactions` - User activity tracking

  2. Security
    - Enable RLS on all tables
    - Role-based policies for creators vs learners
    - Proper data isolation and access control

  3. Sample Data
    - Real books and challenges for testing
    - Demo users with different roles
*/

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS user_interactions CASCADE;
DROP TABLE IF EXISTS ai_conversations CASCADE;
DROP TABLE IF EXISTS user_challenges CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with proper roles
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'learner' CHECK (role IN ('learner', 'creator')),
  preferences jsonb DEFAULT '{}',
  learning_interests jsonb DEFAULT '[]',
  language_preference text DEFAULT 'english',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create books table
CREATE TABLE books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  description text,
  tags jsonb DEFAULT '[]',
  language text DEFAULT 'english',
  format text DEFAULT 'pdf' CHECK (format IN ('pdf', 'audio', 'print', 'ebook')),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create challenges table
CREATE TABLE challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('reading', 'coding', 'speaking', 'custom')),
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date timestamptz,
  end_date timestamptz,
  visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  tags jsonb DEFAULT '[]',
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Create user_challenges pivot table
CREATE TABLE user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  progress jsonb DEFAULT '{}',
  UNIQUE(user_id, challenge_id)
);

-- Create ai_conversations table
CREATE TABLE ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  message text NOT NULL,
  intent text,
  ai_response text,
  recommendations_given jsonb DEFAULT '[]',
  context_used jsonb DEFAULT '{}',
  response_time_ms integer,
  satisfaction_rating integer CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- Create user_interactions table
CREATE TABLE user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  interaction_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Books policies
CREATE POLICY "Anyone can read books"
  ON books FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Creators can create books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'creator'
    )
  );

CREATE POLICY "Creators can update own books"
  ON books FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Challenges policies
CREATE POLICY "Anyone can read public challenges"
  ON challenges FOR SELECT
  TO authenticated
  USING (visibility = 'public');

CREATE POLICY "Users can read their own challenges"
  ON challenges FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Creators can create challenges"
  ON challenges FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'creator'
    )
  );

CREATE POLICY "Creators can update own challenges"
  ON challenges FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- User challenges policies
CREATE POLICY "Users can read own challenge participation"
  ON user_challenges FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can join challenges"
  ON user_challenges FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own challenge progress"
  ON user_challenges FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- AI conversations policies
CREATE POLICY "Users can read own conversations"
  ON ai_conversations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create conversations"
  ON ai_conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update own conversations"
  ON ai_conversations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- User interactions policies
CREATE POLICY "Users can read own interactions"
  ON user_interactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create interactions"
  ON user_interactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_books_tags ON books USING gin(tags);
CREATE INDEX idx_books_language ON books(language);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_type ON challenges(type);
CREATE INDEX idx_challenges_tags ON challenges USING gin(tags);
CREATE INDEX idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX idx_user_challenges_challenge_id ON user_challenges(challenge_id);
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at);
CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);

-- Insert sample data
INSERT INTO users (id, name, email, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', 'sarah@example.com', 'creator'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Michael Chen', 'michael@example.com', 'creator'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Emma Davis', 'emma@example.com', 'learner'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Alex Rodriguez', 'alex@example.com', 'learner');

INSERT INTO books (title, author, description, tags, language, format, created_by) VALUES
  ('Atomic Habits', 'James Clear', 'A proven framework for improving every day through tiny changes that compound over time.', '["habits", "productivity", "self-improvement"]', 'english', 'pdf', '550e8400-e29b-41d4-a716-446655440001'),
  ('The Power of Now', 'Eckhart Tolle', 'A guide to spiritual enlightenment through presence and mindful awareness.', '["mindfulness", "spirituality", "present moment"]', 'english', 'audio', '550e8400-e29b-41d4-a716-446655440002'),
  ('Clean Code', 'Robert C. Martin', 'A handbook of agile software craftsmanship with practical advice for writing clean code.', '["programming", "software development", "best practices"]', 'english', 'pdf', '550e8400-e29b-41d4-a716-446655440001'),
  ('Deep Work', 'Cal Newport', 'Rules for focused success in a distracted world.', '["productivity", "focus", "career"]', 'english', 'ebook', '550e8400-e29b-41d4-a716-446655440002'),
  ('Mindset', 'Carol Dweck', 'The new psychology of success and how we can learn to fulfill our potential.', '["psychology", "growth", "learning"]', 'english', 'pdf', '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO challenges (title, description, type, created_by, start_date, end_date, visibility, tags, status) VALUES
  ('21-Day Reading Challenge', 'Read for 30 minutes daily for 21 days. Choose any book that inspires growth and share weekly insights.', 'reading', '550e8400-e29b-41d4-a716-446655440001', '2024-12-23', '2025-01-12', 'public', '["personal growth", "habits", "consistency"]', 'active'),
  ('JavaScript Fundamentals Bootcamp', 'Master JavaScript basics through daily coding exercises. Perfect for beginners.', 'coding', '550e8400-e29b-41d4-a716-446655440002', '2024-12-30', '2025-02-28', 'public', '["programming", "web development", "beginner-friendly"]', 'upcoming'),
  ('Public Speaking Mastery', 'Practice speaking for 5 minutes daily, record yourself, and get feedback from peers.', 'speaking', '550e8400-e29b-41d4-a716-446655440001', '2025-01-01', '2025-01-31', 'public', '["communication", "confidence", "professional development"]', 'upcoming');

INSERT INTO user_challenges (user_id, challenge_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM challenges WHERE title = '21-Day Reading Challenge')),
  ('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM challenges WHERE title = '21-Day Reading Challenge')),
  ('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM challenges WHERE title = 'JavaScript Fundamentals Bootcamp'));