import { useId } from "react";
import { FormField } from "@/design-system/patterns";
import { Input } from "@/design-system/primitives";
import { getMessages } from "@/i18n";

export function EmailField({ error, defaultValue }: { error?: string; defaultValue?: string }) {
  const t = getMessages().auth.fields;
  // Único por formulario: Next conserva ocultas las páginas visitadas (p. ej. Entrar y Crear cuenta).
  const id = `${useId()}email`;
  return (
    <FormField id={id} label={t.email} error={error} required>
      {(control) => (
        <Input
          {...control}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          autoCapitalize="none"
          maxLength={254}
          defaultValue={defaultValue}
        />
      )}
    </FormField>
  );
}

export function PasswordField({
  error,
  kind,
  label,
}: {
  error?: string;
  label?: string;
  /** `current` al entrar; `new` al crear o cambiar la contraseña. */
  kind: "current" | "new";
}) {
  const t = getMessages().auth.fields;
  const id = `${useId()}password`;
  return (
    <FormField
      id={id}
      label={label ?? t.password}
      hint={kind === "new" ? t.passwordHint : undefined}
      error={error}
      required
    >
      {(control) => (
        <Input
          {...control}
          name="password"
          type="password"
          autoComplete={kind === "new" ? "new-password" : "current-password"}
          minLength={kind === "new" ? 8 : undefined}
        />
      )}
    </FormField>
  );
}
