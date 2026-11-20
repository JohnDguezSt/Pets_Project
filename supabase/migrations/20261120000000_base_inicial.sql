-- =============================================================================
-- Paso 2 — Base de datos del primer hito
--
-- Tablas: parties, care_groups, taxa, animals, bonds.
-- Principios (docs. 2 y 7, precisiones aprobadas el 17 nov 2026):
--   * La responsabilidad sobre un animal vive en `bonds`; el animal no tiene dueño.
--   * Nulo = "no se preguntó"; 'unknown' = "la persona no lo sabe".
--   * Fechas parciales: fecha + precisión. Instantes en UTC (timestamptz).
--   * Identificadores UUID aleatorios.
--   * Mínimo privilegio: nada es accesible salvo lo que se concede aquí.
--   * El alta de un animal solo ocurre mediante public.create_animal().
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Privilegios por defecto
-- Supabase concede por defecto privilegios amplios a anon y authenticated sobre
-- lo que se crea en `public`. Se retiran para que cada tabla o función nueva
-- necesite una concesión explícita.
-- -----------------------------------------------------------------------------
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on functions from anon, authenticated;

-- Esquema no expuesto por la API para funciones auxiliares.
create schema private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- -----------------------------------------------------------------------------
-- 1. Tipos
-- -----------------------------------------------------------------------------
create type public.party_kind as enum ('person', 'organization');
create type public.bond_kind as enum (
  'tutor', 'co_tutor', 'caregiver', 'temporary_custody', 'rescuer', 'shelter', 'adopter'
);
create type public.bond_status as enum ('proposed', 'active', 'disputed', 'ended');
create type public.bond_origin as enum ('creation', 'invitation', 'transfer', 'claim');
create type public.animal_sex as enum ('female', 'male', 'unknown');
create type public.tri_state as enum ('yes', 'no', 'unknown');
create type public.date_precision as enum ('day', 'month', 'year');
create type public.taxon_certainty as enum ('certain', 'uncertain');
create type public.animal_status as enum ('active', 'deceased', 'archived');
create type public.taxon_rank as enum (
  'kingdom', 'class', 'order', 'suborder', 'family', 'subfamily', 'genus', 'species', 'subspecies'
);

-- -----------------------------------------------------------------------------
-- 2. Partes (personas; organizaciones más adelante)
-- -----------------------------------------------------------------------------
create table public.parties (
  id uuid primary key default gen_random_uuid(),
  kind public.party_kind not null default 'person',
  -- Si se borra la cuenta, la parte se conserva sin acceso (historial de vínculos).
  user_id uuid unique references auth.users (id) on delete set null,
  display_name text,
  time_zone text,
  locale text not null default 'es-MX',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Primer hito: solo personas.
  constraint parties_kind_person_only check (kind = 'person'),
  constraint parties_display_name_valid check (
    display_name is null
    or (
      display_name = btrim(display_name)
      and char_length(display_name) between 1 and 80
      and display_name !~ '[[:cntrl:]]'
    )
  ),
  constraint parties_locale_supported check (locale in ('es-MX'))
);

comment on table public.parties is
  'Persona u organización que puede tener vínculos con animales. Primer hito: solo personas.';
comment on column public.parties.time_zone is
  'Zona IANA de la persona (p. ej. America/Mazatlan). Nulo = no indicada.';

-- -----------------------------------------------------------------------------
-- 3. Catálogo: grupos de cuidado y taxones
-- -----------------------------------------------------------------------------
create table public.care_groups (
  slug text primary key check (slug ~ '^[a-z][a-z0-9_]*$'),
  name_es text not null check (char_length(name_es) between 1 and 60),
  sort_order smallint not null
);

create table public.taxa (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z][a-z0-9_]*$'),
  parent_id uuid references public.taxa (id),
  rank public.taxon_rank not null,
  common_name_es text not null check (char_length(common_name_es) between 1 and 80),
  scientific_name text check (scientific_name is null or char_length(scientific_name) between 1 and 120),
  care_group text not null references public.care_groups (slug),
  is_quick_pick boolean not null default false,
  sort_order smallint not null default 100,
  catalog_version smallint not null default 1,
  constraint taxa_not_own_parent check (parent_id is null or parent_id <> id)
);

create index taxa_parent_id_idx on public.taxa (parent_id);
create index taxa_care_group_idx on public.taxa (care_group);

comment on table public.taxa is
  'Catálogo jerárquico de especies y grupos. Datos de referencia, no de personas.';

-- -----------------------------------------------------------------------------
-- 4. Animales (sin campo de dueño)
-- -----------------------------------------------------------------------------
create table public.animals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  taxon_id uuid not null references public.taxa (id),
  taxon_certainty public.taxon_certainty not null default 'certain',
  sex public.animal_sex,
  birth_date date,
  birth_date_precision public.date_precision,
  sterilized public.tri_state,
  status public.animal_status not null default 'active',
  schema_version smallint not null default 1,
  created_by uuid not null references public.parties (id),
  created_at timestamptz not null default now(),
  updated_by uuid references public.parties (id),
  updated_at timestamptz not null default now(),
  constraint animals_name_valid check (
    name = btrim(name)
    and char_length(name) between 1 and 60
    and name !~ '[[:cntrl:]]'
  ),
  constraint animals_birth_date_pair check ((birth_date is null) = (birth_date_precision is null)),
  constraint animals_birth_date_normalized check (
    birth_date is null
    or birth_date_precision = 'day'
    or (birth_date_precision = 'month' and extract(day from birth_date) = 1)
    or (birth_date_precision = 'year' and extract(day from birth_date) = 1 and extract(month from birth_date) = 1)
  ),
  constraint animals_birth_date_floor check (birth_date is null or birth_date >= date '1900-01-01')
);

create index animals_taxon_id_idx on public.animals (taxon_id);
create index animals_created_by_idx on public.animals (created_by);
create index animals_updated_by_idx on public.animals (updated_by);

comment on column public.animals.sex is 'Nulo = no se preguntó; unknown = la persona no lo sabe.';
comment on column public.animals.sterilized is 'Nulo = no se preguntó; unknown = la persona no lo sabe.';
comment on column public.animals.birth_date is
  'Fecha normalizada según la precisión: mes → día 1; año → 1 de enero.';

-- -----------------------------------------------------------------------------
-- 5. Vínculos parte ↔ animal
-- -----------------------------------------------------------------------------
create table public.bonds (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.parties (id),
  animal_id uuid not null references public.animals (id),
  kind public.bond_kind not null,
  status public.bond_status not null,
  origin public.bond_origin not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  expires_at timestamptz,
  end_reason text,
  created_by uuid references public.parties (id),
  created_at timestamptz not null default now(),
  constraint bonds_ended_has_end check ((status = 'ended') = (ends_at is not null)),
  constraint bonds_end_after_start check (ends_at is null or ends_at >= starts_at),
  constraint bonds_expiry_after_start check (expires_at is null or expires_at > starts_at),
  constraint bonds_end_reason_valid check (
    end_reason is null
    or (status = 'ended' and char_length(end_reason) between 1 and 200)
  )
);

-- Un mismo tipo de vínculo vigente por parte y animal.
create unique index bonds_one_open_per_kind_idx
  on public.bonds (party_id, animal_id, kind)
  where status <> 'ended';
create index bonds_party_active_idx on public.bonds (party_id) where status = 'active';
create index bonds_animal_id_idx on public.bonds (animal_id);
create index bonds_created_by_idx on public.bonds (created_by);

-- -----------------------------------------------------------------------------
-- 6. Funciones auxiliares (esquema private, no expuesto por la API)
-- -----------------------------------------------------------------------------

-- Parte de la persona autenticada. SECURITY DEFINER para no depender de RLS
-- dentro de las políticas; solo devuelve la fila de quien llama.
create function private.current_party_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.id from public.parties p where p.user_id = (select auth.uid());
$$;

-- ¿La persona autenticada tiene un vínculo vigente con el animal?
-- p_kinds nulo = cualquier tipo de vínculo.
create function private.has_active_bond(p_animal_id uuid, p_kinds public.bond_kind[] default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.bonds b
    join public.parties p on p.id = b.party_id
    where b.animal_id = p_animal_id
      and p.user_id = (select auth.uid())
      and b.status = 'active'
      and (b.expires_at is null or b.expires_at > now())
      and (p_kinds is null or b.kind = any (p_kinds))
  );
$$;

create function private.is_valid_time_zone(p_tz text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (select 1 from pg_catalog.pg_timezone_names where name = p_tz);
$$;

revoke all on function private.current_party_id() from public;
revoke all on function private.has_active_bond(uuid, public.bond_kind[]) from public;
revoke all on function private.is_valid_time_zone(text) from public;
grant execute on function private.current_party_id() to authenticated;
grant execute on function private.has_active_bond(uuid, public.bond_kind[]) to authenticated;
grant execute on function private.is_valid_time_zone(text) to authenticated;

-- -----------------------------------------------------------------------------
-- 7. Disparadores
-- -----------------------------------------------------------------------------

-- Crea la parte de cada cuenta nueva. Los metadatos los controla quien se
-- registra: se sanean y, si no son válidos, se descartan.
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
  v_tz text;
begin
  v_name := left(
    btrim(regexp_replace(coalesce(new.raw_user_meta_data ->> 'display_name', ''), '[[:cntrl:]]', '', 'g')),
    80
  );
  v_name := nullif(btrim(v_name), '');

  v_tz := new.raw_user_meta_data ->> 'time_zone';
  if v_tz is not null and not private.is_valid_time_zone(v_tz) then
    v_tz := null;
  end if;

  insert into public.parties (kind, user_id, display_name, time_zone)
  values ('person', new.id, v_name, v_tz);

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Partes: validar zona horaria y sellar updated_at.
create function private.parties_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.time_zone is not null and not private.is_valid_time_zone(new.time_zone) then
    raise exception 'Zona horaria no válida: %', new.time_zone
      using errcode = '22023';
  end if;
  if tg_op = 'UPDATE' then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

revoke all on function private.parties_before_write() from public;

create trigger parties_before_write
  before insert or update on public.parties
  for each row execute function private.parties_before_write();

-- Animales: normalizar nombre y fecha parcial, rechazar fechas futuras,
-- sellar autoría de la última edición.
create function private.animals_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.name := btrim(new.name);

  if new.birth_date is not null then
    if new.birth_date_precision = 'month' then
      new.birth_date := date_trunc('month', new.birth_date)::date;
    elsif new.birth_date_precision = 'year' then
      new.birth_date := date_trunc('year', new.birth_date)::date;
    end if;

    -- El día más adelantado del planeta (UTC+14): ninguna persona puede
    -- registrar un nacimiento posterior a su "hoy".
    if new.birth_date > (now() at time zone 'Pacific/Kiritimati')::date then
      raise exception 'La fecha de nacimiento no puede estar en el futuro'
        using errcode = '22008';
    end if;
  end if;

  if tg_op = 'UPDATE' then
    new.updated_at := now();
    new.updated_by := private.current_party_id();
  end if;

  return new;
end;
$$;

revoke all on function private.animals_before_write() from public;

create trigger animals_before_write
  before insert or update on public.animals
  for each row execute function private.animals_before_write();

-- -----------------------------------------------------------------------------
-- 8. Alta atómica de un animal
-- La identidad sale de auth.uid(); no se acepta el identificador del tutor.
-- SECURITY DEFINER es necesario porque las personas no tienen permiso de
-- INSERT sobre animals ni bonds: esta función es el único camino de alta.
-- -----------------------------------------------------------------------------
create function public.create_animal(
  p_name text,
  p_taxon_id uuid,
  p_taxon_certainty public.taxon_certainty default 'certain',
  p_sex public.animal_sex default null,
  p_birth_date date default null,
  p_birth_date_precision public.date_precision default null,
  p_sterilized public.tri_state default null
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_party uuid;
  v_animal uuid;
begin
  v_party := private.current_party_id();
  if v_party is null then
    raise exception 'Se requiere una sesión válida'
      using errcode = '42501';
  end if;

  insert into public.animals (
    name, taxon_id, taxon_certainty, sex,
    birth_date, birth_date_precision, sterilized, created_by
  )
  values (
    p_name, p_taxon_id, coalesce(p_taxon_certainty, 'certain'), p_sex,
    p_birth_date, p_birth_date_precision, p_sterilized, v_party
  )
  returning id into v_animal;

  insert into public.bonds (party_id, animal_id, kind, status, origin, created_by)
  values (v_party, v_animal, 'tutor', 'active', 'creation', v_party);

  return v_animal;
end;
$$;

comment on function public.create_animal is
  'Registra un animal y el vínculo tutor/activo de la persona autenticada en una sola transacción.';

revoke all on function public.create_animal(
  text, uuid, public.taxon_certainty, public.animal_sex, date, public.date_precision, public.tri_state
) from public, anon, authenticated;
grant execute on function public.create_animal(
  text, uuid, public.taxon_certainty, public.animal_sex, date, public.date_precision, public.tri_state
) to authenticated;

-- -----------------------------------------------------------------------------
-- 9. Privilegios de tabla (mínimos) y RLS
-- -----------------------------------------------------------------------------
revoke all on public.parties, public.care_groups, public.taxa, public.animals, public.bonds
  from anon, authenticated;

alter table public.parties enable row level security;
alter table public.care_groups enable row level security;
alter table public.taxa enable row level security;
alter table public.animals enable row level security;
alter table public.bonds enable row level security;

-- Partes: cada persona ve y edita solo la suya, y solo columnas de perfil.
grant select on public.parties to authenticated;
grant update (display_name, time_zone, locale) on public.parties to authenticated;

create policy parties_select_own on public.parties
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy parties_update_own on public.parties
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Catálogo: lectura para personas autenticadas.
grant select on public.care_groups, public.taxa to authenticated;

create policy care_groups_select on public.care_groups
  for select to authenticated using (true);

create policy taxa_select on public.taxa
  for select to authenticated using (true);

-- Animales: lectura con cualquier vínculo vigente; edición solo como tutor.
-- Sin INSERT (solo create_animal) ni DELETE.
grant select on public.animals to authenticated;
grant update (
  name, taxon_id, taxon_certainty, sex, birth_date, birth_date_precision, sterilized
) on public.animals to authenticated;

create policy animals_select_bonded on public.animals
  for select to authenticated
  using (private.has_active_bond(id));

create policy animals_update_tutor on public.animals
  for update to authenticated
  using (private.has_active_bond(id, array['tutor']::public.bond_kind[]))
  with check (private.has_active_bond(id, array['tutor']::public.bond_kind[]));

-- Vínculos: cada persona ve solo los suyos. Sin escritura directa.
grant select on public.bonds to authenticated;

create policy bonds_select_own on public.bonds
  for select to authenticated
  using (party_id = (select private.current_party_id()));

-- -----------------------------------------------------------------------------
-- 10. Catálogo inicial (datos de referencia, no personales)
-- -----------------------------------------------------------------------------
insert into public.care_groups (slug, name_es, sort_order) values
  ('perros', 'Perros', 10),
  ('gatos', 'Gatos', 20),
  ('pequenos_mamiferos', 'Pequeños mamíferos', 30),
  ('aves', 'Aves', 40),
  ('reptiles', 'Reptiles', 50),
  ('anfibios', 'Anfibios', 60),
  ('peces', 'Peces', 70),
  ('equinos', 'Caballos y burros', 80),
  ('granja', 'Animales de granja', 90),
  ('otros', 'Otros', 100);

-- Grupos amplios primero (para elegir cuando no se conoce la especie).
insert into public.taxa (slug, rank, common_name_es, scientific_name, care_group, is_quick_pick, sort_order) values
  ('animal', 'kingdom', 'Otro animal', 'Animalia', 'otros', true, 900),
  ('mamifero', 'class', 'Mamífero (otro)', 'Mammalia', 'otros', false, 500),
  ('ave', 'class', 'Ave (otra)', 'Aves', 'aves', true, 400),
  ('reptil', 'class', 'Reptil (otro)', 'Reptilia', 'reptiles', true, 600),
  ('anfibio', 'class', 'Anfibio (otro)', 'Amphibia', 'anfibios', false, 700),
  ('pez', 'class', 'Pez (otro)', 'Actinopterygii', 'peces', true, 800);

update public.taxa c set parent_id = (select id from public.taxa where slug = 'animal')
where c.slug in ('mamifero', 'ave', 'reptil', 'anfibio', 'pez');

insert into public.taxa (slug, parent_id, rank, common_name_es, scientific_name, care_group, is_quick_pick, sort_order)
select v.slug, p.id, v.rank::public.taxon_rank, v.common_name_es, v.scientific_name, v.care_group, v.is_quick_pick, v.sort_order
from (values
  ('perro', 'mamifero', 'species', 'Perro', 'Canis familiaris', 'perros', true, 10),
  ('gato', 'mamifero', 'species', 'Gato', 'Felis catus', 'gatos', true, 20),
  ('conejo', 'mamifero', 'species', 'Conejo', 'Oryctolagus cuniculus', 'pequenos_mamiferos', true, 30),
  ('hamster', 'mamifero', 'subfamily', 'Hámster', 'Cricetinae', 'pequenos_mamiferos', false, 40),
  ('cobaya', 'mamifero', 'species', 'Cobaya (cuyo)', 'Cavia porcellus', 'pequenos_mamiferos', false, 50),
  ('huron', 'mamifero', 'species', 'Hurón', 'Mustela furo', 'pequenos_mamiferos', false, 60),
  ('chinchilla', 'mamifero', 'species', 'Chinchilla', 'Chinchilla lanigera', 'pequenos_mamiferos', false, 70),
  ('jerbo', 'mamifero', 'species', 'Jerbo', 'Meriones unguiculatus', 'pequenos_mamiferos', false, 80),
  ('raton', 'mamifero', 'species', 'Ratón', 'Mus musculus', 'pequenos_mamiferos', false, 90),
  ('rata', 'mamifero', 'species', 'Rata', 'Rattus norvegicus', 'pequenos_mamiferos', false, 100),
  ('erizo_africano', 'mamifero', 'species', 'Erizo africano', 'Atelerix albiventris', 'pequenos_mamiferos', false, 110),
  ('caballo', 'mamifero', 'species', 'Caballo', 'Equus caballus', 'equinos', false, 200),
  ('burro', 'mamifero', 'species', 'Burro', 'Equus asinus', 'equinos', false, 210),
  ('cabra', 'mamifero', 'species', 'Cabra', 'Capra hircus', 'granja', false, 300),
  ('borrego', 'mamifero', 'species', 'Borrego', 'Ovis aries', 'granja', false, 310),
  ('cerdo', 'mamifero', 'species', 'Cerdo', 'Sus domesticus', 'granja', false, 320),
  ('vaca', 'mamifero', 'species', 'Vaca', 'Bos taurus', 'granja', false, 330),
  ('perico_australiano', 'ave', 'species', 'Perico australiano', 'Melopsittacus undulatus', 'aves', false, 410),
  ('ninfa', 'ave', 'species', 'Ninfa (cacatúa ninfa)', 'Nymphicus hollandicus', 'aves', false, 420),
  ('canario', 'ave', 'species', 'Canario', 'Serinus canaria', 'aves', false, 430),
  ('gallina', 'ave', 'subspecies', 'Gallina', 'Gallus gallus domesticus', 'granja', false, 440),
  ('tortuga', 'reptil', 'order', 'Tortuga', 'Testudines', 'reptiles', false, 610),
  ('serpiente', 'reptil', 'suborder', 'Serpiente', 'Serpentes', 'reptiles', false, 620),
  ('iguana_verde', 'reptil', 'species', 'Iguana verde', 'Iguana iguana', 'reptiles', false, 630),
  ('gecko_leopardo', 'reptil', 'species', 'Gecko leopardo', 'Eublepharis macularius', 'reptiles', false, 640),
  ('ajolote', 'anfibio', 'species', 'Ajolote', 'Ambystoma mexicanum', 'anfibios', false, 710),
  ('pez_dorado', 'pez', 'species', 'Pez dorado', 'Carassius auratus', 'peces', false, 810),
  ('betta', 'pez', 'species', 'Pez betta', 'Betta splendens', 'peces', false, 820)
) as v (slug, parent_slug, rank, common_name_es, scientific_name, care_group, is_quick_pick, sort_order)
join public.taxa p on p.slug = v.parent_slug;
