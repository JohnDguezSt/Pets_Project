"use client";

import { useActionState, useRef } from "react";
import { Stack } from "@/design-system/layout";
import { getMessages } from "@/i18n";
import { confirmEmailLink } from "./actions";
import { initialAuthFormState } from "./form-state";
import { FormMessage } from "@/features/forms/FormMessage";
import { SubmitButton } from "@/features/forms/SubmitButton";
import { useFocusResult } from "@/features/forms/useFocusResult";

type ConfirmLink =
  | { kind: "token"; tokenHash: string; type: "email" | "recovery" }
  | { kind: "code"; code: string; purpose: "alta" | "recuperacion" };

export function ConfirmLinkForm({ link }: { link: ConfirmLink }) {
  const recovery = link.kind === "token" ? link.type === "recovery" : link.purpose === "recuperacion";
  const t = getMessages().auth.confirm;
  const [state, action] = useActionState(confirmEmailLink, initialAuthFormState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusResult(formRef, state);

  return (
    <form ref={formRef} action={action}>
      <Stack gap="md">
        <FormMessage state={state} />
        <p>{recovery ? t.recoveryIntro : t.emailIntro}</p>
        {link.kind === "token" ? (
          <>
            <input type="hidden" name="token_hash" value={link.tokenHash} />
            <input type="hidden" name="type" value={link.type} />
          </>
        ) : (
          <>
            <input type="hidden" name="code" value={link.code} />
            <input type="hidden" name="purpose" value={link.purpose} />
          </>
        )}
        <div>
          <SubmitButton pendingLabel={t.submitting}>{t.submit}</SubmitButton>
        </div>
      </Stack>
    </form>
  );
}
