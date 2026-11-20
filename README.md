# Plataforma de cuidado animal

Web/PWA para el cuidado y la protección de animales. **Nombre provisional.**

> Repositorio público: nunca subas contraseñas, claves ni datos reales. Las variables van en `.env.local` (ignorado por git) y en los ajustes de Vercel y Supabase.

## Requisitos

- Node.js 22 (`.nvmrc`)
- pnpm 10 (`corepack enable`)

## Comandos

```bash
pnpm install       # instala dependencias
pnpm dev           # servidor de desarrollo en http://localhost:3000
pnpm check         # lint de código, lint de estilos y tipos
pnpm build         # build de producción
pnpm test:e2e      # accesibilidad en navegador (Playwright + axe)
```

## Estructura

```
src/
  app/              rutas y pantallas
  design-system/    tokens, estilos, maquetación, iconos, primitivos y patrones (no conoce el producto)
  i18n/             textos de la interfaz (es-MX)
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

Planificación del producto: documentos 00–22 del proyecto.
