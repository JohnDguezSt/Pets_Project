"use client";

import { useActionState, useRef } from "react";
import { Stack } from "@/design-system/layout";
import { getMessages } from "@/i18n";
import { updatePassword } from "./actions";
import { initialAuthFormState } from "./form-state";
import { FormMessage } from "./FormMessage";
import { PasswordField } from "./Fields";
import { SubmitButton } from "./SubmitButton";
import { useFocusResult } from "./useFocusResult";

export function NewPasswordForm() {
  const t = getMessages().auth;
  const [state, action] = useActionState(updatePassword, initialAuthFormState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusResult(formRef, state);

  return (
    <form ref={formRef} action={action} noValidate>
      <Stack gap="md">
        <FormMessage state={state} />
        <PasswordField kind="new" label={t.fields.newPassword} error={state.fieldErrors?.password} />
        <div>
          <SubmitButton pendingLabel={t.newPassword.submitting}>{t.newPassword.submit}</SubmitButton>
        </div>
      </Stack>
    </form>
  );
}
