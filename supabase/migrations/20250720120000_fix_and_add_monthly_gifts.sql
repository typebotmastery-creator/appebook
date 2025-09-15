/*
          # [Migration Consolidation & Monthly Gifts]
          This script fixes previous migration errors and adds the 'monthly_gifts' feature. It ensures a clean state by safely dropping and recreating objects in the correct order.

          ## Query Description: [This is a corrective and additive migration. It will reset parts of the database functions and triggers to ensure consistency and then create the new table for monthly gifts. No user data will be lost, but it's always safe to have a backup.]
          
          ## Metadata:
          - Schema-Category: ["Structural", "Data"]
          - Impact-Level: ["Medium"]
          - Requires-Backup: [false]
          - Reversible: [false]
          
          ## Structure Details:
          - Drops: Trigger 'on_auth_user_created', Functions 'create_user_profile', 'update_user_level'.
          - Creates: Functions 'create_user_profile', 'update_user_level'.
          - Creates: Triggers 'on_auth_user_created', 'after_progress_update'.
          - Creates: Table 'monthly_gifts'.
          - Creates: RLS Policy on 'monthly_gifts'.
          - Inserts: 12 records into 'monthly_gifts'.
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [Authenticated users]
          
          ## Performance Impact:
          - Indexes: [Primary Key on monthly_gifts]
          - Triggers: [Added]
          - Estimated Impact: [Low. Triggers are lightweight.]
          */

-- Step 1: Safely drop existing objects to ensure a clean state
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.create_user_profile();
DROP FUNCTION IF EXISTS public.update_user_level();

-- Step 2: Recreate the function to create a user profile on signup
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = 'public';
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate the function to update user level based on progress
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER AS $$
DECLARE
  completed_count INT;
  new_level TEXT;
BEGIN
  SET search_path = 'public';
  -- Calculate completed chapters for the user
  SELECT COUNT(*)
  INTO completed_count
  FROM public.user_progress
  WHERE user_id = NEW.user_id AND is_completed = TRUE;

  -- Determine new level
  IF completed_count >= 10 THEN
    new_level := 'avancado';
  ELSIF completed_count >= 5 THEN
    new_level := 'praticante';
  ELSE
    new_level := 'iniciante';
  END IF;

  -- Update the profile level
  UPDATE public.profiles
  SET
    level = new_level,
    total_completed_chapters = completed_count
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Recreate the triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();

CREATE TRIGGER after_progress_update
  AFTER INSERT OR UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_user_level();

-- Step 5: Create the monthly_gifts table
CREATE TABLE public.monthly_gifts (
  id SERIAL PRIMARY KEY,
  month INT NOT NULL UNIQUE CHECK (month >= 1 AND month <= 12),
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  pdf_url TEXT,
  content TEXT,
  is_premium BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 6: Enable Row Level Security for the new table
ALTER TABLE public.monthly_gifts ENABLE ROW LEVEL SECURITY;

-- Step 7: Create policies for the new table
CREATE POLICY "Allow read access to all authenticated users"
ON public.monthly_gifts FOR SELECT
TO authenticated
USING (true);

-- Step 8: Seed the monthly_gifts table with initial data
INSERT INTO public.monthly_gifts (month, title, description, cover_image_url, pdf_url, content) VALUES
(1, 'Ebook de Janeiro: Renovação e Intenção', 'Comece o ano com clareza, definindo intenções poderosas para sua jornada de autoconhecimento.', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4', '/downloads/january.pdf', 'Conteúdo detalhado sobre como definir metas espirituais e criar um plano de renovação para o ano novo.'),
(2, 'Ebook de Fevereiro: Amor Próprio Radical', 'Aprenda a cultivar um relacionamento profundo e amoroso consigo mesmo, a base de todas as conexões.', 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d', '/downloads/february.pdf', 'Exercícios práticos de autoaceitação, meditações para o coração e rituais de autocuidado.'),
(3, 'Ebook de Março: Despertar da Energia', 'Explore os seus centros de energia (chakras) e aprenda a equilibrá-los para uma vida mais vibrante.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', '/downloads/march.pdf', 'Guia completo sobre os sete chakras principais, com meditações e práticas para cada um.'),
(4, 'Ebook de Abril: Florescer Criativo', 'Libere seu potencial criativo inato e use a criatividade como uma ferramenta de expressão espiritual.', 'https://images.unsplash.com/photo-1502741224143-943869829f31', '/downloads/april.pdf', 'Técnicas para superar bloqueios criativos, diário artístico e como transformar a arte em meditação.'),
(5, 'Ebook de Maio: Conexão com a Natureza', 'Reconecte-se com a sabedoria da Mãe Terra e encontre o sagrado no mundo natural.', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', '/downloads/may.pdf', 'Práticas de aterramento (grounding), meditações na natureza e como criar um altar com elementos naturais.'),
(6, 'Ebook de Junho: Solstício e Luz Interior', 'Celebre o pico de luz do ano e aprenda a reconhecer e honrar sua própria luz interior.', 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e', '/downloads/june.pdf', 'Rituais para o solstício, práticas de gratidão e exercícios para aumentar sua autoconfiança e brilho pessoal.'),
(7, 'Ebook de Julho: As Águas da Emoção', 'Navegue pelo mundo das suas emoções com consciência e compaixão, sem se afogar nelas.', 'https://images.unsplash.com/photo-1507525428034-b723a996f3ea', '/downloads/july.pdf', 'Guia para identificar, acolher e transformar emoções difíceis. Técnicas de liberação emocional.'),
(8, 'Ebook de Agosto: A Força do Leão', 'Desperte sua coragem, poder pessoal e liderança autêntica, inspirando-se na energia de agosto.', 'https://images.unsplash.com/photo-1592765758833-884b6c3a7d4a', '/downloads/august.pdf', 'Exercícios para fortalecer a autoestima, encontrar sua voz e agir com integridade e poder.'),
(9, 'Ebook de Setembro: Colheita e Equilíbrio', 'Honre suas conquistas, aprenda com seus desafios e encontre equilíbrio no equinócio.', 'https://images.unsplash.com/photo-1475518112468-942a5b5b4e0b', '/downloads/september.pdf', 'Práticas de reflexão sobre o ano, rituais de colheita e como encontrar harmonia entre ação e descanso.'),
(10, 'Ebook de Outubro: Sombras e Transformação', 'Mergulhe em suas sombras não para se perder, mas para encontrar tesouros escondidos de poder e sabedoria.', 'https://images.unsplash.com/photo-1509824227185-c6b49c71499b', '/downloads/october.pdf', 'Trabalho com arquétipos, diário de sombras e como integrar os aspectos rejeitados de si mesmo.'),
(11, 'Ebook de Novembro: Gratidão e Ancestralidade', 'Cultive um coração grato e honre aqueles que vieram antes de você, conectando-se com suas raízes.', 'https://images.unsplash.com/photo-1508615039623-a25605d2b022', '/downloads/november.pdf', 'Práticas diárias de gratidão, como criar um altar para os ancestrais e meditações para receber sua sabedoria.'),
(12, 'Ebook de Dezembro: Silêncio e Celebração', 'Encontre a paz no silêncio do inverno, reflita sobre sua jornada e celebre o ser que você se tornou.', 'https://images.unsplash.com/photo-1499750310107-5fef28a66643', '/downloads/december.pdf', 'Guia para um retiro de silêncio pessoal, rituais de fechamento de ciclo e como celebrar suas conquistas espirituais.');
