# Input

**Propósito:** capturar texto, números, correo o fechas con el control nativo del navegador.

**Propiedades:** las de `<input>` (salvo `style`). `type` por defecto: `text`. Para fechas, `type="date"` nativo (doc. 16 §7).

**Estados:** normal, foco, error (`aria-invalid="true"`, borde grueso de error), deshabilitado.

**Accesibilidad:** siempre dentro de `FormField`, que asocia etiqueta visible, ayuda y error. Texto de 16 px para que iOS no haga zoom. El *placeholder* nunca sustituye a la etiqueta.

**Cuándo no usarlo:** para texto largo (Textarea, cuando haga falta) o para elegir entre pocas opciones (RadioGroup o Select).
