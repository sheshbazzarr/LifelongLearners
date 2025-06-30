/*
  # Add INSERT policy for users table

  1. Security Changes
    - Add policy to allow authenticated users to insert their own profile data
    - This enables the signup process to create user profiles after authentication

  The policy ensures users can only create a profile with their own auth.uid() as the id,
  preventing users from creating profiles for other users.
*/

-- Add INSERT policy for users to create their own profiles
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);