import type { ElementType, ReactNode } from "react";
import type { LayoutAttributes, LayoutElement, Space } from "./types";
import styles from "./Cluster.module.css";

type ClusterProps = {
  /** Separación entre hijos. Por defecto, `sm`. */
  gap?: Space;
  /** Alineación vertical de los hijos. */
  align?: "start" | "center" | "end" | "baseline";
  /** Distribución horizontal. `between` separa los extremos (por ejemplo, título y acción). */
  justify?: "start" | "center" | "end" | "between";
  as?: LayoutElement;
  children: ReactNode;
} & LayoutAttributes;

/** Grupo horizontal que pasa a la línea siguiente cuando no cabe (botones, etiquetas). */
export function Cluster({
  gap = "sm",
  align = "center",
  justify = "start",
  as = "div",
  className,
  children,
  ...rest
}: ClusterProps) {
  const Tag: ElementType = as;
  return (
    <Tag
      {...rest}
      className={className ? `${styles.cluster} ${className}` : styles.cluster}
      data-gap={gap}
      data-align={align}
      data-justify={justify}
    >
      {children}
    </Tag>
  );
}
