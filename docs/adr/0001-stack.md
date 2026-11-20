# ADR 0001 — Stack del frontend

**Fecha:** 17 de noviembre de 2026 · **Estado:** aprobada

## Decisión

Next.js (App Router) con TypeScript estricto, desplegado en Vercel, con Supabase como backend. Estilos con CSS nativo, capas de cascada, CSS Modules y tokens en variables CSS.

## Motivos

- Integración directa con Vercel y con la sesión de Supabase en el servidor.
- Produce HTML y CSS reales, requisito del doc. 16 y de la decisión 4 del doc. 5.
- Autorización revalidada en el servidor en cada escritura (Server Actions).
- Ecosistema con biblioteca *headless* accesible madura (React Aria) para cuando haga falta.

## Alternativa descartada

SvelteKit: estilos con ámbito aún más simples, pero un ecosistema de comportamiento accesible menos maduro.

## Consecuencias

- Sin gestor de estado global ni ORM. Las dependencias nuevas se justifican una por una.
- La seguridad no depende de la interfaz: RLS en la base y comprobaciones en el servidor.
