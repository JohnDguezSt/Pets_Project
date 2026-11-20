-- Animales y vínculos: alta atómica con create_animal(), aislamiento entre
-- personas, columnas protegidas, validación de datos y vínculos vigentes.
begin;
select plan(34);

insert into auth.users (id, email) values
  ('a0000000-0000-4000-8000-00000000000a', 'ana@example.test'),
  ('b0000000-0000-4000-8000-00000000000b', 'beto@example.test');

-- ---------------------------------------------------------------------------
-- Ana registra a Luna.
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "a0000000-0000-4000-8000-00000000000a", "role": "authenticated"}', true);

select lives_ok(
  $$ select set_config('tests.luna', public.create_animal(
       p_name => '  Luna ',
       p_taxon_id => (select id from public.taxa where slug = 'perro'),
       p_sex => 'female',
       p_birth_date => '2023-05-17',
       p_birth_date_precision => 'month',
       p_sterilized => 'unknown'
     )::text, true) $$,
  'Ana registra a Luna con create_animal()'
);

select results_eq(
  $$ select name, sex::text, birth_date, birth_date_precision::text, sterilized::text, taxon_certainty::text
     from public.animals where id = current_setting('tests.luna')::uuid $$,
  $$ values ('Luna'::text, 'female'::text, date '2023-05-01', 'month'::text, 'unknown'::text, 'certain'::text) $$,
  'Ana ve a Luna: nombre recortado, fecha normalizada al mes, "no sé" conservado'
);

select results_eq(
  $$ select b.kind::text, b.status::text, b.origin::text, p.user_id
     from public.bonds b join public.parties p on p.id = b.party_id
     where b.animal_id = current_setting('tests.luna')::uuid $$,
  $$ values ('tutor'::text, 'active'::text, 'creation'::text, 'a0000000-0000-4000-8000-00000000000a'::uuid) $$,
  'El alta crea exactamente un vínculo tutor/activo/creación de Ana'
);

select lives_ok(
  $$ select public.create_animal('Michi', (select id from public.taxa where slug = 'ave'), 'uncertain') $$,
  'Ana registra un ave sin especie conocida (certeza: incierta)'
);

select results_eq(
  $$ select sex, birth_date, sterilized from public.animals where name = 'Michi' $$,
  $$ values (null::public.animal_sex, null::date, null::public.tri_state) $$,
  'Lo no preguntado queda nulo (distinto de "no sé")'
);

-- Edición permitida por la tutora.
select lives_ok(
  $$ update public.animals set name = 'Luna Lunera', sterilized = 'yes'
     where id = current_setting('tests.luna')::uuid $$,
  'La tutora edita el perfil'
);

select results_eq(
  $$ select a.updated_by = p.id from public.animals a, public.parties p
     where a.id = current_setting('tests.luna')::uuid $$,
  $$ values (true) $$,
  'La edición registra quién la hizo'
);

-- Columnas y operaciones prohibidas incluso para la tutora.
select throws_ok(
  $$ update public.animals set created_by = gen_random_uuid() where id = current_setting('tests.luna')::uuid $$,
  '42501', null, 'Nadie cambia created_by'
);
select throws_ok(
  $$ update public.animals set status = 'archived' where id = current_setting('tests.luna')::uuid $$,
  '42501', null, 'El estado no se edita directamente en este hito'
);
select throws_ok(
  $$ insert into public.animals (name, taxon_id, created_by)
     values ('Pirata', (select id from public.taxa where slug = 'gato'), (select id from public.parties)) $$,
  '42501', null, 'No se insertan animales sin create_animal()'
);
select throws_ok(
  $$ delete from public.animals where id = current_setting('tests.luna')::uuid $$,
  '42501', null, 'No se borran animales'
);
select throws_ok(
  $$ insert into public.bonds (party_id, animal_id, kind, status, origin)
     values ((select id from public.parties), current_setting('tests.luna')::uuid, 'co_tutor', 'active', 'claim') $$,
  '42501', null, 'No se crean vínculos directamente'
);
select throws_ok(
  $$ update public.bonds set kind = 'shelter' $$,
  '42501', null, 'No se modifican vínculos directamente'
);
select throws_ok(
  $$ delete from public.bonds $$,
  '42501', null, 'No se borran vínculos directamente'
);

-- Validación de datos.
select throws_ok(
  $$ select public.create_animal('   ', (select id from public.taxa where slug = 'gato')) $$,
  '23514', null, 'Nombre vacío rechazado'
);
select throws_ok(
  $$ select public.create_animal(repeat('a', 61), (select id from public.taxa where slug = 'gato')) $$,
  '23514', null, 'Nombre de 61 caracteres rechazado'
);
select lives_ok(
  $$ select public.create_animal(repeat('a', 60), (select id from public.taxa where slug = 'gato')) $$,
  'Nombre de 60 caracteres aceptado'
);
select throws_ok(
  $$ select public.create_animal(E'Lu\nna', (select id from public.taxa where slug = 'gato')) $$,
  '23514', null, 'Nombre con caracteres de control rechazado'
);
select throws_ok(
  $$ select public.create_animal('Futuro', (select id from public.taxa where slug = 'gato'),
       p_birth_date => (current_date + 3), p_birth_date_precision => 'day') $$,
  '22008', null, 'Fecha de nacimiento futura rechazada'
);
select throws_ok(
  $$ select public.create_animal('Sin precisión', (select id from public.taxa where slug = 'gato'),
       p_birth_date => '2020-01-10') $$,
  '23514', null, 'Fecha sin precisión rechazada'
);
select throws_ok(
  $$ select public.create_animal('Fantasma', gen_random_uuid()) $$,
  '23503', null, 'Taxón inexistente rechazado'
);
select throws_ok(
  $$ update public.animals set birth_date = current_date + 30, birth_date_precision = 'day'
     where id = current_setting('tests.luna')::uuid $$,
  '22008', null, 'La edición tampoco admite fechas futuras'
);

-- ---------------------------------------------------------------------------
-- Beto no ve ni toca lo de Ana.
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub": "b0000000-0000-4000-8000-00000000000b", "role": "authenticated"}', true);

select is_empty(
  $$ select id from public.animals $$,
  'Beto no ve ningún animal de Ana'
);
select is_empty(
  $$ select id from public.animals where id = current_setting('tests.luna')::uuid $$,
  'Beto no lee a Luna aunque conozca su identificador'
);
select is_empty(
  $$ select id from public.bonds $$,
  'Beto no ve vínculos ajenos'
);
select is_empty(
  $$ update public.animals set name = 'Robada' where id = current_setting('tests.luna')::uuid returning id $$,
  'Beto no puede editar a Luna'
);

-- create_animal ignora cualquier intento de suplantar: la identidad sale del token.
select lives_ok(
  $$ select set_config('tests.toby', public.create_animal('Toby', (select id from public.taxa where slug = 'gato'))::text, true) $$,
  'Beto registra a Toby'
);
select results_eq(
  $$ select p.user_id from public.bonds b join public.parties p on p.id = b.party_id
     where b.animal_id = current_setting('tests.toby')::uuid $$,
  $$ values ('b0000000-0000-4000-8000-00000000000b'::uuid) $$,
  'El vínculo de Toby es de Beto'
);

-- Sin identidad válida no hay alta.
select set_config('request.jwt.claims', '{"role": "authenticated"}', true);
select throws_ok(
  $$ select public.create_animal('Anónimo', (select id from public.taxa where slug = 'gato')) $$,
  '42501', null, 'create_animal sin sub en el token falla'
);
select set_config('request.jwt.claims', '{"sub": "dddddddd-0000-4000-8000-00000000000d", "role": "authenticated"}', true);
select throws_ok(
  $$ select public.create_animal('Huérfano', (select id from public.taxa where slug = 'gato')) $$,
  '42501', null, 'create_animal con una cuenta inexistente falla'
);

reset role;

select is(
  (select name from public.animals where id = current_setting('tests.luna')::uuid),
  'Luna Lunera',
  'El intento de Beto no cambió a Luna'
);

-- ---------------------------------------------------------------------------
-- Solo cuentan los vínculos vigentes.
-- ---------------------------------------------------------------------------
update public.bonds
set starts_at = now() - interval '2 days', expires_at = now() - interval '1 day'
where animal_id = current_setting('tests.toby')::uuid;

update public.bonds
set status = 'ended', ends_at = now(), end_reason = 'Prueba'
where animal_id = current_setting('tests.luna')::uuid;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "b0000000-0000-4000-8000-00000000000b", "role": "authenticated"}', true);
select is_empty(
  $$ select id from public.animals where id = current_setting('tests.toby')::uuid $$,
  'Un vínculo vencido ya no da acceso'
);

select set_config('request.jwt.claims', '{"sub": "a0000000-0000-4000-8000-00000000000a", "role": "authenticated"}', true);
select is_empty(
  $$ select id from public.animals where id = current_setting('tests.luna')::uuid $$,
  'Un vínculo finalizado ya no da acceso'
);
select is_empty(
  $$ update public.animals set name = 'Otra vez' where id = current_setting('tests.luna')::uuid returning id $$,
  'Ni permite editar'
);
reset role;

select * from finish();
rollback;
