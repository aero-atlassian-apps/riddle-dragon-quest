-- =====================================================
-- DATABASE SCHEMA FIX
-- =====================================================
-- This script fixes the schema mismatches between database and code
-- Run this on your Supabase database to fix the column issues
-- =====================================================

-- 1. Fix sessions table - rename hints_enabled to hint_enabled (ONLY if column exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'hints_enabled') THEN
        ALTER TABLE sessions RENAME COLUMN hints_enabled TO hint_enabled;
    END IF;
END $$;

-- 2. Add missing max_participants column to universes table
ALTER TABLE universes ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 100;

-- 3. Add missing current_participants column to universes table (if not exists)
ALTER TABLE universes ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0;

-- 4. Add missing start_date and end_date columns to universes table (if not exists)
ALTER TABLE universes ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE universes ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- 5. Add missing theme_id column to universes table (if not exists)
ALTER TABLE universes ADD COLUMN IF NOT EXISTS theme_id UUID REFERENCES universe_themes(id);

-- 6. Add missing settings column to universes table (if not exists)
ALTER TABLE universes ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- 7. Add missing tags column to universes table (if not exists)
ALTER TABLE universes ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 8. Add missing door_number column to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS door_number INTEGER;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS hint TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 1;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS style TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS prize TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Add unique constraint for door_number per session (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_door_per_session' 
        AND table_name = 'questions'
    ) THEN
        ALTER TABLE questions ADD CONSTRAINT unique_door_per_session UNIQUE (session_id, door_number);
    END IF;
END $$;

-- 9. Add missing sigil and motto columns to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS sigil TEXT DEFAULT '🏰';
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS motto TEXT DEFAULT '';

-- 10. Fix session default status - change from 'active' to 'en attente'
ALTER TABLE sessions ALTER COLUMN status SET DEFAULT 'en attente';

-- =====================================================
-- 11. STORAGE BUCKETS SETUP
-- =====================================================

-- Create storage buckets for question images and universe posters
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('question_images', 'question_images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('universe-posters', 'universe-posters', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for question_images bucket using CREATE POLICY
DROP POLICY IF EXISTS "question_images_select" ON storage.objects;
CREATE POLICY "question_images_select" ON storage.objects
FOR SELECT USING (bucket_id = 'question_images');

DROP POLICY IF EXISTS "question_images_insert" ON storage.objects;
CREATE POLICY "question_images_insert" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'question_images' AND 
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "question_images_update" ON storage.objects;
CREATE POLICY "question_images_update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'question_images' AND 
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "question_images_delete" ON storage.objects;
CREATE POLICY "question_images_delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'question_images' AND 
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Set up storage policies for universe-posters bucket using CREATE POLICY
DROP POLICY IF EXISTS "universe_posters_select" ON storage.objects;
CREATE POLICY "universe_posters_select" ON storage.objects
FOR SELECT USING (bucket_id = 'universe-posters');

DROP POLICY IF EXISTS "universe_posters_insert" ON storage.objects;
CREATE POLICY "universe_posters_insert" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'universe-posters' AND 
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "universe_posters_update" ON storage.objects;
CREATE POLICY "universe_posters_update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'universe-posters' AND 
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "universe_posters_delete" ON storage.objects;
CREATE POLICY "universe_posters_delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'universe-posters' AND 
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'sessions' AND column_name = 'hint_enabled';

SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'universes' AND column_name IN ('max_participants', 'current_participants', 'start_date', 'end_date', 'theme_id', 'settings', 'tags');

SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'questions' AND column_name IN ('door_number', 'hint', 'points', 'style', 'prize');

SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'rooms' AND column_name IN ('sigil', 'motto');

SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'sessions' AND column_name = 'status';