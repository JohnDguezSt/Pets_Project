"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/design-system/primitives";

/** Botón de envío que muestra el estado de carga mientras la acción corre. */
export function SubmitButton({ children, pendingLabel }: { children: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} loadingLabel={pendingLabel}>
      {children}
    </Button>
  );
}
