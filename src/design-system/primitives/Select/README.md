# Select

**Propósito:** elegir una opción de una lista larga (más de 5–6). Con pocas opciones se prefiere RadioGroup, que las muestra todas.

**Propiedades:** las de `<select>` salvo `style`, `size` y `multiple`. Hijos: `<option>`.

**Estados:** normal, foco, error (`aria-invalid`), deshabilitado.

**Accesibilidad:** control nativo (teclado y lector de pantalla sin trabajo extra). Dentro de `FormField`. La flecha es decorativa.

**Cuándo no usarlo:** para buscar entre muchas especies (SpeciesPicker, cuando exista) o para elegir varias opciones.
