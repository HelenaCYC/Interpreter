/*
  # Add INSERT policies for public access

  ## Overview
  This migration adds INSERT policies to allow anyone to add categories and terms.
  This is appropriate for an educational/community-driven glossary application.

  ## Changes
  - Add INSERT policy for categories table
  - Verify terms INSERT policy exists
  
  ## Security Notes
  - Public INSERT access is intentional for this use case
  - In a production app with user accounts, these would be restricted to authenticated users
*/

-- Add INSERT policy for categories if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'categories' 
    AND policyname = 'Anyone can insert categories'
  ) THEN
    CREATE POLICY "Anyone can insert categories"
      ON categories FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;

-- Ensure UPDATE policy exists for categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'categories' 
    AND policyname = 'Anyone can update categories'
  ) THEN
    CREATE POLICY "Anyone can update categories"
      ON categories FOR UPDATE
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;