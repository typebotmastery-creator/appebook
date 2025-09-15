/*
# [Feature] Loja Sensual - Tabela de Produtos
Cria a tabela 'products' para armazenar itens da loja, como ebooks e acessórios.

## Query Description: [Cria uma nova tabela 'products' e a popula com dados de exemplo. Esta operação é segura e não afeta dados existentes.]

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: public.products
- Columns: id, created_at, name, description, price, image_url, product_type, is_active

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes (Adiciona política de SELECT para todos)
*/

-- 1. Criar a tabela de produtos
CREATE TABLE IF NOT EXISTS public.products (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    description text,
    price numeric(10, 2) NOT NULL,
    image_url text,
    product_type text NOT NULL, -- 'ebook' ou 'physical_item'
    is_active boolean NOT NULL DEFAULT true
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Criar política de acesso
-- Permite que todos os usuários (logados ou não) leiam os produtos.
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products"
ON public.products
FOR SELECT
USING (true);

-- 4. Inserir dados de exemplo
INSERT INTO public.products (name, description, price, image_url, product_type) VALUES
('Ebook: A Arte do Toque Consciente', 'Um guia aprofundado sobre massagem sensual e conexão energética. Expanda seus conhecimentos além da jornada principal.', 49.90, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80', 'ebook'),
('Óleo de Massagem Afrodite', 'Uma mistura de óleos essenciais de ylang-ylang, sândalo e jasmim. Perfeito para rituais de massagem e momentos de intimidade.', 89.90, 'https://images.unsplash.com/photo-1599442642598-8b54b1a1c9f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80', 'physical_item'),
('Vela Aromática Chama Interior', 'Vela de cera de soja com aroma de patchouli e canela. Cria uma atmosfera acolhedora e estimulante.', 65.00, 'https://images.unsplash.com/photo-1614036125093-493412500c59?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80', 'physical_item'),
('Kit de Pedras Energéticas', 'Conjunto com quartzo rosa, ametista e cornalina para equilibrar os chakras e a energia do ambiente.', 120.00, 'https://images.unsplash.com/photo-1612781004169-a7a2d1d35f44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80', 'physical_item');
