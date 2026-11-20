import type { ElementType, HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

type CardProps = {
  /** Etiqueta HTML: `article` para contenido independiente (un animal), `li` dentro de listas. */
  as?: "div" | "article" | "section" | "li";
  padding?: "sm" | "md";
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "style">;

/**
 * Superficie: fondo, borde, radio y relleno. Nada más (doc. 16 §4).
 * AnimalCard y similares la componen; no se añaden variantes por dominio.
 */
export function Card({ as = "div", padding = "md", className, children, ...rest }: CardProps) {
  const Tag: ElementType = as;
  return (
    <Tag {...rest} className={className ? `${styles.card} ${className}` : styles.card} data-padding={padding}>
      {children}
    </Tag>
  );
}
