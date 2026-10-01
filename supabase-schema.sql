-- =======================================================================
-- QCEN: SCHEMA DO BANCO DE DADOS SUPABASE (TABELA DE PEDIDOS)
-- =======================================================================
-- Como usar:
-- 1. Acesse seu painel no Supabase (https://supabase.com/dashboard)
-- 2. No menu lateral, clique em "SQL Editor"
-- 3. Cole este script e clique em "Run" (Executar)
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

-- Habilitar Row Level Security (RLS)
alter table public.orders enable row level security;

-- Política de Leitura Pública
drop policy if exists "Permitir leitura de pedidos" on public.orders;
create policy "Permitir leitura de pedidos"
on public.orders for select
using (true);

-- Política de Inserção Pública (qualquer jovem pode enviar seu pedido)
drop policy if exists "Permitir insercao de pedidos" on public.orders;
create policy "Permitir insercao de pedidos"
on public.orders for insert
with check (true);

-- Política de Atualização (Líder pode atualizar status e dados)
drop policy if exists "Permitir atualizacao de pedidos" on public.orders;
create policy "Permitir atualizacao de pedidos"
on public.orders for update
using (true);

-- Política de Exclusão (Líder pode apagar pedidos)
drop policy if exists "Permitir exclusao de pedidos" on public.orders;
create policy "Permitir exclusao de pedidos"
on public.orders for delete
using (true);

-- Habilitar Realtime para a tabela orders
alter publication supabase_realtime add table public.orders;
