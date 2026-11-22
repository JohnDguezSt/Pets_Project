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
| Autenticación con correo y contraseña de Supabase Auth, verificación de correo obligatoria; llaves de acceso después | Implementada | Doc. 21, O-03 |
| Sesión en cookies con `@supabase/ssr`; `getClaims()` (verifica la firma) en servidor; solo URL y clave publicable en la app | Implementada | Precisión 1 |
| Proxy de Next renueva la sesión; cada página y Server Action vuelve a verificarla (el proxy no es la única barrera) | Implementada | Doc. Next 16 |
| Confirmación de enlaces por botón (POST) en `/auth/confirmar`. Acepta las plantillas por defecto de Supabase (`code`, mismo navegador) y las propias (`token_hash`, cualquier navegador) | Implementada | — |
| Correo de Supabase y plantillas por defecto (en inglés) mientras no haya SMTP propio; Resend + plantillas en español (`supabase/templates/`) antes de la alfa | Decisión del 22 nov 2026 | — |
| Mismo mensaje exista o no la cuenta (alta y recuperación): no se revela qué correos están registrados | Implementada | — |
| Regreso tras entrar solo a rutas internas (`safeNextPath`) | Implementada | — |
| Cambiar la contraseña cierra todas las sesiones | Implementada | — |
| Las pruebas de navegador solo corren contra Supabase local (la configuración lo impide si no) | Aplicada | Precisión 7 |

## Terminado

- **Paso 1 — Cimientos:** reglas automáticas (TypeScript estricto, límites de importación entre capas, Stylelint que solo admite tokens), tokens base y semánticos, capas de estilos, primitivas de maquetación (`Stack`, `Cluster`, `Grid`, `Container`), textos en `es-MX`, manifest de la PWA, Inicio con el estado honesto de la alfa y CI.

- **Paso 1b — Componentes atómicos:** Button, Input, Select, RadioGroup, Card, FormField, Alert, EmptyState e iconos de estado, cada uno con su ficha. Catálogo interno en claro y oscuro. Pruebas de accesibilidad automáticas (axe en móvil y escritorio, ambos temas), foco visible y campos con error.

- **Paso 2 — Base de datos y permisos:** tablas `parties`, `care_groups`, `taxa`, `animals` y `bonds`; RLS en todas; `create_animal()`; alta automática de la parte al crear la cuenta (metadatos saneados, zona IANA validada); 60 pruebas pgTAP (acceso cruzado, columnas protegidas, datos inválidos, vínculos vencidos o finalizados, privilegios de funciones) y lint del esquema en la CI. **Aplicada al proyecto de desarrollo el 22 nov 2026** (verificado: 5 tablas con RLS, 34 taxones, Advisors sin errores).

- **Paso 3 — Inicio de sesión:** crear cuenta con verificación de correo, entrar, salir, recuperar y cambiar contraseña; zona horaria tomada del navegador; página protegida mínima (`/mis-mascotas`); cabecera según la sesión; correos en español listos para cuando haya SMTP propio. Pruebas de navegador contra Supabase local con correo de prueba (Mailpit), incluidas en la CI.

## Pendiente (en orden)

1. **Configurar Auth en el proyecto de desarrollo y las variables en Vercel** (lo hace la persona, guiada): hecho el 22 nov 2026: URL del sitio, URLs permitidas, confirmación de correo, contraseña mínima de 8 y variables públicas en Vercel. Falta volver a desplegar y probar una cuenta real.
2. **Antes de la alfa:** SMTP propio con Resend (requiere dominio verificado), activar las plantillas en español en local y en el proyecto remoto.
3. **Pasos 4–7:** Mis mascotas, alta, perfil y edición, fotografía.
4. **Paso 8:** cierre (accesibilidad manual, lista del doc. 20 §19).

## Fuera del primer hito

Microchip e identificadores externos, tratamientos, comunidad, adopciones, publicidad, GPS, LunaPay, *service worker* y modo sin conexión.
