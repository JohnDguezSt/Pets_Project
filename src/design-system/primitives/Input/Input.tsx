import type { InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "style" | "size">;

/**
 * Campo de texto nativo. Se usa dentro de FormField, que le da etiqueta,
 * ayuda y error. El estado de error lo indica `aria-invalid`.
 */
export function Input({ type = "text", className, ...rest }: InputProps) {
  return <input {...rest} type={type} className={className ? `${styles.input} ${className}` : styles.input} />;
}
