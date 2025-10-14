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
DROP TYPE IF EXISTS session_type CASCADE;
DROP TYPE IF EXISTS universe_status CASCADE;

-- App role enum for user permissions
CREATE TYPE app_role AS ENUM ('admin', 'user');

-- Session type enum for distinguishing standalone vs universe sessions
CREATE TYPE session_type AS ENUM ('standalone', 'universe');

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
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS universes CASCADE;

-- Universes table - Main Universe entity
CREATE TABLE universes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    poster_image_url TEXT,
    status universe_status DEFAULT 'draft',
    created_by UUID NOT NULL, -- Reference to auth.users
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
-- 3. CORE TABLES (Existing Structure with Universe support)
-- =====================================================

-- Sessions table (enhanced with Universe support)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'en attente',
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    session_type session_type DEFAULT 'standalone',
    universe_id UUID REFERENCES universes(id) ON DELETE CASCADE,
    session_order INTEGER, -- Optional explicit ordering within a universe
    context TEXT, -- Additional context for the session
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
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    door_number INTEGER,
    hint TEXT,
    points INTEGER DEFAULT 1,
    style TEXT,
    prize TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_door_per_session UNIQUE (session_id, door_number)
);

-- Universe troupes - Defines the competing teams/troupes in a universe (moved here before rooms table)
CREATE TABLE universe_troupes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sigil TEXT DEFAULT '🏰',
    motto TEXT DEFAULT '',
    initial_tokens INTEGER DEFAULT 3,
    troupe_order INTEGER NOT NULL, -- Order of troupes in the universe
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(universe_id, troupe_order),
    UNIQUE(universe_id, name) -- Ensure unique troupe names within a universe
);

-- Rooms table (enhanced with Universe support and troupe association)
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    universe_id UUID REFERENCES universes(id) ON DELETE CASCADE,
    troupe_id UUID REFERENCES universe_troupes(id) ON DELETE SET NULL, -- Link to troupe for universe sessions
    current_door INTEGER DEFAULT 1,
    initial_tokens INTEGER DEFAULT 3,
    tokens_left INTEGER DEFAULT 3,
    score INTEGER DEFAULT 0,
    is_template BOOLEAN DEFAULT false, -- For universe room templates
    template_order INTEGER, -- Order in universe template
    sigil TEXT DEFAULT '🏰',
    motto TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scores table (enhanced with Universe support)
CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
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
    template_order INTEGER NOT NULL, -- Order of rooms in the universe
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

-- Universe leaderboard - Aggregated scores across all sessions in a universe
CREATE TABLE universe_leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
    room_name TEXT NOT NULL, -- Room name from the best session
    best_session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    total_score INTEGER DEFAULT 0,
    completion_time INTERVAL,
    sessions_completed INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(universe_id, room_name)
);

-- Universe themes for customizing look and feel
CREATE TABLE universe_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Theme name (e.g., "Medieval Castle", "Cyberpunk", "Space Odyssey")
    description TEXT,
    
    -- Color Palette (CSS Variables)
    primary_color TEXT DEFAULT '#8B5CF6', -- Main theme color
    secondary_color TEXT DEFAULT '#7E69AB', -- Secondary color
    accent_color TEXT DEFAULT '#D6BCFA', -- Accent highlights
    background_color TEXT DEFAULT '#1A1F2C', -- Main background
    surface_color TEXT DEFAULT '#2D3748', -- Card/surface backgrounds
    text_primary TEXT DEFAULT '#FFFFFF', -- Primary text color
    text_secondary TEXT DEFAULT '#A0ADB8', -- Secondary text color
    border_color TEXT DEFAULT '#4A5568', -- Border colors
    success_color TEXT DEFAULT '#00FF00', -- Success/correct answers
    error_color TEXT DEFAULT '#DC2626', -- Error/wrong answers
    warning_color TEXT DEFAULT '#F59E0B', -- Warning states
    
    -- Typography
    font_family_primary TEXT DEFAULT 'Inter, system-ui, sans-serif', -- Main font
    font_family_secondary TEXT DEFAULT 'JetBrains Mono, monospace', -- Code/accent font
    font_family_display TEXT DEFAULT 'Cinzel, serif', -- Headers/titles
    
    -- Visual Effects
    border_radius TEXT DEFAULT '0.5rem', -- Border radius for components
    shadow_style TEXT DEFAULT '0 4px 6px -1px rgba(0, 0, 0, 0.1)', -- Box shadows
    animation_speed TEXT DEFAULT '300ms', -- Animation duration
    
    -- Background Elements
    background_image_url TEXT, -- Main background image
    background_pattern TEXT DEFAULT 'none', -- CSS pattern (grid, dots, etc.)
    background_overlay TEXT DEFAULT 'rgba(0, 0, 0, 0.5)', -- Overlay opacity
    
    -- Component Styles
    button_style JSONB DEFAULT '{"variant": "default", "size": "md"}', -- Button styling
    card_style JSONB DEFAULT '{"variant": "default", "padding": "md"}', -- Card styling
    door_style JSONB DEFAULT '{"animation": "glow", "colors": ["emerald", "blue", "purple"]}', -- Door colors per level
    
    -- Audio Theme
    background_music_url TEXT, -- Background music for this theme
    sound_effects JSONB DEFAULT '{}', -- Custom sound effects mapping
    
    -- Custom CSS
    custom_css TEXT, -- Additional CSS for advanced customization
    
    -- Theme Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Theme assets for storing images, icons, and other media
CREATE TABLE universe_theme_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    theme_id UUID NOT NULL REFERENCES universe_themes(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL, -- 'background', 'icon', 'logo', 'texture', 'emblem'
    asset_name TEXT NOT NULL, -- Descriptive name
    asset_url TEXT NOT NULL, -- URL to the asset
    asset_category TEXT, -- Optional category (e.g., 'door-icons', 'backgrounds')
    display_order INTEGER DEFAULT 0, -- For ordering assets
    metadata JSONB DEFAULT '{}', -- Additional asset metadata (dimensions, alt text, etc.)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Theme presets for common theme configurations
CREATE TABLE universe_theme_presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- Preset name (e.g., "Medieval", "Cyberpunk", "Space")
    description TEXT,
    category TEXT DEFAULT 'general', -- 'medieval', 'sci-fi', 'fantasy', 'modern', etc.
    
    -- Same color and style fields as universe_themes
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
    
    -- Preset metadata
    is_system_preset BOOLEAN DEFAULT false, -- System vs user-created presets
    preview_image_url TEXT, -- Preview image for theme selection
    tags TEXT[] DEFAULT '{}', -- Tags for filtering/searching
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. INDEXES FOR PERFORMANCE
-- =====================================================

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_sessions_universe_id;
DROP INDEX IF EXISTS idx_sessions_status;
DROP INDEX IF EXISTS idx_sessions_type;
DROP INDEX IF EXISTS idx_rooms_session_id;
DROP INDEX IF EXISTS idx_rooms_universe_id;
DROP INDEX IF EXISTS idx_rooms_troupe_id;
DROP INDEX IF EXISTS idx_rooms_is_template;
DROP INDEX IF EXISTS idx_scores_session_id;
DROP INDEX IF EXISTS idx_scores_universe_id;
DROP INDEX IF EXISTS idx_scores_room_id;
DROP INDEX IF EXISTS idx_scores_total_score;
DROP INDEX IF EXISTS idx_questions_session_id;
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

-- Sessions indexes
CREATE INDEX idx_sessions_universe_id ON sessions(universe_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_type ON sessions(session_type);
-- Optional ordering index when session_order is used
CREATE INDEX IF NOT EXISTS idx_sessions_universe_order ON sessions(universe_id, session_order);

-- Rooms indexes
CREATE INDEX idx_rooms_session_id ON rooms(session_id);
CREATE INDEX idx_rooms_universe_id ON rooms(universe_id);
CREATE INDEX idx_rooms_troupe_id ON rooms(troupe_id);
CREATE INDEX idx_rooms_is_template ON rooms(is_template);

-- Scores indexes
CREATE INDEX idx_scores_session_id ON scores(session_id);
CREATE INDEX idx_scores_universe_id ON scores(universe_id);
CREATE INDEX idx_scores_room_id ON scores(room_id);
CREATE INDEX idx_scores_total_score ON scores(total_score DESC);

-- Questions indexes
CREATE INDEX idx_questions_session_id ON questions(session_id);
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
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
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

-- Sessions policies
CREATE POLICY "Sessions are viewable by everyone" ON sessions FOR SELECT USING (true);
CREATE POLICY "Sessions are insertable by admins" ON sessions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Sessions are updatable by admins" ON sessions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Sessions are deletable by admins" ON sessions FOR DELETE USING (
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
CREATE POLICY "Universe leaderboard is insertable by everyone" ON universe_leaderboard FOR INSERT WITH CHECK (true);
CREATE POLICY "Universe leaderboard is updatable by everyone" ON universe_leaderboard FOR UPDATE USING (true);
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
-- 7. FUNCTIONS
-- =====================================================

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS has_role(app_role);
DROP FUNCTION IF EXISTS update_universe_leaderboard();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Function to check if current user has a specific role
CREATE OR REPLACE FUNCTION has_role(required_role app_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = required_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_universe_leaderboard ON scores;
DROP TRIGGER IF EXISTS update_universes_updated_at ON universes;
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
DROP TRIGGER IF EXISTS update_scores_updated_at ON scores;
DROP TRIGGER IF EXISTS update_universe_room_templates_updated_at ON universe_room_templates;
DROP TRIGGER IF EXISTS update_universe_troupes_updated_at ON universe_troupes;
DROP TRIGGER IF EXISTS update_universe_questions_updated_at ON universe_questions;
DROP TRIGGER IF EXISTS update_universe_leaderboard_updated_at ON universe_leaderboard;

-- Function to update current_participants when sessions are created/deleted
CREATE OR REPLACE FUNCTION update_universe_participants()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment current_participants when a new session is created for a universe
        IF NEW.universe_id IS NOT NULL THEN
            UPDATE universes 
            SET current_participants = current_participants + 1,
                updated_at = NOW()
            WHERE id = NEW.universe_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement current_participants when a session is deleted from a universe
        IF OLD.universe_id IS NOT NULL THEN
            UPDATE universes 
            SET current_participants = GREATEST(current_participants - 1, 0),
                updated_at = NOW()
            WHERE id = OLD.universe_id;
        END IF;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle universe_id changes
        IF OLD.universe_id IS DISTINCT FROM NEW.universe_id THEN
            -- Decrement from old universe
            IF OLD.universe_id IS NOT NULL THEN
                UPDATE universes 
                SET current_participants = GREATEST(current_participants - 1, 0),
                    updated_at = NOW()
                WHERE id = OLD.universe_id;
            END IF;
            -- Increment to new universe
            IF NEW.universe_id IS NOT NULL THEN
                UPDATE universes 
                SET current_participants = current_participants + 1,
                    updated_at = NOW()
                WHERE id = NEW.universe_id;
            END IF;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update universe leaderboard when a session is completed
CREATE OR REPLACE FUNCTION update_universe_leaderboard()
RETURNS TRIGGER AS $$
DECLARE
    universe_id_val UUID;
    room_name_val TEXT;
    troupe_id_val UUID;
    troupe_name_val TEXT;
    aggregated_total_score INTEGER;
    sessions_completed_count INTEGER;
    best_session_id_val UUID;
    best_session_completion_time INTERVAL;
    session_total_score INTEGER;
    session_completion_time INTERVAL;
BEGIN
    -- Lookup universe_id from session
    SELECT s.universe_id INTO universe_id_val
    FROM sessions s WHERE s.id = NEW.session_id;

    IF universe_id_val IS NOT NULL THEN
        -- Fetch room info for current score row
        SELECT r.troupe_id, r.name INTO troupe_id_val, room_name_val
        FROM rooms r
        WHERE r.id = NEW.room_id;

        IF troupe_id_val IS NOT NULL THEN
            -- Fetch troupe name
            SELECT t.name INTO troupe_name_val
            FROM universe_troupes t
            WHERE t.id = troupe_id_val;

            -- Aggregate total score across all sessions for this troupe in this universe
            SELECT COALESCE(SUM(t.max_score), 0) INTO aggregated_total_score
            FROM (
                SELECT MAX(sc.total_score) AS max_score
                FROM scores sc
                JOIN rooms rr ON rr.id = sc.room_id
                WHERE rr.universe_id = universe_id_val
                  AND rr.troupe_id = troupe_id_val
                GROUP BY sc.session_id
            ) t;

            -- Count distinct sessions for this troupe
            SELECT COUNT(DISTINCT sc.session_id) INTO sessions_completed_count
            FROM scores sc
            JOIN rooms rr ON rr.id = sc.room_id
            WHERE rr.universe_id = universe_id_val
              AND rr.troupe_id = troupe_id_val;

            -- Determine best session (highest final score) for this troupe
            SELECT sub.session_id INTO best_session_id_val
            FROM (
                SELECT sc.session_id, MAX(sc.total_score) AS session_best
                FROM scores sc
                JOIN rooms rr ON rr.id = sc.room_id
                WHERE rr.universe_id = universe_id_val
                  AND rr.troupe_id = troupe_id_val
                GROUP BY sc.session_id
                ORDER BY session_best DESC
                LIMIT 1
            ) AS sub;

            -- Compute completion time for the best session
            IF best_session_id_val IS NOT NULL THEN
                SELECT (MAX(sc.created_at) - MIN(sc.created_at)) INTO best_session_completion_time
                FROM scores sc
                WHERE sc.session_id = best_session_id_val;
            ELSE
                best_session_completion_time := NULL;
            END IF;

            -- Upsert aggregated leaderboard entry (keyed by troupe name)
            INSERT INTO universe_leaderboard (
                universe_id,
                room_name,
                best_session_id,
                total_score,
                completion_time,
                sessions_completed,
                last_updated
            ) VALUES (
                universe_id_val,
                troupe_name_val,
                best_session_id_val,
                aggregated_total_score,
                best_session_completion_time,
                sessions_completed_count,
                NOW()
            )
            ON CONFLICT (universe_id, room_name)
            DO UPDATE SET
                total_score = EXCLUDED.total_score,
                best_session_id = EXCLUDED.best_session_id,
                completion_time = EXCLUDED.completion_time,
                sessions_completed = EXCLUDED.sessions_completed,
                last_updated = NOW();
        ELSE
            -- Fallback: aggregate across sessions for this room (use room name as participant_name)
            -- Sum the best score per session for the specific room
            SELECT COALESCE(SUM(t.max_score), 0) INTO aggregated_total_score
            FROM (
                SELECT MAX(sc.total_score) AS max_score
                FROM scores sc
                WHERE sc.room_id = NEW.room_id
                GROUP BY sc.session_id
            ) t;

            -- Count distinct sessions for this room
            SELECT COUNT(DISTINCT sc.session_id) INTO sessions_completed_count
            FROM scores sc
            WHERE sc.room_id = NEW.room_id;

            -- Determine best session (highest final score) for this room
            SELECT sub.session_id INTO best_session_id_val
            FROM (
                SELECT sc.session_id, MAX(sc.total_score) AS session_best
                FROM scores sc
                WHERE sc.room_id = NEW.room_id
                GROUP BY sc.session_id
                ORDER BY session_best DESC
                LIMIT 1
            ) AS sub;

            -- Compute completion time for the best session
            IF best_session_id_val IS NOT NULL THEN
                SELECT (MAX(sc.created_at) - MIN(sc.created_at)) INTO best_session_completion_time
                FROM scores sc
                WHERE sc.session_id = best_session_id_val;
            ELSE
                best_session_completion_time := NULL;
            END IF;

            INSERT INTO universe_leaderboard (
                universe_id,
                room_name,
                best_session_id,
                total_score,
                completion_time,
                sessions_completed,
                last_updated
            ) VALUES (
                universe_id_val,
                room_name_val,
                best_session_id_val,
                aggregated_total_score,
                best_session_completion_time,
                sessions_completed_count,
                NOW()
            )
            ON CONFLICT (universe_id, room_name)
            DO UPDATE SET
                total_score = EXCLUDED.total_score,
                best_session_id = EXCLUDED.best_session_id,
                completion_time = EXCLUDED.completion_time,
                sessions_completed = EXCLUDED.sessions_completed,
                last_updated = NOW();
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update universe participants count
CREATE TRIGGER update_universe_participants_insert
    AFTER INSERT ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_universe_participants();

CREATE TRIGGER update_universe_participants_update
    AFTER UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_universe_participants();

CREATE TRIGGER update_universe_participants_delete
    AFTER DELETE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_universe_participants();

-- Trigger to update universe leaderboard when scores are inserted
CREATE TRIGGER update_universe_leaderboard_trigger
    AFTER INSERT ON scores
    FOR EACH ROW
    EXECUTE FUNCTION update_universe_leaderboard();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_universes_updated_at BEFORE UPDATE ON universes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_universe_themes_updated_at BEFORE UPDATE ON universe_themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_universe_troupes_updated_at BEFORE UPDATE ON universe_troupes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_universe_theme_presets_updated_at BEFORE UPDATE ON universe_theme_presets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert a sample admin user role (replace with actual user ID after authentication)
-- You'll need to replace 'your-admin-user-id' with the actual UUID from auth.users
-- INSERT INTO user_roles (user_id, role) VALUES ('your-admin-user-id', 'admin');

-- Sample universe (uncomment to create test data)
-- INSERT INTO universes (name, description, status, created_by) 
-- VALUES ('Sample Universe', 'A test universe for development', 'active', 'your-admin-user-id');

-- =====================================================
-- 9. ADMIN ROLE ASSIGNMENT
-- =====================================================

-- Function to automatically assign admin role to specific users
CREATE OR REPLACE FUNCTION assign_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user is the designated admin
  IF NEW.email = 'a.roucadi@attijariwafa.com' THEN
    -- Insert admin role if it doesn't exist
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically assign admin role on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION assign_admin_role();

-- Manual admin role assignment for existing users (run once)
DO $$
BEGIN
  -- Check if the admin user exists and assign role
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'a.roucadi@attijariwafa.com') THEN
    INSERT INTO user_roles (user_id, role)
    SELECT id, 'admin'
    FROM auth.users 
    WHERE email = 'a.roucadi@attijariwafa.com'
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
  END IF;
END $$;

-- =====================================================
-- 10. STORAGE BUCKETS SETUP
-- =====================================================

-- Create storage buckets for question images and universe posters
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('question_images', 'question_images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('universe-posters', 'universe-posters', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for question_images bucket
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

-- Set up storage policies for universe-posters bucket
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

-- =====================================================
-- 11. GRANTS AND PERMISSIONS
-- =====================================================

-- Grant usage on sequences
GRANT USAGE ON SEQUENCE questions_id_seq TO anon, authenticated;
GRANT USAGE ON SEQUENCE universe_questions_id_seq TO anon, authenticated;

-- Insert default theme presets
INSERT INTO universe_theme_presets (name, description, category, primary_color, secondary_color, accent_color, background_color, surface_color, text_primary, text_secondary, border_color, success_color, error_color, warning_color, font_family_display, door_style, is_system_preset, preview_image_url, tags) VALUES
('Dragon Quest Classic', 'The original green terminal theme with dragon aesthetics', 'fantasy', '#00FF00', '#00CC00', '#66FF66', '#000000', '#1A1A1A', '#00FF00', '#00CC00', '#00FF00', '#00FF00', '#FF0000', '#FFFF00', 'Cinzel, serif', '{"animation": "glow", "colors": ["emerald", "green", "lime"]}', true, null, '{"retro", "terminal", "dragon", "classic"}'),
('Medieval Castle', 'Stone walls and royal colors for a medieval adventure', 'medieval', '#8B4513', '#A0522D', '#DEB887', '#2F1B14', '#4A2C2A', '#F5DEB3', '#D2B48C', '#8B4513', '#32CD32', '#DC143C', '#FFD700', 'Cinzel, serif', '{"animation": "flicker", "colors": ["amber", "orange", "red"]}', true, null, '{"medieval", "castle", "stone", "royal"}'),
('Cyberpunk Neon', 'Futuristic neon colors and digital aesthetics', 'sci-fi', '#FF00FF', '#00FFFF', '#FFFF00', '#0A0A0A', '#1A1A2E', '#FFFFFF', '#CCCCCC', '#FF00FF', '#00FF00', '#FF0040', '#FFA500', 'Orbitron, monospace', '{"animation": "pulse", "colors": ["cyan", "magenta", "yellow"]}', true, null, '{"cyberpunk", "neon", "futuristic", "digital"}'),
('Space Odyssey', 'Deep space colors with cosmic themes', 'sci-fi', '#4169E1', '#1E90FF', '#87CEEB', '#000011', '#191970', '#FFFFFF', '#B0C4DE', '#4169E1', '#00FF7F', '#FF4500', '#FFD700', 'Exo 2, sans-serif', '{"animation": "glow", "colors": ["blue", "indigo", "purple"]}', true, null, '{"space", "cosmic", "stars", "galaxy"}'),
('Enchanted Forest', 'Natural greens and earth tones for a magical forest', 'fantasy', '#228B22', '#32CD32', '#90EE90', '#0D2818', '#1B4332', '#F0FFF0', '#98FB98', '#228B22', '#00FF00', '#DC143C', '#FFD700', 'Merriweather, serif', '{"animation": "sway", "colors": ["green", "emerald", "lime"]}', true, null, '{"forest", "nature", "magic", "earth"}');

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- 
-- Next steps after running this script:
-- 1. Set up authentication in Supabase dashboard
-- 2. Create your first admin user and add their UUID to user_roles table
-- 3. Test the database structure with sample data
-- 4. Update your application's environment variables with new database URL and API key
-- 
-- Database URL: https://jmpmucdoqkcpetdfnxrj.supabase.co
-- API Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptcG11Y2RvcWtjcGV0ZGZueHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MjAxNTcsImV4cCI6MjA3NTQ5NjE1N30.9DkLxkZNXz7G1zxK_ZiYWhpDzUIyI6wBcTfjCDA41Gg
-- 
-- =====================================================