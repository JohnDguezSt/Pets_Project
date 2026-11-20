import type { ReactNode } from "react";
import { getMessages } from "@/i18n";
import { Icon } from "../../icons";
import styles from "./FormField.module.css";

/** Atributos que FormField entrega al control para enlazarlo con su etiqueta, ayuda y error. */
export type FieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  required?: boolean;
};

type FormFieldProps = {
  /** id del control. Debe ser único en la página. */
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Por defecto los campos son opcionales y lo dicen; los obligatorios no llevan marca. */
  required?: boolean;
  /** Recibe los atributos de accesibilidad y devuelve el control (Input, Select…). */
  children: (control: FieldControlProps) => ReactNode;
};

/**
 * Etiqueta visible + ayuda + control + error, asociados entre sí.
 * Las reglas de validación NO viven aquí: están en el esquema de cada
 * funcionalidad (doc. 16 §4).
 */
export function FormField({ id, label, hint, error, required = false, children }: FormFieldProps) {
  const t = getMessages().ui;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required ? null : <span className={styles.optional}> ({t.optional})</span>}
      </label>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        required: required || undefined,
      })}
      {error ? (
        <p id={errorId} className={styles.error}>
          <Icon name="danger" size="sm" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
