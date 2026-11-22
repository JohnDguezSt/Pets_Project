import type { ReactNode } from "react";
import { Icon } from "../../icons";
import styles from "./RadioGroup.module.css";

export type RadioOption = {
  value: string;
  label: ReactNode;
  /** Aclaración breve debajo de la opción. */
  hint?: ReactNode;
};

type RadioGroupProps = {
  /** Prefijo para los ids internos. Debe ser único en la página. */
  id: string;
  name: string;
  /** Pregunta visible del grupo. */
  legend: ReactNode;
  options: readonly RadioOption[];
  defaultValue?: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
  /** Avisa del valor elegido; solo desde un Client Component (p. ej. para mostrar campos que dependen de él). */
  onValueChange?: (value: string) => void;
};

/** Grupo de opciones excluyentes con radios nativos, agrupados en un fieldset. */
export function RadioGroup({
  id,
  name,
  legend,
  options,
  defaultValue,
  hint,
  error,
  required,
  disabled,
  orientation = "vertical",
  onValueChange,
}: RadioGroupProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <fieldset className={styles.group} disabled={disabled} aria-describedby={describedBy}>
      <legend className={styles.legend}>{legend}</legend>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      <div className={styles.options} data-orientation={orientation}>
        {options.map((option, index) => {
          const optionId = `${id}-${index}`;
          const optionHintId = option.hint ? `${optionId}-hint` : undefined;
          return (
            <div key={option.value} className={styles.option}>
              <input
                id={optionId}
                className={styles.radio}
                type="radio"
                name={name}
                value={option.value}
                defaultChecked={defaultValue === option.value}
                required={required}
                // aria-invalid no aplica a radios; esta marca permite llevar el foco al grupo con error.
                data-invalid={error && index === 0 ? true : undefined}
                onChange={onValueChange ? (event) => onValueChange(event.currentTarget.value) : undefined}
                aria-describedby={[optionHintId, errorId].filter(Boolean).join(" ") || undefined}
              />
              <label htmlFor={optionId} className={styles.label}>
                {option.label}
                {option.hint ? (
                  <span id={optionHintId} className={styles.optionHint}>
                    {option.hint}
                  </span>
                ) : null}
              </label>
            </div>
          );
        })}
      </div>
      {error ? (
        <p id={errorId} className={styles.error}>
          <Icon name="danger" size="sm" />
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
