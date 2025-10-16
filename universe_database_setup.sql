-- =====================================================
-- RIDDLE DRAGON QUEST - UNIVERSE RELEASE DATABASE SETUP
-- =====================================================
-- This script creates the complete database structure for the Universe release
-- Run this on your new Supabase database: https://jmpmucdoqkcpetdfnxrj.supabase.co
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ENUMS
-- =====================================================

-- Drop existing types if they exist
DROP TYPE IF EXISTS app_role CASCADE;
DROP TYPE IF EXISTS challenge_type CASCADE;
DROP TYPE IF EXISTS universe_status CASCADE;

-- App role enum for user permissions
CREATE TYPE app_role AS ENUM ('admin', 'user');

-- Challenge type enum for distinguishing standalone vs universe challenges
CREATE TYPE challenge_type AS ENUM ('standalone', 'universe');

-- Universe status enum
CREATE TYPE universe_status AS ENUM ('draft', 'active', 'archived');

-- =====================================================
-- 2. UNIVERSE TABLES (Create first for foreign key references)
-- =====================================================

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS universe_theme_assets CASCADE;
DROP TABLE IF EXISTS universe_themes CASCADE;
DROP TABLE IF EXISTS universe_theme_presets CASCADE;
DROP TABLE IF EXISTS universe_leaderboard CASCADE;
DROP TABLE IF EXISTS universe_questions CASCADE;
DROP TABLE IF EXISTS universe_room_templates CASCADE;
DROP TABLE IF EXISTS universe_troupes CASCADE;
DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS universes CASCADE;

-- Universes table - Main Universe entity
CREATE TABLE universes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    poster_image_url TEXT,
    status universe_status DEFAULT 'draft',
    created_by UUID NOT NULL,
    total_rooms INTEGER DEFAULT 0,
    max_participants INTEGER DEFAULT 100,
    current_participants INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles table (needed for RLS policies)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    role app_role DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- 3. CORE TABLES (Structure with Universe support)
-- =====================================================

-- Challenges table (enhanced with Universe support)
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'en attente',
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    challenge_type challenge_type DEFAULT 'standalone',
    universe_id UUID REFERENCES universes(id) ON DELETE CASCADE,
    challenge_order INTEGER, -- Optional explicit ordering within a universe
    context TEXT, -- Additional context for the challenge
    hint_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    answer TEXT NOT NULL,
    image TEXT,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    door_number INTEGER,
    hint TEXT,
    points INTEGER DEFAULT 1,
    style TEXT,
    prize TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_door_per_challenge UNIQUE (challenge_id, door_number)
);

-- Universe troupes - Defines the competing teams/troupes in a universe
CREATE TABLE universe_troupes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sigil TEXT DEFAULT '🏰',
    motto TEXT DEFAULT '',
    initial_tokens INTEGER DEFAULT 3,
    troupe_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(universe_id, troupe_order),
    UNIQUE(universe_id, name)
);

-- Rooms table (enhanced with Universe support and troupe association)
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    universe_id UUID REFERENCES universes(id) ON DELETE CASCADE,
    troupe_id UUID REFERENCES universe_troupes(id) ON DELETE SET NULL,
    current_door INTEGER DEFAULT 1,
    initial_tokens INTEGER DEFAULT 3,
    tokens_left INTEGER DEFAULT 3,
    score INTEGER DEFAULT 0,
    is_template BOOLEAN DEFAULT false,
    template_order INTEGER,
    sigil TEXT DEFAULT '🏰',
    motto TEXT DEFAULT '',
    troupe_start_time TIMESTAMPTZ,
    troupe_end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scores table (enhanced with Universe support)
CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    universe_id UUID REFERENCES universes(id) ON DELETE CASCADE,
    room_name TEXT NOT NULL,
    total_score INTEGER DEFAULT 0,
    completion_time INTERVAL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. ADDITIONAL UNIVERSE TABLES
-- =====================================================

-- Universe room templates - Defines the rooms that belong to a universe
CREATE TABLE universe_room_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    initial_tokens INTEGER DEFAULT 3,
    template_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(universe_id, template_order)
);

-- Universe questions - Questions specific to universe room templates
CREATE TABLE universe_questions (
    id SERIAL PRIMARY KEY,
    universe_room_template_id UUID NOT NULL REFERENCES universe_room_templates(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    answer TEXT NOT NULL,
    image TEXT,
    question_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(universe_room_template_id, question_order)
);

-- Universe leaderboard - Aggregated scores across all challenges in a universe
CREATE TABLE universe_leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
    room_name TEXT NOT NULL,
    best_challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    total_score INTEGER DEFAULT 0,
    completion_time INTERVAL,
    challenges_completed INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(universe_id, room_name)
);

-- Universe themes for customizing look and feel
CREATE TABLE universe_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    primary_color TEXT DEFAULT '#8B5CF6',
    secondary_color TEXT DEFAULT '#7E69AB',
    accent_color TEXT DEFAULT '#D6BCFA',
    background_color TEXT DEFAULT '#1A1F2C',
    surface_color TEXT DEFAULT '#2D3748',
    text_primary TEXT DEFAULT '#FFFFFF',
    text_secondary TEXT DEFAULT '#A0ADB8',
    border_color TEXT DEFAULT '#4A5568',
    success_color TEXT DEFAULT '#00FF00',
    error_color TEXT DEFAULT '#DC2626',
    warning_color TEXT DEFAULT '#F59E0B',
    font_family_primary TEXT DEFAULT 'Inter, system-ui, sans-serif',
    font_family_secondary TEXT DEFAULT 'JetBrains Mono, monospace',
    font_family_display TEXT DEFAULT 'Cinzel, serif',
    border_radius TEXT DEFAULT '0.5rem',
    shadow_style TEXT DEFAULT '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    animation_speed TEXT DEFAULT '300ms',
    background_image_url TEXT,
    background_pattern TEXT DEFAULT 'none',
    background_overlay TEXT DEFAULT 'rgba(0, 0, 0, 0.5)',
    button_style JSONB DEFAULT '{"variant": "default", "size": "md"}',
    card_style JSONB DEFAULT '{"variant": "default", "padding": "md"}',
    door_style JSONB DEFAULT '{"animation": "glow", "colors": ["emerald", "blue", "purple"]}',
    background_music_url TEXT,
    sound_effects JSONB DEFAULT '{}',
    custom_css TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Theme assets for storing images, icons, and other media
CREATE TABLE universe_theme_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    theme_id UUID NOT NULL REFERENCES universe_themes(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL,
    asset_name TEXT NOT NULL,
    asset_url TEXT NOT NULL,
    asset_category TEXT,
    display_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Theme presets for common theme configurations
CREATE TABLE universe_theme_presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT DEFAULT 'general',
    primary_color TEXT DEFAULT '#8B5CF6',
    secondary_color TEXT DEFAULT '#7E69AB',
    accent_color TEXT DEFAULT '#D6BCFA',
    background_color TEXT DEFAULT '#1A1F2C',
    surface_color TEXT DEFAULT '#2D3748',
    text_primary TEXT DEFAULT '#FFFFFF',
    text_secondary TEXT DEFAULT '#A0ADB8',
    border_color TEXT DEFAULT '#4A5568',
    success_color TEXT DEFAULT '#00FF00',
    error_color TEXT DEFAULT '#DC2626',
    warning_color TEXT DEFAULT '#F59E0B',
    font_family_primary TEXT DEFAULT 'Inter, system-ui, sans-serif',
    font_family_secondary TEXT DEFAULT 'JetBrains Mono, monospace',
    font_family_display TEXT DEFAULT 'Cinzel, serif',
    border_radius TEXT DEFAULT '0.5rem',
    shadow_style TEXT DEFAULT '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    animation_speed TEXT DEFAULT '300ms',
    background_image_url TEXT,
    background_pattern TEXT DEFAULT 'none',
    background_overlay TEXT DEFAULT 'rgba(0, 0, 0, 0.5)',
    button_style JSONB DEFAULT '{"variant": "default", "size": "md"}',
    card_style JSONB DEFAULT '{"variant": "default", "padding": "md"}',
    door_style JSONB DEFAULT '{"animation": "glow", "colors": ["emerald", "blue", "purple"]}',
    background_music_url TEXT,
    sound_effects JSONB DEFAULT '{}',
    custom_css TEXT,
    is_system_preset BOOLEAN DEFAULT false,
    preview_image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. INDEXES FOR PERFORMANCE
-- =====================================================

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_challenges_universe_id;
DROP INDEX IF EXISTS idx_challenges_status;
DROP INDEX IF EXISTS idx_challenges_type;
DROP INDEX IF EXISTS idx_challenges_universe_order;
DROP INDEX IF EXISTS idx_rooms_challenge_id;
DROP INDEX IF EXISTS idx_rooms_universe_id;
DROP INDEX IF EXISTS idx_rooms_troupe_id;
DROP INDEX IF EXISTS idx_rooms_is_template;
DROP INDEX IF EXISTS idx_scores_challenge_id;
DROP INDEX IF EXISTS idx_scores_universe_id;
DROP INDEX IF EXISTS idx_scores_room_id;
DROP INDEX IF EXISTS idx_scores_total_score;
DROP INDEX IF EXISTS idx_questions_challenge_id;
DROP INDEX IF EXISTS idx_universe_questions_template_id;
DROP INDEX IF EXISTS idx_universes_status;
DROP INDEX IF EXISTS idx_universes_created_by;
DROP INDEX IF EXISTS idx_universe_room_templates_universe_id;
DROP INDEX IF EXISTS idx_universe_troupes_universe_id;
DROP INDEX IF EXISTS idx_universe_leaderboard_universe_id;
DROP INDEX IF EXISTS idx_universe_leaderboard_score;
DROP INDEX IF EXISTS idx_universe_themes_universe_id;
DROP INDEX IF EXISTS idx_universe_themes_active;
DROP INDEX IF EXISTS idx_universe_themes_unique_active;
DROP INDEX IF EXISTS idx_universe_theme_assets_theme_id;
DROP INDEX IF EXISTS idx_universe_theme_presets_category;

-- Challenges indexes
CREATE INDEX idx_challenges_universe_id ON challenges(universe_id);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_type ON challenges(challenge_type);
CREATE INDEX IF NOT EXISTS idx_challenges_universe_order ON challenges(universe_id, challenge_order);

-- Rooms indexes
CREATE INDEX idx_rooms_challenge_id ON rooms(challenge_id);
CREATE INDEX idx_rooms_universe_id ON rooms(universe_id);
CREATE INDEX idx_rooms_troupe_id ON rooms(troupe_id);
CREATE INDEX idx_rooms_is_template ON rooms(is_template);

-- Scores indexes
CREATE INDEX idx_scores_challenge_id ON scores(challenge_id);
CREATE INDEX idx_scores_universe_id ON scores(universe_id);
CREATE INDEX idx_scores_room_id ON scores(room_id);
CREATE INDEX idx_scores_total_score ON scores(total_score DESC);

-- Questions indexes
CREATE INDEX idx_questions_challenge_id ON questions(challenge_id);
CREATE INDEX idx_universe_questions_template_id ON universe_questions(universe_room_template_id);

-- Universe indexes
CREATE INDEX idx_universes_status ON universes(status);
CREATE INDEX idx_universes_created_by ON universes(created_by);
CREATE INDEX idx_universe_room_templates_universe_id ON universe_room_templates(universe_id);
CREATE INDEX idx_universe_troupes_universe_id ON universe_troupes(universe_id);
CREATE INDEX idx_universe_leaderboard_universe_id ON universe_leaderboard(universe_id);
CREATE INDEX idx_universe_leaderboard_score ON universe_leaderboard(total_score DESC);
CREATE INDEX idx_universe_themes_universe_id ON universe_themes(universe_id);
CREATE INDEX idx_universe_themes_active ON universe_themes(universe_id, is_active);
CREATE UNIQUE INDEX idx_universe_themes_unique_active ON universe_themes(universe_id) WHERE is_active = true;
CREATE INDEX idx_universe_theme_assets_theme_id ON universe_theme_assets(theme_id);
CREATE INDEX idx_universe_theme_presets_category ON universe_theme_presets(category);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE universes ENABLE ROW LEVEL SECURITY;
ALTER TABLE universe_room_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE universe_troupes ENABLE ROW LEVEL SECURITY;
ALTER TABLE universe_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE universe_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE universe_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE universe_theme_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE universe_theme_presets ENABLE ROW LEVEL SECURITY;

-- Challenges policies
CREATE POLICY "Challenges are viewable by everyone" ON challenges FOR SELECT USING (true);
CREATE POLICY "Challenges are insertable by admins" ON challenges FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Challenges are updatable by admins" ON challenges FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Challenges are deletable by admins" ON challenges FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Questions policies
CREATE POLICY "Questions are viewable by everyone" ON questions FOR SELECT USING (true);
CREATE POLICY "Questions are insertable by admins" ON questions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Questions are updatable by admins" ON questions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Questions are deletable by admins" ON questions FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Rooms policies
CREATE POLICY "Rooms are viewable by everyone" ON rooms FOR SELECT USING (true);
CREATE POLICY "Rooms are insertable by everyone" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Rooms are updatable by everyone" ON rooms FOR UPDATE USING (true);
CREATE POLICY "Rooms are deletable by admins" ON rooms FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Scores policies
CREATE POLICY "Scores are viewable by everyone" ON scores FOR SELECT USING (true);
CREATE POLICY "Scores are insertable by everyone" ON scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Scores are updatable by everyone" ON scores FOR UPDATE USING (true);
CREATE POLICY "Scores are deletable by admins" ON scores FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- User roles policies
CREATE POLICY "User roles are viewable by everyone" ON user_roles FOR SELECT USING (true);
CREATE POLICY "User roles are insertable by authenticated users" ON user_roles FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
);
CREATE POLICY "User roles are updatable by admins" ON user_roles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Universes policies
CREATE POLICY "Universes are viewable by everyone" ON universes FOR SELECT USING (true);
CREATE POLICY "Universes are insertable by admins" ON universes FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Universes are updatable by admins" ON universes FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Universes are deletable by admins" ON universes FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Universe room templates policies
CREATE POLICY "Universe room templates are viewable by everyone" ON universe_room_templates FOR SELECT USING (true);
CREATE POLICY "Universe room templates are insertable by admins" ON universe_room_templates FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Universe room templates are updatable by admins" ON universe_room_templates FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Universe room templates are deletable by admins" ON universe_room_templates FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Universe troupes policies
CREATE POLICY "Universe troupes are viewable by everyone" ON universe_troupes FOR SELECT USING (true);
CREATE POLICY "Universe troupes are insertable by admins" ON universe_troupes FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Universe troupes are updatable by admins" ON universe_troupes FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Universe troupes are deletable by admins" ON universe_troupes FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Universe questions policies
CREATE POLICY "Universe questions are viewable by everyone" ON universe_questions FOR SELECT USING (true);
CREATE POLICY "Universe questions are insertable by admins" ON universe_questions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Universe questions are updatable by admins" ON universe_questions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Universe questions are deletable by admins" ON universe_questions FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Universe leaderboard policies
CREATE POLICY "Universe leaderboard is viewable by everyone" ON universe_leaderboard FOR SELECT USING (true);
CREATE POLICY "Universe leaderboard is insertable by admins" ON universe_leaderboard FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Universe leaderboard is updatable by admins" ON universe_leaderboard FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Universe leaderboard is deletable by admins" ON universe_leaderboard FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Universe themes policies
CREATE POLICY "Universe themes are viewable by everyone" ON universe_themes FOR SELECT USING (true);
CREATE POLICY "Universe themes are insertable by admins" ON universe_themes FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Universe themes are updatable by admins" ON universe_themes FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Universe themes are deletable by admins" ON universe_themes FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Universe theme assets policies
CREATE POLICY "Universe theme assets are viewable by everyone" ON universe_theme_assets FOR SELECT USING (true);
CREATE POLICY "Universe theme assets are insertable by admins" ON universe_theme_assets FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Universe theme assets are updatable by admins" ON universe_theme_assets FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Universe theme assets are deletable by admins" ON universe_theme_assets FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Universe theme presets policies
CREATE POLICY "Universe theme presets are viewable by everyone" ON universe_theme_presets FOR SELECT USING (true);
CREATE POLICY "Universe theme presets are insertable by admins" ON universe_theme_presets FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Universe theme presets are updatable by admins" ON universe_theme_presets FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Universe theme presets are deletable by admins" ON universe_theme_presets FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- END OF SCRIPT
-- =====================================================
-- =====================================================
-- 7. STORAGE BUCKETS AND POLICIES
-- =====================================================

-- Create storage buckets for media assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('question_images', 'question_images', true, 52428800, ARRAY['image/jpeg','image/png','image/gif','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Basic read policy for question_images bucket (anyone can view)
DROP POLICY IF EXISTS "question_images_select" ON storage.objects;
CREATE POLICY "question_images_select" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'question_images');

-- Restrict writes to admins for question_images bucket
DROP POLICY IF EXISTS "question_images_insert" ON storage.objects;
CREATE POLICY "question_images_insert" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'question_images' AND EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "question_images_update" ON storage.objects;
CREATE POLICY "question_images_update" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'question_images' AND EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "question_images_delete" ON storage.objects;
CREATE POLICY "question_images_delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'question_images' AND EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- END OF SCRIPT
-- =====================================================