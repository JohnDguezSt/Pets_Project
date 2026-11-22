import { Alert } from "@/design-system/patterns";

/** Lo mínimo que necesita: el estado del envío y su mensaje general. */
export type FormResult = { status: "idle" | "error" | "success"; message?: string };

/** Mensaje general del formulario; recibe el foco tras enviar (ver useFocusResult). */
export function FormMessage({ state, successTitle }: { state: FormResult; successTitle?: string }) {
  if (state.status === "idle" || !state.message) return null;
  return (
    <div data-form-message tabIndex={-1}>
      {state.status === "success" ? (
        <Alert tone="success" title={successTitle} announce="polite">
          {state.message}
        </Alert>
      ) : (
        <Alert tone="danger" title={state.message} announce="polite" />
      )}
    </div>
  );
}
