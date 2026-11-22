"use client";

import { type ReactNode, useActionState, useRef } from "react";
import { Stack } from "@/design-system/layout";
import { getMessages } from "@/i18n";
import { signIn } from "./actions";
import { initialAuthFormState } from "./form-state";
import { FormMessage } from "@/features/forms/FormMessage";
import { EmailField, PasswordField } from "./Fields";
import { SubmitButton } from "@/features/forms/SubmitButton";
import { useFocusResult } from "@/features/forms/useFocusResult";

/**
 * `extra` va dentro del formulario (p. ej. el campo oculto «siguiente», que
 * depende de la URL y llega en streaming). El formulario en sí no se
 * reemplaza, para no borrar lo que la persona ya escribió.
 */
export function SignInForm({ extra }: { extra?: ReactNode }) {
  const t = getMessages().auth.signIn;
  const [state, action] = useActionState(signIn, initialAuthFormState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusResult(formRef, state);

  return (
    <form ref={formRef} action={action} noValidate>
      <Stack gap="md">
        <FormMessage state={state} />
        {extra}
        <EmailField error={state.fieldErrors?.email} defaultValue={state.values?.email} />
        <PasswordField kind="current" error={state.fieldErrors?.password} />
        <div>
          <SubmitButton pendingLabel={t.submitting}>{t.submit}</SubmitButton>
        </div>
      </Stack>
    </form>
  );
}
