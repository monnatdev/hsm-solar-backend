create type customer_status as enum (
  'new', 'talking', 'need_quote', 'quoted',
  'survey_scheduled', 'surveyed',
  'install_scheduled', 'installed', 'closed'
);

create type system_type as enum ('on_grid', 'hybrid', 'off_grid');

create table customers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text not null,
  phone text not null,
  email text,
  address text,
  source text,
  status customer_status not null default 'new',
  notes text,
  assigned_to text,
  survey jsonb,
  installation jsonb
);

-- RLS: only authenticated users can access
alter table customers enable row level security;

create policy "authenticated users can do everything"
  on customers for all
  to authenticated
  using (true)
  with check (true);
