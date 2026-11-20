# Estado del proyecto

Lista breve de decisiones técnicas, trabajo terminado y pendientes. Se actualiza en cada pull request.

## Decisiones técnicas

| Decisión | Estado | Referencia |
| --- | --- | --- |
| Next.js (App Router) + TypeScript estricto, desplegado en Vercel | Aprobada 17 nov 2026 | [ADR 0001](adr/0001-stack.md) |
| Supabase (PostgreSQL, Auth, Storage) como backend | Aprobada | Instrucciones del proyecto |
| CSS nativo + `@layer` + CSS Modules + tokens; sin Tailwind | Aprobada (R22-8) | Doc. 16 §6 |
| Tema claro y oscuro con `light-dark()` y `color-scheme`, sin duplicar tokens | Implementada | `src/design-system/tokens/semantic.css` |
| Paleta, tipografía y radios provisionales y neutros | Provisional hasta la marca (R24-1, R24-2, R24-4) | Doc. 20 §20 |
| Idioma `es-MX`; zona horaria por persona; instantes en UTC | Aprobada | Precisión 3 |
| Server Components por defecto; Client Components cuando la interacción lo justifique | Aprobada | Precisión 2 |
| Repositorio público: nunca secretos ni datos reales | Decisión del 17 nov 2026 | — |
| Supabase "Pets Platform" (us-west-2) = desarrollo; producción será otro proyecto | Aprobada | Precisión 7 |
| Migraciones nunca automáticas: integración GitHub de Supabase sin despliegue automático | Aplicada | — |
| Componentes sobre elementos HTML nativos; sin biblioteca *headless* hasta el primer Dialog o ComboBox | Aplicada | Doc. 16 §7 |
| Pruebas de accesibilidad automáticas con Playwright + axe (WCAG 2.2 AA) en la CI | Aplicada | Doc. 16 §11 |
| Catálogo interno `/dev/catalogo` solo en desarrollo y vistas previas | Aplicada | Doc. 16 §10 |
| Responsabilidad en `bonds`; el animal no tiene campo de dueño | Implementada | Docs. 2 y 7 |
| Alta solo con `create_animal()` (atómica, identidad por `auth.uid()`, `SECURITY DEFINER` con `search_path` vacío y EXECUTE solo para `authenticated`) | Implementada | Precisión 1 |
| Sin INSERT ni DELETE directos para personas; UPDATE solo en columnas de perfil | Implementada | `supabase/migrations/` |
| Privilegios por defecto retirados en `public`: cada tabla o función nueva necesita concesión explícita | Implementada | `supabase/migrations/` |
| Nulo = "no se preguntó"; `unknown` = "no lo sé". Fechas parciales con precisión | Implementada | Doc. 7 |
| Catálogo de especies (34 taxones, 10 grupos de cuidado) como datos de referencia en la migración | Implementada | Doc. 7 |
| Pruebas pgTAP de permisos y RLS en la CI con base local desechable | Aplicada | Precisión 5 |

## Terminado

- **Paso 1 — Cimientos:** reglas automáticas (TypeScript estricto, límites de importación entre capas, Stylelint que solo admite tokens), tokens base y semánticos, capas de estilos, primitivas de maquetación (`Stack`, `Cluster`, `Grid`, `Container`), textos en `es-MX`, manifest de la PWA, Inicio con el estado honesto de la alfa y CI.

- **Paso 1b — Componentes atómicos:** Button, Input, Select, RadioGroup, Card, FormField, Alert, EmptyState e iconos de estado, cada uno con su ficha. Catálogo interno en claro y oscuro. Pruebas de accesibilidad automáticas (axe en móvil y escritorio, ambos temas), foco visible y campos con error.

- **Paso 2 — Base de datos y permisos:** tablas `parties`, `care_groups`, `taxa`, `animals` y `bonds`; RLS en todas; `create_animal()`; alta automática de la parte al crear la cuenta (metadatos saneados, zona IANA validada); 60 pruebas pgTAP (acceso cruzado, columnas protegidas, datos inválidos, vínculos vencidos o finalizados, privilegios de funciones) y lint del esquema en la CI. Solo local: **la migración aún no se aplica al proyecto de Supabase.**

## Pendiente (en orden)

1. **Aplicar la migración del paso 2 al proyecto de desarrollo de Supabase** (decisión aparte, tras revisar el PR).
2. **Paso 3:** autenticación.
3. **Pasos 4–7:** Mis mascotas, alta, perfil y edición, fotografía.
4. **Paso 8:** cierre (accesibilidad manual, lista del doc. 20 §19).

## Fuera del primer hito

Microchip e identificadores externos, tratamientos, comunidad, adopciones, publicidad, GPS, LunaPay, *service worker* y modo sin conexión.
