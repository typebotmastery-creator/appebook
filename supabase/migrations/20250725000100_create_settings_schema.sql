/*
# [Feature] Settings Area Schema
This migration creates the necessary tables to support the new "Settings" area, including user purchase history, support tickets, and legal documents.

## Query Description:
This script adds three new tables (`purchase_history`, `support_tickets`, `legal_documents`) and configures their security policies. It is a non-destructive operation and will not affect existing data. It also inserts placeholder content for the legal documents.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- **Tables Created:**
  - `public.purchase_history`: Stores records of user purchases.
  - `public.support_tickets`: Stores user support requests.
  - `public.legal_documents`: Stores content for privacy policy and terms of use.
- **Indexes Created:**
  - `idx_purchase_history_user_id`
  - `idx_support_tickets_user_id`

## Security Implications:
- RLS Status: Enabled on all new tables.
- Policy Changes: Yes. New policies are added to ensure users can only access their own data in `purchase_history` and `support_tickets`. All authenticated users can read `legal_documents`.
- Auth Requirements: User must be authenticated to interact with these tables.

## Performance Impact:
- Indexes: New indexes are added on `user_id` columns to improve query performance for fetching user-specific data.
- Triggers: No new triggers are added.
- Estimated Impact: Low. The impact on performance is expected to be minimal and positive for the new features.
*/

-- Table for Purchase History
CREATE TABLE IF NOT EXISTS public.purchase_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    purchase_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    price_at_purchase NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed'))
);
COMMENT ON TABLE public.purchase_history IS 'Stores the history of product purchases made by users.';

-- Table for Support Tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL CHECK (char_length(subject) > 0),
    message TEXT NOT NULL CHECK (char_length(message) > 0),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.support_tickets IS 'Stores support requests submitted by users.';

-- Table for Legal Documents
CREATE TABLE IF NOT EXISTS public.legal_documents (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    document_type TEXT NOT NULL UNIQUE CHECK (document_type IN ('privacy_policy', 'terms_of_use')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.legal_documents IS 'Stores content for legal documents like Privacy Policy and Terms of Use.';

-- Enable RLS for new tables
ALTER TABLE public.purchase_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Purchase History
DROP POLICY IF EXISTS "Users can view their own purchase history" ON public.purchase_history;
CREATE POLICY "Users can view their own purchase history"
ON public.purchase_history FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policies for Support Tickets
DROP POLICY IF EXISTS "Users can manage their own support tickets" ON public.support_tickets;
CREATE POLICY "Users can manage their own support tickets"
ON public.support_tickets FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Legal Documents
DROP POLICY IF EXISTS "Authenticated users can read legal documents" ON public.legal_documents;
CREATE POLICY "Authenticated users can read legal documents"
ON public.legal_documents FOR SELECT
TO authenticated
USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_purchase_history_user_id ON public.purchase_history(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);

-- Insert placeholder legal documents
INSERT INTO public.legal_documents (document_type, title, content) VALUES
('privacy_policy', 'Política de Privacidade', '<h1>Política de Privacidade</h1><p>Última atualização: 25 de Julho de 2025</p><p>A sua privacidade é importante para nós. É política do O Toque Tântrico respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no aplicativo O Toque Tântrico, e outros sites que possuímos e operamos.</p><h2>1. Informações que coletamos</h2><p>Coletamos informações que você nos fornece diretamente, como seu nome e e-mail ao se registrar. Também coletamos dados sobre seu progresso no aplicativo, como capítulos concluídos e respostas de exercícios.</p><h2>2. Como usamos as suas informações</h2><p>Usamos as informações que coletamos para operar, manter e fornecer a você os recursos e a funcionalidade do aplicativo, bem como para nos comunicarmos diretamente com você.</p>'),
('terms_of_use', 'Termos de Uso', '<h1>Termos e Condições de Uso</h1><p>Última atualização: 25 de Julho de 2025</p><p>Ao acessar ao aplicativo O Toque Tântrico, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis.</p><h2>1. Uso de Licença</h2><p>É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no aplicativo O Toque Tântrico, apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título.</p><h2>2. Isenção de responsabilidade</h2><p>Os materiais no aplicativo O Toque Tântrico são fornecidos ''como estão''. O Toque Tântrico não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias.</p>')
ON CONFLICT (document_type) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  last_updated = now();
