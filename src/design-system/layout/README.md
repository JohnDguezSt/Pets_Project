# Primitivas de maquetación (nivel 0)

Resuelven el espacio entre elementos para que ninguna pantalla haga rejillas a mano (doc. 16 §8). No conocen el producto y no tienen apariencia propia: ni color, ni borde, ni fondo.

| Primitiva | Propósito | Propiedades |
| --- | --- | --- |
| `Stack` | Hijos en columna con separación constante | `gap`, `as` |
| `Cluster` | Hijos en fila que pasan a la línea siguiente (botones, etiquetas) | `gap`, `align`, `justify`, `as` |
| `Grid` | Tantas columnas como quepan con un ancho mínimo; sin media queries | `min`, `gap`, `as` |
| `Container` | Centra, limita el ancho y aplica el margen lateral seguro | `width`, `as` |

**Valores cerrados.** `gap` admite `none | xs | sm | md | lg | xl | section` y se traduce a tokens semánticos de espaciado. No hay valores libres: si falta uno, se añade a la escala, no a la pantalla.

**Semántica.** `as` elige la etiqueta HTML correcta (`ul`, `nav`, `section`…). La primitiva no cambia el rol: una lista sigue siendo una lista.

**Densidad.** Las separaciones se adaptan solas dentro de un contenedor con `data-density="compact"`.

**Cuándo no usarlas.** Para la disposición interna de un componente con estructura propia (por ejemplo, una tarjeta), el componente define su propio CSS Module.

**Accesibilidad.** No añaden roles ni foco. El orden visual coincide siempre con el orden del código.
