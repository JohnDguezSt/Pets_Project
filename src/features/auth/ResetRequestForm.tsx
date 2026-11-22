"use client";

import { useActionState, useRef } from "react";
import { Stack } from "@/design-system/layout";
import { getMessages } from "@/i18n";
import { requestPasswordReset } from "./actions";
import { initialAuthFormState } from "./form-state";
import { FormMessage } from "@/features/forms/FormMessage";
import { EmailField } from "./Fields";
import { SubmitButton } from "@/features/forms/SubmitButton";
import { useFocusResult } from "@/features/forms/useFocusResult";

export function ResetRequestForm() {
  const t = getMessages().auth.reset;
  const [state, action] = useActionState(requestPasswordReset, initialAuthFormState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusResult(formRef, state);

  return (
    <form ref={formRef} action={action} noValidate>
      <Stack gap="md">
        <FormMessage state={state} successTitle={t.sentTitle} />
        <EmailField error={state.fieldErrors?.email} defaultValue={state.values?.email} />
        <div>
          <SubmitButton pendingLabel={t.submitting}>{t.submit}</SubmitButton>
        </div>
      </Stack>
    </form>
  );
}
