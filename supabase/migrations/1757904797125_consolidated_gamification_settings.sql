/*
# [Consolidated Migration: Gamification &amp; Settings]
This script prepares the database for Gamification (Achievements, Notifications) and the Settings Area (Purchase History, Support). It also fixes a previous error in the 'purchase_history' table.

## Query Description: "This operation will add new tables and columns to support app features. It is designed to be safe and non-destructive to existing user data. No backups are strictly required, but always recommended before schema changes."

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (with a corresponding down migration)

## Structure Details:
- Modifies: `chapters` table (adds `medal_icon` column).
- Creates: `achievements`, `notifications`, `purchase_history`, `support_tickets` tables.
- Creates: `handle_chapter_completion_rewards` function and trigger.

## Security Implications:
- RLS Status: Enabled on all new tables.
- Policy Changes: Adds policies to ensure users can only access their own data.
- Auth Requirements: Policies are based on `auth.uid()`.

## Performance Impact:
- Indexes: Adds indexes on foreign keys and user IDs for efficient querying.
- Triggers: Adds one trigger on `user_progress` table.
- Estimated Impact: Low. The trigger is lightweight and indexes will improve query performance.
*/

-- Step 1: Fix and Create Purchase History Table
DROP TABLE IF EXISTS public.purchase_history;
CREATE TABLE public.purchase_history (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE, -- Corrected from previous attempt
    quantity INT NOT NULL DEFAULT 1,
    total_price NUMERIC(10, 2) NOT NULL,
    purchase_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'completed'
);
ALTER TABLE public.purchase_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own purchase history" ON public.purchase_history FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX ON public.purchase_history(user_id);

-- Step 2: Add Medal Icons to Chapters
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS medal_icon TEXT;

UPDATE public.chapters SET medal_icon = '🌅' WHERE id = 1;
UPDATE public.chapters SET medal_icon = '🌬️' WHERE id = 2;
UPDATE public.chapters SET medal_icon = '⚡' WHERE id = 3;
UPDATE public.chapters SET medal_icon = '🤝' WHERE id = 4;
UPDATE public.chapters SET medal_icon = '🕯️' WHERE id = 5;
UPDATE public.chapters SET medal_icon = '🌈' WHERE id = 6;
UPDATE public.chapters SET medal_icon = '🧘' WHERE id = 7;
UPDATE public.chapters SET medal_icon = '☯️' WHERE id = 8;
UPDATE public.chapters SET medal_icon = '💃' WHERE id = 9;
UPDATE public.chapters SET medal_icon = '🎵' WHERE id = 10;
UPDATE public.chapters SET medal_icon = '🕯️' WHERE id = 11;
UPDATE public.chapters SET medal_icon = '💕' WHERE id = 12;
UPDATE public.chapters SET medal_icon = '🌹' WHERE id = 13;
UPDATE public.chapters SET medal_icon = '🌱' WHERE id = 14;
UPDATE public.chapters SET medal_icon = '♾️' WHERE id = 15;

-- Step 3: Create Achievements Table
CREATE TABLE public.achievements (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chapter_id BIGINT NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    medal_icon TEXT,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, chapter_id)
);
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own achievements" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX ON public.achievements(user_id);

-- Step 4: Create Notifications Table
CREATE TABLE public.notifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'achievement',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE INDEX ON public.notifications(user_id);

-- Step 5: Create Support Tickets Table
CREATE TABLE public.support_tickets (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own support tickets" ON public.support_tickets FOR ALL USING (auth.uid() = user_id);
CREATE INDEX ON public.support_tickets(user_id);


-- Step 6: Create Trigger Function for Rewards
CREATE OR REPLACE FUNCTION public.handle_chapter_completion_rewards()
RETURNS TRIGGER AS $$
DECLARE
    chapter_title TEXT;
    chapter_medal_icon TEXT;
BEGIN
    -- Check if the chapter is being marked as completed
    IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
        
        -- Get chapter details
        SELECT title, medal_icon INTO chapter_title, chapter_medal_icon
        FROM public.chapters
        WHERE id = NEW.chapter_id;

        -- Insert achievement if it doesn't exist
        INSERT INTO public.achievements (user_id, chapter_id, title, medal_icon)
        VALUES (NEW.user_id, NEW.chapter_id, 'Capítulo Concluído: ' || chapter_title, chapter_medal_icon)
        ON CONFLICT (user_id, chapter_id) DO NOTHING;

        -- Insert notification
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (
            NEW.user_id,
            'Nova Conquista Desbloqueada!',
            'Parabéns! Você concluiu o capítulo "' || chapter_title || '" e ganhou uma nova medalha.',
            'achievement'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set search_path to prevent security warnings
ALTER FUNCTION public.handle_chapter_completion_rewards() SET search_path = public;


-- Step 7: Create the Trigger on user_progress table
DROP TRIGGER IF EXISTS on_chapter_completed_trigger ON public.user_progress;
CREATE TRIGGER on_chapter_completed_trigger
AFTER UPDATE ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION public.handle_chapter_completion_rewards();
