/*
          # [Operation Name]
          Security Fix and Data Seeding

          ## Query Description: [This script performs two main actions:
1. Addresses security warnings by explicitly setting the `search_path` for existing database functions, preventing potential security vulnerabilities.
2. Seeds the `monthly_gifts` table with 12 placeholder entries, one for each month. This is necessary to populate the "12 Presentes Mensais" feature and make it testable.]
          
          ## Metadata:
          - Schema-Category: ["Structural", "Data"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Functions affected: `handle_new_user`, `update_profile_stats`
          - Table affected: `monthly_gifts` (data insertion)
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [No]
          - Auth Requirements: [admin]
          
          ## Performance Impact:
          - Indexes: [No change]
          - Triggers: [No change]
          - Estimated Impact: [Negligible performance impact. Improves security posture.]
          */

-- Fix security warning for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Fix security warning for update_profile_stats function
CREATE OR REPLACE FUNCTION public.update_profile_stats()
RETURNS TRIGGER AS $$
DECLARE
  completed_count INT;
  user_level TEXT;
BEGIN
  -- Recalculate total completed chapters
  SELECT count(*)
  INTO completed_count
  FROM public.user_progress
  WHERE user_id = NEW.user_id AND is_completed = true;

  -- Determine user level
  IF completed_count >= 10 THEN
    user_level := 'avancado';
  ELSIF completed_count >= 5 THEN
    user_level := 'praticante';
  ELSE
    user_level := 'iniciante';
  END IF;

  -- Update the profiles table
  UPDATE public.profiles
  SET
    total_completed_chapters = completed_count,
    level = user_level::public.user_level_enum,
    updated_at = now()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Seed data for monthly_gifts table
INSERT INTO public.monthly_gifts (month, title, description, cover_image_url, pdf_url, content) VALUES
(1, 'Ebook de Janeiro: Renovação', 'Comece o ano com intenções claras e práticas para renovar sua energia.', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500', '/pdfs/placeholder.pdf', '<h1>Renovação de Janeiro</h1><p>Este é o conteúdo para leitura no app sobre renovação...</p>'),
(2, 'Ebook de Fevereiro: Amor Próprio', 'Um guia para cultivar o amor e a compaixão por si mesmo.', 'https://images.unsplash.com/photo-1599057562494-2586c7e88359?w=500', '/pdfs/placeholder.pdf', '<h1>Amor Próprio em Fevereiro</h1><p>Este é o conteúdo para leitura no app sobre amor próprio...</p>'),
(3, 'Ebook de Março: Equilíbrio', 'Encontre o equilíbrio entre suas energias internas, a mente e o corpo.', 'https://images.unsplash.com/photo-1541557435838-1e7a9c27a4a4?w=500', '/pdfs/placeholder.pdf', '<h1>Equilíbrio em Março</h1><p>Este é o conteúdo para leitura no app sobre equilíbrio...</p>'),
(4, 'Ebook de Abril: Florescer', 'Técnicas para permitir que seu verdadeiro eu floresça sem medos.', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500', '/pdfs/placeholder.pdf', '<h1>Florescer em Abril</h1><p>Este é o conteúdo para leitura no app sobre florescer...</p>'),
(5, 'Ebook de Maio: Conexão', 'Aprofunde a conexão com a natureza e com sua essência divina.', 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=500', '/pdfs/placeholder.pdf', '<h1>Conexão em Maio</h1><p>Este é o conteúdo para leitura no app sobre conexão...</p>'),
(6, 'Ebook de Junho: Intuição', 'Desperte e confie na sua voz interior e na sua sabedoria inata.', 'https://images.unsplash.com/photo-1518895318338-953b6833727a?w=500', '/pdfs/placeholder.pdf', '<h1>Intuição em Junho</h1><p>Este é o conteúdo para leitura no app sobre intuição...</p>'),
(7, 'Ebook de Julho: Libertação', 'Práticas para se libertar de padrões e crenças limitantes.', 'https://images.unsplash.com/photo-1531306435453-42a69b56c414?w=500', '/pdfs/placeholder.pdf', '<h1>Libertação em Julho</h1><p>Este é o conteúdo para leitura no app sobre libertação...</p>'),
(8, 'Ebook de Agosto: Força', 'Acesse sua força interior e resiliência para superar desafios.', 'https://images.unsplash.com/photo-1581009137042-c552b485697a?w=500', '/pdfs/placeholder.pdf', '<h1>Força em Agosto</h1><p>Este é o conteúdo para leitura no app sobre força interior...</p>'),
(9, 'Ebook de Setembro: Colheita', 'Celebre suas conquistas e aprenda com a jornada percorrida.', 'https://images.unsplash.com/photo-1567394254720-d091890071a9?w=500', '/pdfs/placeholder.pdf', '<h1>Colheita em Setembro</h1><p>Este é o conteúdo para leitura no app sobre celebração...</p>'),
(10, 'Ebook de Outubro: Transformação', 'Abrace a mudança como uma poderosa ferramenta de crescimento.', 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=500', '/pdfs/placeholder.pdf', '<h1>Transformação em Outubro</h1><p>Este é o conteúdo para leitura no app sobre transformação...</p>'),
(11, 'Ebook de Novembro: Gratidão', 'Incorpore a gratidão como uma prática diária para elevar sua vibração.', 'https://images.unsplash.com/photo-1509803874385-db7c23652552?w=500', '/pdfs/placeholder.pdf', '<h1>Gratidão em Novembro</h1><p>Este é o conteúdo para leitura no app sobre gratidão...</p>'),
(12, 'Ebook de Dezembro: Celebração', 'Reflexões para fechar o ciclo anual e celebrar a jornada da vida.', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500', '/pdfs/placeholder.pdf', '<h1>Celebração em Dezembro</h1><p>Este é o conteúdo para leitura no app sobre celebração...</p>');
