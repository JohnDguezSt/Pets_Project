# Card

**Propósito:** agrupar contenido sobre una superficie. Es solo superficie: fondo, borde sutil, radio y relleno.

| Propiedad | Valores | Por defecto |
| --- | --- | --- |
| `as` | `div` · `article` · `section` · `li` | `div` |
| `padding` | `sm` · `md` | `md` |

**Reglas:** sin sombra (las sombras son para lo que flota); no anidar tarjetas más de un nivel; las tarjetas de dominio (AnimalCard) componen Card en su `feature` y no añaden variantes aquí.

**Accesibilidad:** no tiene rol propio; la semántica la da `as`. Si toda la tarjeta es un enlace, el enlace va en el título, no envolviendo la tarjeta.
