-- Privilegios y configuración segura del esquema.
-- Estas pruebas recorren todo el esquema: una tabla o función nueva que olvide
-- RLS, search_path o permisos mínimos las hace fallar.
begin;
select plan(14);

-- RLS activa en todas las tablas expuestas.
select is_empty(
  $$ select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity $$,
  'Todas las tablas de public tienen RLS activa'
);

-- anon no tiene ningún privilegio sobre tablas de public.
select is_empty(
  $$ select table_name, privilege_type from information_schema.role_table_grants
     where table_schema = 'public' and grantee = 'anon' $$,
  'anon no tiene privilegios sobre tablas de public'
);

-- authenticated solo lee (y edita columnas concretas); nunca inserta, borra ni trunca.
select is_empty(
  $$ select table_name, privilege_type from information_schema.role_table_grants
     where table_schema = 'public' and grantee = 'authenticated'
       and privilege_type not in ('SELECT') $$,
  'authenticated solo tiene SELECT a nivel de tabla'
);

select bag_eq(
  $$ select table_name::text, column_name::text from information_schema.column_privileges
     where table_schema = 'public' and grantee = 'authenticated' and privilege_type = 'UPDATE' $$,
  $$ values
       ('parties', 'display_name'), ('parties', 'time_zone'), ('parties', 'locale'),
       ('animals', 'name'), ('animals', 'taxon_id'), ('animals', 'taxon_certainty'),
       ('animals', 'sex'), ('animals', 'birth_date'), ('animals', 'birth_date_precision'),
       ('animals', 'sterilized') $$,
  'authenticated solo puede editar las columnas de perfil previstas'
);

-- Nadie fuera de postgres puede crear objetos en public ni en private
-- (evita secuestro de search_path).
select ok(not has_schema_privilege('authenticated', 'public', 'CREATE'), 'authenticated no crea objetos en public');
select ok(not has_schema_privilege('anon', 'public', 'CREATE'), 'anon no crea objetos en public');
select ok(not has_schema_privilege('authenticated', 'private', 'CREATE'), 'authenticated no crea objetos en private');
select ok(not has_schema_privilege('anon', 'private', 'USAGE'), 'anon no usa el esquema private');

-- Toda función SECURITY DEFINER propia fija search_path vacío.
select is_empty(
  $$ select n.nspname || '.' || p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname in ('public', 'private') and p.prosecdef
       and not coalesce(p.proconfig @> array['search_path=""'], false) $$,
  'Las funciones SECURITY DEFINER fijan search_path vacío'
);

-- Solo create_animal es ejecutable por personas desde la API (public).
select bag_eq(
  $$ select p.proname::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and has_function_privilege('authenticated', p.oid, 'EXECUTE') $$,
  $$ values ('create_animal') $$,
  'authenticated solo ejecuta create_animal en public'
);

select is_empty(
  $$ select n.nspname || '.' || p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname in ('public', 'private') and has_function_privilege('anon', p.oid, 'EXECUTE') $$,
  'anon no ejecuta ninguna función propia'
);

select ok(
  not has_function_privilege('authenticated', 'private.handle_new_user()', 'EXECUTE'),
  'authenticated no ejecuta el disparador de alta de cuentas'
);

-- anon: sin acceso real (no solo en catálogo).
set local role anon;
select throws_ok(
  $$ select * from public.animals $$, '42501', null,
  'anon no puede leer animales'
);
select throws_ok(
  $$ select public.create_animal('Luna', (select id from public.taxa limit 1)) $$, '42501', null,
  'anon no puede ejecutar create_animal'
);
reset role;

select * from finish();
rollback;
