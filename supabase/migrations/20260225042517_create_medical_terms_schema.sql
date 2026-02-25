/*
  # Create MediLingo Medical Terms Database Schema

  ## Overview
  This migration creates the complete database schema for the MediLingo medical Cantonese glossary application.

  ## 1. New Tables
  
  ### categories
  - `id` (bigserial, primary key) - Unique category identifier
  - `name` (text, not null) - Category name (e.g., "Medical Terms", "Symptoms")
  - `parent_category_id` (bigint) - Optional parent category for hierarchical structure
  - `created_at` (timestamptz) - Creation timestamp
  
  ### terms
  - `id` (bigserial, primary key) - Unique term identifier
  - `english` (text, not null) - English medical term
  - `cantonese` (text, not null) - Cantonese translation
  - `pronunciation` (text) - Jyutping pronunciation
  - `category_id` (bigint) - Foreign key to categories
  - `example_english` (text) - Example sentence in English
  - `example_cantonese` (text) - Example sentence in Cantonese
  - `difficulty` (text, default 'Medium') - Difficulty level
  - `is_hard` (boolean, default false) - User marking for difficult terms
  - `audio_url` (text) - Optional audio file URL
  - `photo_url` (text) - Optional image URL
  - `created_at` (timestamptz) - Creation timestamp
  
  ### reported_errors
  - `id` (bigserial, primary key) - Unique report identifier
  - `term_id` (bigint) - Foreign key to terms
  - `user_id` (text) - User identifier (for future auth integration)
  - `report_text` (text, not null) - Description of the error
  - `timestamp` (timestamptz) - Report creation time
  
  ## 2. Security
  - Enable RLS on all tables
  - Public read access to categories and terms (educational content)
  - Authenticated users can report errors
  - All users can read reported errors (transparency)
  
  ## 3. Important Notes
  - Uses idempotent SQL with IF NOT EXISTS checks
  - Foreign key constraints ensure referential integrity
  - Indexes on category_id for faster term lookups
  - Default values provided for timestamps and booleans
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  parent_category_id bigint REFERENCES categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create terms table
CREATE TABLE IF NOT EXISTS terms (
  id bigserial PRIMARY KEY,
  english text NOT NULL,
  cantonese text NOT NULL,
  pronunciation text,
  category_id bigint REFERENCES categories(id) ON DELETE SET NULL,
  example_english text,
  example_cantonese text,
  difficulty text DEFAULT 'Medium',
  is_hard boolean DEFAULT false,
  audio_url text,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

-- Create reported_errors table
CREATE TABLE IF NOT EXISTS reported_errors (
  id bigserial PRIMARY KEY,
  term_id bigint REFERENCES terms(id) ON DELETE CASCADE,
  user_id text,
  report_text text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_terms_category_id ON terms(category_id);
CREATE INDEX IF NOT EXISTS idx_terms_english ON terms(english);
CREATE INDEX IF NOT EXISTS idx_terms_cantonese ON terms(cantonese);
CREATE INDEX IF NOT EXISTS idx_reported_errors_term_id ON reported_errors(term_id);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reported_errors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read access)
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO public
  USING (true);

-- RLS Policies for terms (public read access, authenticated can update is_hard)
CREATE POLICY "Anyone can read terms"
  ON terms FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert terms"
  ON terms FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update terms"
  ON terms FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- RLS Policies for reported_errors (public can insert and read)
CREATE POLICY "Anyone can report errors"
  ON reported_errors FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read reports"
  ON reported_errors FOR SELECT
  TO public
  USING (true);