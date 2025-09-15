-- Drop potentially conflicting objects from previous failed migrations
DROP TRIGGER IF EXISTS on_chapter_completion ON public.user_progress;
DROP FUNCTION IF EXISTS public.handle_chapter_completion();
DROP TABLE IF EXISTS public.purchase_history;
DROP TABLE IF EXISTS public.support_tickets;
DROP TABLE IF EXISTS public.achievements;
DROP TABLE IF EXISTS public.notifications;
DROP TYPE IF EXISTS public.ticket_status;

/*
# [Schema] Create Gamification and Settings Tables
This migration script sets up the necessary database structure for gamification (achievements, notifications) and the new user settings area (purchase history, support tickets). It also includes the logic to automatically grant achievements and send notifications upon chapter completion.

## Query Description:
- **Gamification Tables**: Creates `achievements` to store medals earned by users and `notifications` for in-app messages.
- **Settings Tables**: Creates `purchase_history` to track user purchases and `support_tickets` for customer support.
- **Automation**: A trigger (`on_chapter_completion`) is created to automatically insert records into `achievements` and `notifications` when a user completes a chapter.
- **Safety**: This is a structural change. It adds new tables and logic but does not modify existing user data in other tables. The `DROP` statements at the beginning are to ensure a clean setup if previous migrations failed.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: false (without a corresponding down-migration)

## Structure Details:
- **Tables Created**: `achievements`, `notifications`, `purchase_history`, `support_tickets`
- **Types Created**: `ticket_status` (enum)
- **Functions Created**: `handle_chapter_completion()`
- **Triggers Created**: `on_chapter_completion` on `user_progress`

## Security Implications:
- RLS Status: Enabled on all new tables.
- Policy Changes: Policies are added to ensure users can only access their own data in these new tables.
- Auth Requirements: All operations are tied to the authenticated user's ID.

## Performance Impact:
- Indexes: Primary keys and foreign keys are indexed by default. A new trigger is added, which has a minor performance cost on `user_progress` updates, but it's an essential part of the feature.
- Estimated Impact: Low.
*/

-- 1. Add medal_icon to chapters table
ALTER TABLE public.chapters
ADD COLUMN IF NOT EXISTS medal_icon TEXT;

-- Update chapters with a default medal icon
UPDATE public.chapters SET medal_icon = '🏅' WHERE medal_icon IS NULL;

-- 2. Create Achievements Table
CREATE TABLE public.achievements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chapter_id bigint NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    granted_at timestamp with time zone DEFAULT now(),
    CONSTRAINT unique_achievement UNIQUE (user_id, chapter_id)
);
COMMENT ON TABLE public.achievements IS 'Records achievements (medals) earned by users for completing chapters.';

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own achievements" ON public.achievements FOR SELECT USING (auth.uid() = user_id);

-- 3. Create Notifications Table
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE public.notifications IS 'Stores in-app notifications for users.';

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- 4. Create Function to Handle Chapter Completion
CREATE OR REPLACE FUNCTION public.handle_chapter_completion()
RETURNS TRIGGER AS $$
DECLARE
    chapter_title TEXT;
    chapter_medal_icon TEXT;
BEGIN
    IF NEW.is_completed = TRUE AND (OLD IS NULL OR OLD.is_completed = FALSE) THEN
        SELECT title, medal_icon INTO chapter_title, chapter_medal_icon
        FROM public.chapters
        WHERE id = NEW.chapter_id;

        INSERT INTO public.achievements (user_id, chapter_id)
        VALUES (NEW.user_id, NEW.chapter_id)
        ON CONFLICT (user_id, chapter_id) DO NOTHING;

        INSERT INTO public.notifications (user_id, title, message)
        VALUES (NEW.user_id, 'Capítulo Concluído!', 'Parabéns! Você ganhou a medalha ' || COALESCE(chapter_medal_icon, '🏅') || ' por completar o capítulo "' || chapter_title || '".');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create Trigger on user_progress table
CREATE TRIGGER on_chapter_completion
AFTER INSERT OR UPDATE ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION public.handle_chapter_completion();

-- 6. Create Purchase History Table (FIXED)
CREATE TABLE public.purchase_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id bigint NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT, -- FIX: Type changed to bigint
    purchase_date timestamp with time zone NOT NULL DEFAULT now(),
    price_paid numeric(10, 2) NOT NULL,
    quantity integer NOT NULL DEFAULT 1
);
COMMENT ON TABLE public.purchase_history IS 'Stores the history of user purchases from the shop.';

ALTER TABLE public.purchase_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own purchase history" ON public.purchase_history FOR SELECT USING (auth.uid() = user_id);

-- 7. Create Support Tickets Table
CREATE TYPE public.ticket_status AS ENUM ('aberto', 'em_progresso', 'fechado');

CREATE TABLE public.support_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject text NOT NULL,
    message text NOT NULL,
    status public.ticket_status NOT NULL DEFAULT 'aberto',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.support_tickets IS 'Stores support tickets submitted by users.';

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own support tickets" ON public.support_tickets FOR ALL USING (auth.uid() = user_id);
