-- ==============================================================================
-- SpeakDaily - Supabase Database Schema & Setup Script
-- ==============================================================================
-- Run this script in your Supabase Project:
-- Dashboard -> SQL Editor -> New Query -> Paste & Click "Run"
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PROFILES TABLE (Mirrors Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    streak_count INTEGER DEFAULT 1,
    total_minutes_spoken NUMERIC(6, 2) DEFAULT 0,
    last_practice_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- 3. TOPICS TABLE
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')) NOT NULL DEFAULT 'Intermediate',
    prompt TEXT NOT NULL,
    talking_points JSONB DEFAULT '[]'::JSONB,
    vocabulary JSONB DEFAULT '[]'::JSONB,
    is_daily BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- 4. PRACTICE SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.practice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    topic_title TEXT,
    transcript TEXT NOT NULL,
    audio_url TEXT,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    overall_score INTEGER NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    fluency_score INTEGER NOT NULL CHECK (fluency_score BETWEEN 0 AND 100),
    grammar_score INTEGER NOT NULL CHECK (grammar_score BETWEEN 0 AND 100),
    vocabulary_score INTEGER NOT NULL CHECK (vocabulary_score BETWEEN 0 AND 100),
    pronunciation_score INTEGER NOT NULL CHECK (pronunciation_score BETWEEN 0 AND 100),
    wpm INTEGER DEFAULT 0,
    filler_words_count INTEGER DEFAULT 0,
    feedback JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON public.practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_created_at ON public.practice_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_category ON public.topics(category);
CREATE INDEX IF NOT EXISTS idx_topics_is_daily ON public.topics(is_daily);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are readable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are readable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Topics Policies (Public read for all users)
DROP POLICY IF EXISTS "Topics are viewable by all users" ON public.topics;
CREATE POLICY "Topics are viewable by all users"
    ON public.topics FOR SELECT
    USING (true);

-- Practice Sessions Policies (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view their own practice sessions" ON public.practice_sessions;
CREATE POLICY "Users can view their own practice sessions"
    ON public.practice_sessions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own practice sessions" ON public.practice_sessions;
CREATE POLICY "Users can insert their own practice sessions"
    ON public.practice_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own practice sessions" ON public.practice_sessions;
CREATE POLICY "Users can delete their own practice sessions"
    ON public.practice_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- 7. AUTOMATIC USER PROFILE TRIGGER
-- Automatically creates a row in public.profiles when someone signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, streak_count, created_at, updated_at)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
        1,
        now(),
        now()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. SEED TOPICS FOR IMMEDIATE ENGAGEMENT
INSERT INTO public.topics (title, category, difficulty, prompt, talking_points, vocabulary, is_daily)
VALUES
(
    'A Book or Movie That Changed Your Perspective',
    'Culture & Media',
    'Intermediate',
    'Describe a book, film, or documentary that made you reconsider how you view the world. What was the central message, and how did it affect your personal decisions or mindset?',
    '["Briefly summarize the plot or premise", "Explain the key turning point or message", "How did it influence your real-world behavior or outlook?"]'::JSONB,
    '[{"word": "Profound", "meaning": "Very great or intense; having deep insight"}, {"word": "Resonate", "meaning": "To evoke a feeling of shared emotion or belief"}, {"word": "Paradigm shift", "meaning": "A fundamental change in approach or underlying assumptions"}]'::JSONB,
    TRUE
),
(
    'The Impact of Artificial Intelligence on Future Careers',
    'Technology',
    'Advanced',
    'Artificial Intelligence is transforming every industry. In your opinion, which jobs will become more valuable in the next decade, and which skills must young professionals master to stay competitive?',
    '["Identify 1-2 skills AI cannot easily replace", "Discuss the balance between automation and human empathy", "Give advice to someone beginning their career today"]'::JSONB,
    '[{"word": "Obsolescence", "meaning": "The process of becoming outdated or no longer used"}, {"word": "Adaptability", "meaning": "The capacity to adjust readily to new conditions"}, {"word": "Augment", "meaning": "To make something greater by adding to it"}]'::JSONB,
    FALSE
),
(
    'My Ideal Morning Routine for Peak Productivity',
    'Daily Life',
    'Beginner',
    'Walk through how you spend the first two hours of your day. What habits make you feel energetic and prepared for challenges ahead?',
    '["What time do you usually wake up?", "Do you prioritize exercise, reading, or planning?", "What is one habit you want to quit or build?"]'::JSONB,
    '[{"word": "Consistent", "meaning": "Acting or done in the same way over time"}, {"word": "Invigorating", "meaning": "Making one feel strong, healthy, and full of energy"}, {"word": "Mindfulness", "meaning": "A mental state achieved by focusing awareness on the present"}]'::JSONB,
    FALSE
),
(
    'Handling High-Pressure Situations and Deadlines',
    'Career & Workplace',
    'Intermediate',
    'Share a story about a challenging deadline or stressful problem you encountered at work or university. How did you organize your priorities and communicate with your team?',
    '["Set the scene and explain the stakes", "Describe your tactical steps to resolve it", "Reflect on what the experience taught you"]'::JSONB,
    '[{"word": "Prioritize", "meaning": "Designate or treat something as more important than other things"}, {"word": "Composure", "meaning": "The state of being calm and in control of oneself"}, {"word": "Contingency", "meaning": "A provision for an unforeseen event or circumstance"}]'::JSONB,
    FALSE
),
(
    'A Memorable Journey That Took an Unexpected Turn',
    'Travel & Adventure',
    'Intermediate',
    'Tell the story of a trip where things did not go according to plan. How did you adapt to the surprises, and what did you learn about yourself?',
    '["Where were you traveling and with whom?", "What unexpected obstacle occurred?", "Why does this memory stand out today?"]'::JSONB,
    '[{"word": "Serendipity", "meaning": "Finding valuable or agreeable things not sought for by chance"}, {"word": "Unforeseen", "meaning": "Not anticipated or predicted"}, {"word": "Resilient", "meaning": "Able to withstand or recover quickly from difficult conditions"}]'::JSONB,
    FALSE
),
(
    'Remote Work vs. Office Collaboration: The Great Debate',
    'Society & Work',
    'Advanced',
    'Many companies are mandating return-to-office, while employees value flexibility. Where do you stand on remote work versus in-person office culture?',
    '["Examine the productivity benefits of quiet remote work", "Contrast with spontaneous innovation in office spaces", "Propose the ultimate hybrid balance"]'::JSONB,
    '[{"word": "Autonomy", "meaning": "The freedom or right to act independently"}, {"word": "Camaraderie", "meaning": "Mutual trust and friendship among people who spend time together"}, {"word": "Synchronous", "meaning": "Existing or occurring at the same time"}]'::JSONB,
    FALSE
);
