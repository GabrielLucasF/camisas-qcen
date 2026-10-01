-- =======================================================================
-- QCEN: SCHEMA SEGURO DO BANCO DE DADOS SUPABASE (TABELA DE PEDIDOS)
-- =======================================================================
-- POLÍTICA DE SEGURANÇA MÁXIMA (ZERO TRUST / LGPD / DEFESA CONTRA SPAM):
-- 1. Todas as requisições públicas (novos pedidos) e administrativas (painel)
--    são mediadas exclusivamente pelas rotas /api do servidor Next.js.
-- 2. O acesso direto da chave pública (anon) ao Supabase REST API é 100% BLOQUEADO.
--    Isso impede que atacantes utilizem a anon_key para:
--    - Raspar nomes e números de WhatsApp (violação da LGPD).
--    - Contornar o rate limiting e o honeypot do Next.js via scripts cURL.
--    - Inundar a tabela com milhões de pedidos falsos (DoS de armazenamento).
-- 3. Apenas o backend Next.js autenticado com SUPABASE_SERVICE_ROLE_KEY tem
--    permissão de leitura e escrita.
-- =======================================================================

create table if not exists public.orders (
  id text primary key,
  person_name text not null,
  whatsapp text,
  payment_method text,
  items jsonb not null default '[]'::jsonb,
  status text not null default 'pending', -- 'pending', 'half', 'paid'
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (RLS) obrigatório
alter table public.orders enable row level security;

-- 1. REMOVER POLÍTICAS ANTIGAS OU INSEGURAS
drop policy if exists "Permitir leitura de pedidos" on public.orders;
drop policy if exists "Permitir atualizacao de pedidos" on public.orders;
drop policy if exists "Permitir exclusao de pedidos" on public.orders;
drop policy if exists "Permitir insercao de pedidos" on public.orders;
drop policy if exists "Permitir insercao segura de pedidos" on public.orders;
drop policy if exists "Acesso completo exclusivo para service_role" on public.orders;
drop policy if exists "Acesso exclusivo service_role via backend Next.js" on public.orders;

-- 2. REVOGAR TODOS OS PRIVILÉGIOS DIRETOS DE USUÁRIOS ANÔNIMOS E NÃO-ADMINISTRATIVOS
revoke all on public.orders from anon;
revoke all on public.orders from authenticated;

-- 3. POLÍTICA DE ACESSO EXCLUSIVO PARA O BACKEND (service_role)
-- O backend Next.js possui rate limiting, honeypot, sanitização e validação de tamanho de itens.
create policy "Acesso exclusivo service_role via backend Next.js"
on public.orders
to service_role
using (true)
with check (true);

-- 4. Garantir índices de performance para consultas por data e status
create index if not exists idx_orders_created_at on public.orders (created_at desc);
create index if not exists idx_orders_status on public.orders (status);
