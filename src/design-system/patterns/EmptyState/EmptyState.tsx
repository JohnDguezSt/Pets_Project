import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

type EmptyStateProps = {
  title: ReactNode;
  description?: ReactNode;
  /** La única acción que orienta el siguiente paso (normalmente un Button). */
  action?: ReactNode;
  /** Nivel del título dentro de la página. */
  headingLevel?: 2 | 3;
};

/**
 * Estado vacío honesto: explica qué falta y ofrece una acción.
 * Sin contenido de relleno ni actividad simulada (doc. 20 §5).
 */
export function EmptyState({ title, description, action, headingLevel = 2 }: EmptyStateProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className={styles.empty}>
      <Heading className={styles.title}>{title}</Heading>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
