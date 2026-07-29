-- ================================================================
-- REGISTRO, RECUPERACIÓN Y APROBACIÓN DE USUARIOS
-- Ejecutar una vez en Supabase > SQL Editor.
-- Requiere setup.sql.
-- ================================================================

create table if not exists public.portfolio_access_requests (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  estado text not null default 'pendiente' check (estado in ('pendiente','aprobado','rechazado')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

alter table public.portfolio_access_requests enable row level security;
grant select on public.portfolio_access_requests to authenticated;

drop policy if exists "Usuarios leen su solicitud" on public.portfolio_access_requests;
create policy "Usuarios leen su solicitud"
on public.portfolio_access_requests for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Administradores leen solicitudes" on public.portfolio_access_requests;
create policy "Administradores leen solicitudes"
on public.portfolio_access_requests for select
to authenticated
using ((select public.is_portfolio_admin()));

create or replace function private.registrar_solicitud_portafolio()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.portfolio_access_requests (user_id,email)
  values (new.id,coalesce(new.email,''))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists usuario_portafolio_nuevo on auth.users;
create trigger usuario_portafolio_nuevo
after insert on auth.users
for each row execute function private.registrar_solicitud_portafolio();

-- Incluye usuarios creados antes de instalar esta actualización.
insert into public.portfolio_access_requests (user_id,email,estado)
select u.id,coalesce(u.email,''),case when a.user_id is not null then 'aprobado' else 'pendiente' end
from auth.users u
left join private.portfolio_admins a on a.user_id = u.id
on conflict (user_id) do nothing;

create or replace function public.revisar_solicitud_portafolio(usuario uuid, aprobar boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select public.is_portfolio_admin()) then raise exception 'No autorizado'; end if;
  if aprobar then
    insert into private.portfolio_admins(user_id) values (usuario) on conflict do nothing;
    update public.portfolio_access_requests set estado='aprobado',reviewed_at=now(),reviewed_by=(select auth.uid()) where user_id=usuario;
  else
    delete from private.portfolio_admins where user_id=usuario and user_id <> (select auth.uid());
    update public.portfolio_access_requests set estado='rechazado',reviewed_at=now(),reviewed_by=(select auth.uid()) where user_id=usuario;
  end if;
end;
$$;

revoke all on function public.revisar_solicitud_portafolio(uuid,boolean) from public;
grant execute on function public.revisar_solicitud_portafolio(uuid,boolean) to authenticated;