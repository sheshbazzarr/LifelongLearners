/*
  # Seed Initial Data for LifelongLearners Platform

  1. Sample Data
    - Insert sample books with proper UUIDs
    - Insert sample challenges with proper UUIDs
    - Insert sample users with proper UUIDs
    - Create relationships between books and challenges
    - Add sample AI conversations and user interactions

  2. Data Structure
    - Books: Curated learning resources in multiple languages
    - Challenges: Learning challenges created by community
    - Users: Platform users with different roles
    - AI Conversations: Chat history with the Tortoise AI
    - User Interactions: Track user engagement
*/

-- Insert sample users first (needed for foreign key references)
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
);

-- Insert sample challenges
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
);

-- Insert sample books
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
  NULL
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
  NULL
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
  NULL
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
  NULL
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
);

-- Insert sample AI conversations for demonstration
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
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  'የአማርኛ መጽሐፍ ፈልጋለሁ',
  'book_request',
  'በጣም ጥሩ! "የአምሳያ ቋንቋ" በበላይ ገብረ የተጻፈ መጽሐፍ አለ። ይህ መጽሐፍ የአማርኛ ቋንቋ ችሎታዎን ለማሻሻል በጣም ጠቃሚ ነው።',
  '[{"type": "book", "id": "770e8400-e29b-41d4-a716-446655440004", "title": "የአምሳያ ቋንቋ"}]'::jsonb,
  1450
);

-- Insert sample user interactions
INSERT INTO user_interactions (user_id, interaction_type, entity_type, entity_id, metadata) VALUES
(
  '550e8400-e29b-41d4-a716-446655440005'::uuid,
  'view',
  'book',
  '770e8400-e29b-41d4-a716-446655440001'::uuid,
  '{"source": "ai_recommendation", "timestamp": "2024-12-26T10:30:00Z"}'::jsonb
),
(
  '550e8400-e29b-41d4-a716-446655440005'::uuid,
  'join',
  'challenge',
  '660e8400-e29b-41d4-a716-446655440001'::uuid,
  '{"join_date": "2024-12-26T11:00:00Z", "source": "browse"}'::jsonb
),
(
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  'view',
  'book',
  '770e8400-e29b-41d4-a716-446655440004'::uuid,
  '{"source": "language_filter", "timestamp": "2024-12-26T09:15:00Z"}'::jsonb
),
(
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  'create',
  'challenge',
  '660e8400-e29b-41d4-a716-446655440003'::uuid,
  '{"creation_date": "2024-12-25T14:20:00Z", "initial_participants": 0}'::jsonb
),
(
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'view',
  'book',
  '770e8400-e29b-41d4-a716-446655440006'::uuid,
  '{"source": "challenge_resource", "timestamp": "2024-12-26T16:45:00Z"}'::jsonb
);