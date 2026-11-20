# Alert

**Propósito:** aviso dentro de la página: información, resultado correcto, advertencia o error.

| Propiedad | Valores | Por defecto |
| --- | --- | --- |
| `tone` | `info` · `success` · `warning` · `danger` | `info` |
| `title` | texto breve | — |
| `children` | detalle | — |
| `announce` | `off` · `polite` | `off` |

**Reglas:** icono + texto + color, nunca solo color; sin animación; no se usa para información comercial (doc. 20 §6). Para un resultado de una acción del usuario, `announce="polite"`.

**Accesibilidad:** el tono se lee como texto oculto («Error: …»). Con `announce="polite"` tiene `role="status"` y se anuncia sin interrumpir.

**Cuándo no usarlo:** para errores de un campo (FormField ya los muestra) ni para mensajes efímeros (Toast, cuando exista).
