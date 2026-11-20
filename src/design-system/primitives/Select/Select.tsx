import type { ReactNode, SelectHTMLAttributes } from "react";
import { Icon } from "../../icons";
import styles from "./Select.module.css";

type SelectProps = { children: ReactNode } & Omit<SelectHTMLAttributes<HTMLSelectElement>, "style" | "size" | "multiple">;

/**
 * Selector nativo de una opción. Las opciones son `<option>` hijos.
 * Se usa dentro de FormField. El estado de error lo indica `aria-invalid`.
 */
export function Select({ className, children, ...rest }: SelectProps) {
  return (
    <span className={className ? `${styles.wrapper} ${className}` : styles.wrapper}>
      <select {...rest} className={styles.select}>
        {children}
      </select>
      <Icon name="chevronDown" size="sm" className={styles.chevron} />
    </span>
  );
}
