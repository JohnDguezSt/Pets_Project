# RadioGroup

**Propósito:** elegir una sola opción entre pocas (hasta 5–6), todas visibles. Ej.: sexo del animal, «sí / no / no sé».

| Propiedad | Tipo |
| --- | --- |
| `id`, `name` | texto (obligatorios) |
| `legend` | la pregunta visible |
| `options` | `{ value, label, hint? }[]` |
| `defaultValue`, `hint`, `error`, `required`, `disabled` | opcionales |
| `orientation` | `vertical` (por defecto) · `horizontal` |

**Estados:** normal, foco, seleccionado, error (icono + texto), deshabilitado.

**Accesibilidad:** `fieldset` + `legend` nativos; radios nativos (flechas para moverse). Ayuda y error asociados con `aria-describedby`. Cada opción ocupa al menos 44 px de alto. «No sé» se ofrece como opción explícita cuando aplica (doc. 2: desconocido no es vacío).

**Cuándo no usarlo:** con muchas opciones (Select) o para elegir varias (Checkbox, cuando haga falta).
