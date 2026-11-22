/** Resultado de un formulario de autenticación, compartido entre servidor y cliente. */
export type AuthFormState = {
  status: "idle" | "error" | "success";
  /** Mensaje general (error o confirmación). */
  message?: string;
  fieldErrors?: Partial<Record<"email" | "password", string>>;
  /** Valores para volver a mostrar. Nunca incluye contraseñas. */
  values?: { email?: string };
};

export const initialAuthFormState: AuthFormState = { status: "idle" };
