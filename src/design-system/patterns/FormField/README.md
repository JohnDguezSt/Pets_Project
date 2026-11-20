# FormField

**Propósito:** unir etiqueta visible, ayuda, control y error en un solo bloque accesible.

```tsx
<FormField id="nombre" label="Nombre" required hint="Como lo llamas en casa" error={errores.nombre}>
  {(control) => <Input {...control} name="nombre" autoComplete="off" />}
</FormField>
```

| Propiedad | Tipo |
| --- | --- |
| `id` | id del control (obligatorio) |
| `label` | etiqueta visible (obligatoria) |
| `hint`, `error` | texto opcional |
| `required` | `false` por defecto: los opcionales muestran «(opcional)» |
| `children` | función que recibe `id`, `aria-describedby`, `aria-invalid`, `required` |

**Reglas:** la validación vive en el esquema de cada funcionalidad, no aquí. El error se muestra con icono y texto, nunca solo con color. Para grupos de opciones se usa RadioGroup, que trae su propio `fieldset`.

**Accesibilidad:** `<label for>` visible siempre; ayuda y error enlazados con `aria-describedby`; `aria-invalid` cuando hay error.
