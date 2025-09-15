/*
# Sistema de Progresso do Usuário - O Toque Tântrico
Criação de tabelas para armazenar progresso dos usuários, capítulos e exercícios.

## Query Description: 
Esta migração cria um sistema completo para rastrear o progresso do usuário através dos capítulos do app "O Toque Tântrico". 
Inclui tabelas para perfis de usuário, progresso de capítulos, respostas de exercícios e dados dos capítulos.
É uma operação segura que não afeta dados existentes.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- public.profiles: Perfis de usuário ligados ao auth.users
- public.chapters: Dados dos capítulos (título, conteúdo, etc.)
- public.user_progress: Progresso do usuário em cada capítulo
- public.exercise_responses: Respostas dos usuários aos exercícios

## Security Implications:
- RLS Status: Enabled em todas as tabelas
- Policy Changes: Yes - políticas restritivas baseadas em user_id
- Auth Requirements: Usuários autenticados podem acessar apenas seus próprios dados

## Performance Impact:
- Indexes: Adicionados para user_id, chapter_id e created_at
- Triggers: Trigger para criar perfil automaticamente
- Estimated Impact: Mínimo - operação de criação apenas
*/

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    name TEXT,
    avatar_url TEXT,
    subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'trial')),
    subscription_expires_at TIMESTAMPTZ,
    level TEXT DEFAULT 'iniciante' CHECK (level IN ('iniciante', 'praticante', 'avancado')),
    total_completed_chapters INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de capítulos
CREATE TABLE IF NOT EXISTS public.chapters (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    icon TEXT DEFAULT '📖',
    estimated_time TEXT DEFAULT '15 min',
    content JSONB DEFAULT '{}',
    exercises JSONB DEFAULT '[]',
    order_index INTEGER NOT NULL,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de progresso do usuário
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    chapter_id INTEGER REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, chapter_id)
);

-- Tabela de respostas dos exercícios
CREATE TABLE IF NOT EXISTS public.exercise_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    chapter_id INTEGER REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
    exercise_id TEXT NOT NULL,
    exercise_type TEXT NOT NULL CHECK (exercise_type IN ('checklist', 'quiz', 'reflection', 'practice')),
    response_data JSONB DEFAULT '{}',
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, chapter_id, exercise_id)
);

-- Habilitar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_responses ENABLE ROW LEVEL SECURITY;

-- Políticas para public.profiles
CREATE POLICY "Usuários podem ver apenas seu próprio perfil"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar apenas seu próprio perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir apenas seu próprio perfil"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Políticas para public.chapters (leitura pública)
CREATE POLICY "Qualquer usuário autenticado pode ler capítulos"
    ON public.chapters FOR SELECT
    TO authenticated
    USING (true);

-- Políticas para public.user_progress
CREATE POLICY "Usuários podem ver apenas seu próprio progresso"
    ON public.user_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas seu próprio progresso"
    ON public.user_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas seu próprio progresso"
    ON public.user_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- Políticas para public.exercise_responses
CREATE POLICY "Usuários podem ver apenas suas próprias respostas"
    ON public.exercise_responses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas suas próprias respostas"
    ON public.exercise_responses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias respostas"
    ON public.exercise_responses FOR UPDATE
    USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_chapters_order ON public.chapters(order_index);
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_chapter_id ON public.user_progress(chapter_id);
CREATE INDEX idx_user_progress_completed ON public.user_progress(is_completed);
CREATE INDEX idx_exercise_responses_user_id ON public.exercise_responses(user_id);
CREATE INDEX idx_exercise_responses_chapter_id ON public.exercise_responses(chapter_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at 
    BEFORE UPDATE ON public.chapters 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at 
    BEFORE UPDATE ON public.user_progress 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_exercise_responses_updated_at 
    BEFORE UPDATE ON public.exercise_responses 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'name', 'Usuário')
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Inserir dados dos capítulos
INSERT INTO public.chapters (id, title, subtitle, description, icon, estimated_time, order_index, is_premium) VALUES
(1, 'Despertar da Consciência', 'O primeiro passo da jornada', 'Compreenda os fundamentos do tantra e desperte sua consciência interior', '🌅', '15 min', 1, false),
(2, 'Respiração Sagrada', 'A porta de entrada para o divino', 'Aprenda técnicas ancestrais de respiração para expandir sua consciência', '🌬️', '20 min', 2, false),
(3, 'Energia Vital', 'Conhecendo sua força interior', 'Descubra como sentir e direcionar sua energia vital (prana)', '⚡', '18 min', 3, false),
(4, 'Conexão Profunda', 'Integrando corpo e espírito', 'Técnicas para aprofundar a conexão consigo mesmo', '🤝', '25 min', 4, true),
(5, 'Transcendência', 'Além dos limites do ego', 'Práticas avançadas para transcender limitações pessoais', '🕯️', '30 min', 5, true),
(6, 'Chakras e Centros Energéticos', 'Mapeando sua anatomia energética', 'Compreenda e equilibre seus centros de energia', '🌈', '22 min', 6, true),
(7, 'Meditação Tântrica', 'Presença em movimento', 'Técnicas específicas de meditação tântrica', '🧘', '20 min', 7, true),
(8, 'Polaridades Sagradas', 'Masculino e feminino interior', 'Equilibrando as energias internas', '☯️', '26 min', 8, true),
(9, 'Movimento Consciente', 'O corpo como templo', 'Práticas corporais sagradas', '💃', '24 min', 9, true),
(10, 'Som e Vibração', 'A música do universo', 'Mantras e sons sagrados', '🎵', '18 min', 10, true),
(11, 'Ritual e Cerimônia', 'Sacralizando o cotidiano', 'Criando rituais pessoais significativos', '🕯️', '28 min', 11, true),
(12, 'Relacionamentos Conscientes', 'Encontro sagrado com o outro', 'Levando o tantra para os relacionamentos', '💕', '32 min', 12, true),
(13, 'Sexualidade Sagrada', 'O aspecto mais íntimo do tantra', 'Integrando espiritualidade e sexualidade', '🌹', '35 min', 13, true),
(14, 'Integração na Vida Diária', 'Tantra além da prática', 'Vivendo os princípios tântricos no cotidiano', '🌱', '25 min', 14, true),
(15, 'O Caminho Contínuo', 'Jornada sem fim', 'Mantendo a prática ao longo da vida', '♾️', '20 min', 15, true)
ON CONFLICT (id) DO NOTHING;

-- Função para calcular nível do usuário baseado no progresso
CREATE OR REPLACE FUNCTION public.calculate_user_level(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    completed_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO completed_count
    FROM public.user_progress
    WHERE user_id = user_uuid AND is_completed = true;
    
    IF completed_count >= 10 THEN
        RETURN 'avancado';
    ELSIF completed_count >= 4 THEN
        RETURN 'praticante';
    ELSE
        RETURN 'iniciante';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar estatísticas do perfil quando progresso muda
CREATE OR REPLACE FUNCTION public.update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar contagem de capítulos completados
    UPDATE public.profiles 
    SET 
        total_completed_chapters = (
            SELECT COUNT(*) 
            FROM public.user_progress 
            WHERE user_id = NEW.user_id AND is_completed = true
        ),
        level = public.calculate_user_level(NEW.user_id),
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar estatísticas do perfil
CREATE TRIGGER update_profile_stats_trigger
    AFTER INSERT OR UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE PROCEDURE public.update_profile_stats();
