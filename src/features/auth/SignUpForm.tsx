"use client";

import { useActionState, useEffect, useRef } from "react";
import { Stack } from "@/design-system/layout";
import { getMessages } from "@/i18n";
import { signUp } from "./actions";
import { initialAuthFormState } from "./form-state";
import { FormMessage } from "./FormMessage";
import { EmailField, PasswordField } from "./Fields";
import { SubmitButton } from "./SubmitButton";
import { useFocusResult } from "./useFocusResult";

export function SignUpForm() {
  const t = getMessages().auth.signUp;
  const [state, action] = useActionState(signUp, initialAuthFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const timeZoneRef = useRef<HTMLInputElement>(null);
  useFocusResult(formRef, state);

  // La zona horaria sale del navegador (p. ej. America/Mazatlan). Sin JavaScript
  // queda vacía y la persona podrá elegirla después.
  useEffect(() => {
    if (timeZoneRef.current) {
      timeZoneRef.current.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
  }, []);

  if (state.status === "success") {
    return (
      <div ref={(node) => node?.focus()} tabIndex={-1}>
        <FormMessage state={state} successTitle={t.sentTitle} />
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} noValidate>
      <Stack gap="md">
        <FormMessage state={state} />
        <input ref={timeZoneRef} type="hidden" name="time_zone" defaultValue="" />
        <EmailField error={state.fieldErrors?.email} defaultValue={state.values?.email} />
        <PasswordField kind="new" error={state.fieldErrors?.password} />
        <div>
          <SubmitButton pendingLabel={t.submitting}>{t.submit}</SubmitButton>
        </div>
      </Stack>
    </form>
  );
}
