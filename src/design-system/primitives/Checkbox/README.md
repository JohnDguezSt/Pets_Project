# Checkbox

**Propósito:** marcar o desmarcar una opción independiente («No estoy seguro de la especie exacta»). Para elegir una opción entre varias se usa RadioGroup.

| Propiedad | Valores | Por defecto |
| --- | --- | --- |
| `id` | texto único en la página | (obligatorio) |
| `label` | texto visible | (obligatorio) |
| `hint` | aclaración breve | — |

Acepta los atributos nativos de `<input>` (`name`, `defaultChecked`, `disabled`…).

**Accesibilidad:** `<input type="checkbox">` nativo con `<label>` asociada; toda la fila mide al menos el área táctil mínima. La aclaración se enlaza con `aria-describedby`.

**Cuándo no usarlo:** para aceptar términos o para acciones inmediatas (eso es un botón).
