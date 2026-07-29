-- ================================================================
-- PORTAFOLIOS AISLADOS POR USUARIO
-- Ejecutar después de setup.sql, upgrade-constructor.sql y upgrade-usuarios.sql.
-- ================================================================

create table if not exists public.portfolio_sites (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  borrador jsonb not null default '{}'::jsonb,
  publicado jsonb,
  principal boolean not null default false,
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create unique index if not exists portfolio_sites_un_solo_principal
on public.portfolio_sites(principal) where principal = true;

-- Migra la versión existente de Luis sin eliminar la tabla anterior.
insert into public.portfolio_sites (owner_id,slug,borrador,publicado,principal,updated_at,published_at)
select u.id,'luis-barbosa',coalesce(s.borrador,'{}'::jsonb),s.publicado,true,coalesce(s.updated_at,now()),s.published_at
from auth.users u
left join public.portfolio_site s on s.id=1
where lower(u.email)=lower('luisfernandobarbosaorozco7@gmail.com')
on conflict (owner_id) do update set principal=true;

alter table public.portfolio_sites enable row level security;
revoke all on public.portfolio_sites from anon;
grant select,insert,update on public.portfolio_sites to authenticated;

drop policy if exists "Propietarios leen su portafolio" on public.portfolio_sites;
create policy "Propietarios leen su portafolio"
on public.portfolio_sites for select to authenticated
using (owner_id=(select auth.uid()) and (select public.is_portfolio_admin()));

drop policy if exists "Propietarios crean su portafolio" on public.portfolio_sites;
create policy "Propietarios crean su portafolio"
on public.portfolio_sites for insert to authenticated
with check (owner_id=(select auth.uid()) and principal=false and (select public.is_portfolio_admin()));

drop policy if exists "Propietarios actualizan su portafolio" on public.portfolio_sites;
create policy "Propietarios actualizan su portafolio"
on public.portfolio_sites for update to authenticated
using (owner_id=(select auth.uid()) and (select public.is_portfolio_admin()))
with check (owner_id=(select auth.uid()) and (select public.is_portfolio_admin()));

create or replace function public.obtener_portafolio_publicado()
returns jsonb language sql stable security definer set search_path=''
as $$ select publicado from public.portfolio_sites where principal=true limit 1; $$;
revoke all on function public.obtener_portafolio_publicado() from public;
grant execute on function public.obtener_portafolio_publicado() to anon,authenticated;

create or replace function public.obtener_portafolio_publicado(slug_solicitado text)
returns jsonb language sql stable security definer set search_path=''
as $$ select publicado from public.portfolio_sites where slug=slug_solicitado limit 1; $$;
revoke all on function public.obtener_portafolio_publicado(text) from public;
grant execute on function public.obtener_portafolio_publicado(text) to anon,authenticated;

create or replace function public.publicar_portafolio(nuevos_datos jsonb)
returns timestamptz language plpgsql security definer set search_path=''
as $$
declare fecha timestamptz:=now();
begin
  if not (select public.is_portfolio_admin()) then raise exception 'No autorizado'; end if;
  update public.portfolio_sites set borrador=nuevos_datos,publicado=nuevos_datos,updated_at=fecha,published_at=fecha where owner_id=(select auth.uid());
  if not found then raise exception 'No existe un portafolio para este usuario'; end if;
  return fecha;
end; $$;
revoke all on function public.publicar_portafolio(jsonb) from public;
grant execute on function public.publicar_portafolio(jsonb) to authenticated;

-- Cada usuario solo puede modificar archivos dentro de su propia carpeta UUID.
drop policy if exists "Administradores pueden ver archivos" on storage.objects;
drop policy if exists "Administradores pueden subir archivos" on storage.objects;
drop policy if exists "Administradores pueden actualizar archivos" on storage.objects;
drop policy if exists "Administradores pueden eliminar archivos" on storage.objects;

create policy "Propietarios ven sus archivos" on storage.objects for select to authenticated
using (bucket_id='portafolio' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.is_portfolio_admin()));
create policy "Propietarios suben sus archivos" on storage.objects for insert to authenticated
with check (bucket_id='portafolio' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.is_portfolio_admin()));
create policy "Propietarios actualizan sus archivos" on storage.objects for update to authenticated
using (bucket_id='portafolio' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.is_portfolio_admin()))
with check (bucket_id='portafolio' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.is_portfolio_admin()));
create policy "Propietarios eliminan sus archivos" on storage.objects for delete to authenticated
using (bucket_id='portafolio' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.is_portfolio_admin()));