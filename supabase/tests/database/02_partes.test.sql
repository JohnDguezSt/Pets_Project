-- Partes: alta automática al crear la cuenta, saneamiento de metadatos y
-- aislamiento entre personas.
begin;
select plan(12);

insert into auth.users (id, email, raw_user_meta_data) values
  ('a0000000-0000-4000-8000-00000000000a', 'ana@example.test',
   '{"display_name": "  Ana  ", "time_zone": "America/Mazatlan"}'),
  ('b0000000-0000-4000-8000-00000000000b', 'beto@example.test',
   jsonb_build_object('display_name', E'Be\u0007to' || repeat('x', 100), 'time_zone', 'Marte/Olympus')),
  ('c0000000-0000-4000-8000-00000000000c', 'cata@example.test', '{}');

-- Alta automática y saneamiento (como postgres).
select results_eq(
  $$ select display_name, time_zone, locale from public.parties
     where user_id = 'a0000000-0000-4000-8000-00000000000a' $$,
  $$ values ('Ana'::text, 'America/Mazatlan'::text, 'es-MX'::text) $$,
  'La cuenta nueva crea su parte con nombre recortado y zona válida'
);
select results_eq(
  $$ select char_length(display_name), display_name !~ '[[:cntrl:]]', time_zone from public.parties
     where user_id = 'b0000000-0000-4000-8000-00000000000b' $$,
  $$ values (80, true, null::text) $$,
  'Metadatos hostiles: sin caracteres de control, máximo 80, zona inválida descartada'
);
select results_eq(
  $$ select display_name, time_zone from public.parties
     where user_id = 'c0000000-0000-4000-8000-00000000000c' $$,
  $$ values (null::text, null::text) $$,
  'Sin metadatos: nombre y zona quedan sin indicar (nulo)'
);

-- Como Ana.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "a0000000-0000-4000-8000-00000000000a", "role": "authenticated"}', true);

select results_eq(
  $$ select count(*)::int from public.parties $$,
  $$ values (1) $$,
  'Ana solo ve su propia parte'
);

select lives_ok(
  $$ update public.parties set display_name = 'Ana María', time_zone = 'America/Tijuana' $$,
  'Ana edita su nombre y su zona horaria'
);

select throws_ok(
  $$ update public.parties set time_zone = 'America/Ciudad_Inventada' $$,
  '22023', null,
  'Una zona horaria inexistente se rechaza'
);

select throws_ok(
  $$ update public.parties set user_id = 'b0000000-0000-4000-8000-00000000000b' $$,
  '42501', null,
  'Ana no puede reasignar su parte a otra cuenta'
);

select throws_ok(
  $$ update public.parties set kind = 'organization' $$,
  '42501', null,
  'Ana no puede cambiar el tipo de parte'
);

select throws_ok(
  $$ insert into public.parties (display_name) values ('Intrusa') $$,
  '42501', null,
  'Ana no puede crear partes directamente'
);

select throws_ok(
  $$ delete from public.parties $$,
  '42501', null,
  'Ana no puede borrar partes'
);

-- Intentar editar la parte de Beto no afecta ninguna fila.
update public.parties set display_name = 'Hackeado'
where user_id = 'b0000000-0000-4000-8000-00000000000b';

reset role;

select isnt(
  (select display_name from public.parties where user_id = 'b0000000-0000-4000-8000-00000000000b'),
  'Hackeado',
  'Ana no puede editar la parte de Beto'
);
select is(
  (select time_zone from public.parties where user_id = 'a0000000-0000-4000-8000-00000000000a'),
  'America/Tijuana',
  'La edición válida de Ana se guardó'
);

select * from finish();
rollback;
