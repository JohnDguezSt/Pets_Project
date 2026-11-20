import type { ElementType, ReactNode } from "react";
import type { LayoutAttributes, LayoutElement } from "./types";
import styles from "./Container.module.css";

type ContainerProps = {
  /** `content`: ancho máximo de página. `reading`: ancho cómodo de lectura (60–75 caracteres). */
  width?: "content" | "reading";
  as?: LayoutElement;
  children: ReactNode;
} & LayoutAttributes;

/** Centra el contenido, limita su ancho y aplica el margen lateral de la página. */
export function Container({ width = "content", as = "div", className, children, ...rest }: ContainerProps) {
  const Tag: ElementType = as;
  return (
    <Tag
      {...rest}
      className={className ? `${styles.container} ${className}` : styles.container}
      data-width={width}
    >
      {children}
    </Tag>
  );
}
