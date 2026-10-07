create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  mode text not null,
  destination text not null,
  service_date date not null default current_date,
  service_time text not null default '',
  notes text not null default '',
  special_needs text not null default '',
  status text not null default 'PENDIENTE'
    check (status in ('PENDIENTE', 'ASIGNADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO')),
  pin text not null,
  created_at timestamptz not null default now()
);

create index if not exists service_requests_user_created_idx
  on public.service_requests (user_id, created_at desc);

alter table public.service_requests enable row level security;

grant select, insert, update on public.service_requests to authenticated;

drop policy if exists "Users can read their service requests" on public.service_requests;
create policy "Users can read their service requests"
  on public.service_requests
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their service requests" on public.service_requests;
create policy "Users can create their service requests"
  on public.service_requests
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their service requests" on public.service_requests;
create policy "Users can update their service requests"
  on public.service_requests
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
