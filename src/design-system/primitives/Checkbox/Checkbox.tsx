import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Checkbox.module.css";

type CheckboxProps = {
  /** id del control. Debe ser único en la página. */
  id: string;
  label: ReactNode;
  /** Aclaración breve debajo de la etiqueta. */
  hint?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "style" | "type" | "id">;

/** Casilla nativa con su etiqueta visible. Para un sí/no independiente. */
export function Checkbox({ id, label, hint, className, ...rest }: CheckboxProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className={className ? `${styles.option} ${className}` : styles.option}>
      <input {...rest} id={id} type="checkbox" className={styles.checkbox} aria-describedby={hintId} />
      <label htmlFor={id} className={styles.label}>
        {label}
        {hint ? (
          <span id={hintId} className={styles.hint}>
            {hint}
          </span>
        ) : null}
      </label>
    </div>
  );
}
