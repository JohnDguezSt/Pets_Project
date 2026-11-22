# Button

**Propósito:** ejecutar una acción. Para navegar a otra página se usa un enlace, no un botón.

| Propiedad | Valores | Por defecto |
| --- | --- | --- |
| `variant` | `primary` · `secondary` · `ghost` · `danger` | `primary` |
| `size` | `sm` · `md` | `md` |
| `loading` | `boolean` | `false` |
| `loadingLabel` | texto | «Cargando…» |
| `type` | `button` · `submit` · `reset` | `button` |

**Cuándo usar cada variante:** `primary`, una sola por vista; `secondary`, acciones alternativas; `ghost`, acciones de poco peso (cancelar); `danger`, acciones irreversibles, siempre acompañadas de un diálogo de confirmación.

**Estados:** normal, hover (solo con puntero), foco (anillo global), deshabilitado, carga (`aria-busy`, deshabilitado y texto de carga visible).

**Accesibilidad:** `<button>` nativo; nombre accesible = su texto. `md` mide 44 px de alto para acciones principales en móvil; `sm` mide 36 px (mínimo WCAG: 24 px). Un botón con solo icono no se hace con este componente.

**Cuándo no usarlo:** para enlaces, para un botón con solo icono, ni para «favoritos» con corazón.

## ButtonLink

Enlace de Next.js con el aspecto de Button, para cuando la acción principal lleva a otra página («Registrar mascota»). Variantes `primary`, `secondary` y `ghost`; no hay `danger` ni `loading`, porque navegar no es una acción irreversible ni se queda esperando.
