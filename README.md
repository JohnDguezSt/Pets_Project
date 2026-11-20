# Plataforma de cuidado animal

Web/PWA para el cuidado y la protección de animales. **Nombre provisional.**

> Repositorio público: nunca subas contraseñas, claves ni datos reales. Las variables van en `.env.local` (ignorado por git) y en los ajustes de Vercel y Supabase.

## Requisitos

- Node.js 22 (`.nvmrc`)
- pnpm 10 (`corepack enable`)
- Para la base de datos local: Docker y la [CLI de Supabase](https://supabase.com/docs/guides/local-development/cli/getting-started) 3.x

## Comandos

```bash
pnpm install       # instala dependencias
pnpm dev           # servidor de desarrollo en http://localhost:3000
pnpm check         # lint de código, lint de estilos y tipos
pnpm build         # build de producción
pnpm test:e2e      # accesibilidad en navegador (Playwright + axe)
```

### Base de datos local

Todo corre en una base **local y desechable** (Docker). Estos comandos no tocan ningún proyecto de Supabase en la nube.

```bash
supabase db start  # levanta Postgres local y aplica las migraciones
supabase test db   # pruebas de permisos y RLS (pgTAP)
supabase db lint   # revisión de seguridad y rendimiento del esquema
supabase db reset  # borra la base local y la recrea desde las migraciones
```

Las migraciones viven en `supabase/migrations/` y nunca se aplican solas: aplicar una a un proyecto remoto es una decisión aparte, revisada y aprobada.

## Estructura

```
src/
  app/              rutas y pantallas
  design-system/    tokens, estilos, maquetación, iconos, primitivos y patrones (no conoce el producto)
  i18n/             textos de la interfaz (es-MX)
supabase/
  migrations/       cambios del esquema (SQL), en orden
  tests/database/   pruebas pgTAP de permisos y RLS
docs/
  ESTADO.md         decisiones técnicas, terminado y pendiente
  adr/              registro de decisiones de arquitectura
```

Catálogo de componentes: `pnpm dev` y abre http://localhost:3000/dev/catalogo (también en las vistas previas de Vercel; en producción no existe).

Las carpetas `domain/`, `features/`, `services/` y `server/` se crean cuando el primer paso las necesite.

## Reglas que la CI hace cumplir

- **Solo tokens en el CSS:** colores, píxeles, duraciones y `z-index` escritos a mano fallan fuera de `src/design-system/tokens/`.
- **Capas:** `design-system` no importa nada del producto; `domain` no importa interfaz ni framework.
- **TypeScript estricto**, incluido `noUncheckedIndexedAccess`.
- **Base de datos:** RLS en todas las tablas, `search_path` fijo en funciones `SECURITY DEFINER`, sin permisos para `anon` y solo los privilegios previstos para `authenticated`. Las pruebas recorren todo el esquema, así que una tabla nueva sin RLS hace fallar la CI.

Planificación del producto: documentos 00–22 del proyecto.
