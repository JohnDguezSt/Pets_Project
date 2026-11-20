import type { ElementType, ReactNode } from "react";
import type { LayoutAttributes, LayoutElement, Space } from "./types";
import styles from "./Grid.module.css";

type GridProps = {
  /** Ancho mínimo de cada celda; la rejilla decide cuántas columnas caben. */
  min?: "sm" | "md" | "lg";
  gap?: Space;
  as?: LayoutElement;
  children: ReactNode;
} & LayoutAttributes;

/**
 * Rejilla adaptable sin media queries: tantas columnas como quepan con el
 * ancho mínimo indicado. En móvil queda en una columna de forma natural.
 */
export function Grid({ min = "md", gap = "md", as = "div", className, children, ...rest }: GridProps) {
  const Tag: ElementType = as;
  return (
    <Tag
      {...rest}
      className={className ? `${styles.grid} ${className}` : styles.grid}
      data-min={min}
      data-gap={gap}
    >
      {children}
    </Tag>
  );
}
