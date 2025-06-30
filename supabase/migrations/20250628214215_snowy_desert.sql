/*
  # Initial Schema for LifelongLearners Platform

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `role` (text, default 'participant')
      - `preferences` (jsonb)
      - `learning_interests` (jsonb)
      - `language_preference` (text, default 'english')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `books`
      - `id` (uuid, primary key)
      - `title` (text)
      - `author` (text)
      - `language` (text, default 'english')
      - `format` (text, default 'pdf')
      - `tags` (jsonb)
      - `description` (text)
      - `difficulty_level` (text, default 'beginner')
      - `curated_by` (text)
      - `challenge_id` (uuid, foreign key)
      - `created_at` (timestamp)

    - `challenges`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `type` (text)
      - `creator_id` (uuid, foreign key)
      - `creator_name` (text)
      - `creator_role` (text)
      - `start_date` (timestamp)
      - `end_date` (timestamp)
      - `tags` (jsonb)
      - `difficulty_level` (text, default 'beginner')
      - `is_public` (boolean, default true)
      - `status` (text, default 'upcoming')
      - `created_at` (timestamp)

    - `ai_conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `message` (text)
      - `intent` (text)
      - `ai_response` (text)
      - `recommendations_given` (jsonb)
      - `context_used` (jsonb)
      - `response_time_ms` (integer)
      - `satisfaction_rating` (integer)
      - `created_at` (timestamp)

    - `user_interactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `interaction_type` (text)
      - `entity_type` (text)
      - `entity_id` (uuid)
      - `metadata` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own data
    - Add policies for public read access to books and challenges
*/

-- Create users table
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

-- Create books table
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

-- Create challenges table
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

-- Create ai_conversations table
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

-- Create user_interactions table
CREATE TABLE IF NOT EXISTS user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
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
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
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

-- Create policies for books table (public read access)
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

-- Create policies for challenges table
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

-- Create policies for ai_conversations table
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

-- Create policies for user_interactions table
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

-- Add foreign key constraints
ALTER TABLE books ADD CONSTRAINT books_challenge_id_fkey 
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE SET NULL;

ALTER TABLE challenges ADD CONSTRAINT challenges_creator_id_fkey 
  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE ai_conversations ADD CONSTRAINT ai_conversations_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE user_interactions ADD CONSTRAINT user_interactions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_language ON books(language);
CREATE INDEX IF NOT EXISTS idx_books_difficulty ON books(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_books_tags ON books USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_type ON challenges(type);
CREATE INDEX IF NOT EXISTS idx_challenges_tags ON challenges USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);