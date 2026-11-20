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

## Terminado

- **Paso 1 — Cimientos:** reglas automáticas (TypeScript estricto, límites de importación entre capas, Stylelint que solo admite tokens), tokens base y semánticos, capas de estilos, primitivas de maquetación (`Stack`, `Cluster`, `Grid`, `Container`), textos en `es-MX`, manifest de la PWA, Inicio con el estado honesto de la alfa y CI.

## Pendiente (en orden)

1. **Paso 1b:** componentes atómicos del hito (Button, Input, Select, RadioGroup, FormField, Alert, EmptyState, Card) y catálogo interno.
2. **Paso 2:** base de datos y RLS con pruebas de acceso cruzado.
3. **Paso 3:** autenticación.
4. **Pasos 4–7:** Mis mascotas, alta, perfil y edición, fotografía.
5. **Paso 8:** cierre (accesibilidad manual, lista del doc. 20 §19).

## Fuera del primer hito

Microchip e identificadores externos, tratamientos, comunidad, adopciones, publicidad, GPS, LunaPay, *service worker* y modo sin conexión.
