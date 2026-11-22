"use client";

import { useActionState, useRef } from "react";
import { Stack } from "@/design-system/layout";
import { getMessages } from "@/i18n";
import { signIn } from "./actions";
import { initialAuthFormState } from "./form-state";
import { FormMessage } from "./FormMessage";
import { EmailField, PasswordField } from "./Fields";
import { SubmitButton } from "./SubmitButton";
import { useFocusResult } from "./useFocusResult";

export function SignInForm({ next }: { next?: string }) {
  const t = getMessages().auth.signIn;
  const [state, action] = useActionState(signIn, initialAuthFormState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusResult(formRef, state);

  return (
    <form ref={formRef} action={action} noValidate>
      <Stack gap="md">
        <FormMessage state={state} />
        {next ? <input type="hidden" name="siguiente" value={next} /> : null}
        <EmailField error={state.fieldErrors?.email} defaultValue={state.values?.email} />
        <PasswordField kind="current" error={state.fieldErrors?.password} />
        <div>
          <SubmitButton pendingLabel={t.submitting}>{t.submit}</SubmitButton>
        </div>
      </Stack>
    </form>
  );
}
