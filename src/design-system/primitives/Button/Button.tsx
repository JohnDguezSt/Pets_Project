import type { ButtonHTMLAttributes, ReactNode } from "react";
import { getMessages } from "@/i18n";
import styles from "./Button.module.css";

type ButtonProps = {
  /** primary: la acción principal (una por vista). danger: acciones irreversibles, siempre con ConfirmDialog. */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  /** Muestra el indicador de carga y bloquea el botón mientras dura la acción. */
  loading?: boolean;
  /** Texto durante la carga, por ejemplo «Guardando…». Por defecto, «Cargando…». */
  loadingLabel?: string;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style">;

/** Botón nativo con variantes cerradas. `type` es "button" salvo que se indique "submit". */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingLabel,
  type = "button",
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={className ? `${styles.button} ${className}` : styles.button}
      data-variant={variant}
      data-size={size}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <>
          <span className={styles.spinner} aria-hidden="true" />
          {loadingLabel ?? getMessages().ui.loading}
        </>
      ) : (
        children
      )}
    </button>
  );
}
