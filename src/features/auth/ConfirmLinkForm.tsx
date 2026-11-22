"use client";

import { useActionState, useRef } from "react";
import { Stack } from "@/design-system/layout";
import { getMessages } from "@/i18n";
import { confirmEmailLink } from "./actions";
import { initialAuthFormState } from "./form-state";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";
import { useFocusResult } from "./useFocusResult";

export function ConfirmLinkForm({ tokenHash, type }: { tokenHash: string; type: "email" | "recovery" }) {
  const t = getMessages().auth.confirm;
  const [state, action] = useActionState(confirmEmailLink, initialAuthFormState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusResult(formRef, state);

  return (
    <form ref={formRef} action={action}>
      <Stack gap="md">
        <FormMessage state={state} />
        <p>{type === "recovery" ? t.recoveryIntro : t.emailIntro}</p>
        <input type="hidden" name="token_hash" value={tokenHash} />
        <input type="hidden" name="type" value={type} />
        <div>
          <SubmitButton pendingLabel={t.submitting}>{t.submit}</SubmitButton>
        </div>
      </Stack>
    </form>
  );
}
