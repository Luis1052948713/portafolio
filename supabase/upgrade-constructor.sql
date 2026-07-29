-- ================================================================
-- ACTUALIZACIÓN: CONSTRUCTOR COMPLETO DEL PORTAFOLIO
-- Ejecutar una vez en Supabase > SQL Editor, después de setup.sql.
-- ================================================================

create table if not exists public.portfolio_site (
  id smallint primary key default 1 check (id = 1),
  borrador jsonb not null default '{}'::jsonb,
  publicado jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

insert into public.portfolio_site (id) values (1)
on conflict (id) do nothing;

alter table public.portfolio_site enable row level security;
revoke all on public.portfolio_site from anon;
grant select, update on public.portfolio_site to authenticated;

drop policy if exists "Administradores gestionan constructor" on public.portfolio_site;
create policy "Administradores gestionan constructor"
on public.portfolio_site for select
to authenticated
using ((select public.is_portfolio_admin()));

drop policy if exists "Administradores actualizan constructor" on public.portfolio_site;
create policy "Administradores actualizan constructor"
on public.portfolio_site for update
to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

create or replace function public.obtener_portafolio_publicado()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select publicado from public.portfolio_site where id = 1;
$$;

revoke all on function public.obtener_portafolio_publicado() from public;
grant execute on function public.obtener_portafolio_publicado() to anon, authenticated;

create or replace function public.publicar_portafolio(nuevos_datos jsonb)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  fecha_publicacion timestamptz := now();
begin
  if not (select public.is_portfolio_admin()) then
    raise exception 'No autorizado';
  end if;

  update public.portfolio_site
  set borrador = nuevos_datos,
      publicado = nuevos_datos,
      updated_by = (select auth.uid()),
      updated_at = fecha_publicacion,
      published_at = fecha_publicacion
  where id = 1;

  return fecha_publicacion;
end;
$$;

revoke all on function public.publicar_portafolio(jsonb) from public;
grant execute on function public.publicar_portafolio(jsonb) to authenticated;

update storage.buckets
set public = true,
    file_size_limit = 52428800,
    allowed_mime_types = array[
      'application/pdf',
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm', 'video/quicktime'
    ]
where id = 'portafolio';