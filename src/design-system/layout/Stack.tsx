import type { ElementType, ReactNode } from "react";
import type { LayoutAttributes, LayoutElement, Space } from "./types";
import styles from "./Stack.module.css";

type StackProps = {
  /** Separación vertical entre hijos. Por defecto, `md`. */
  gap?: Space;
  as?: LayoutElement;
  children: ReactNode;
} & LayoutAttributes;

/** Pila vertical: hijos uno debajo de otro con separación constante. */
export function Stack({ gap = "md", as = "div", className, children, ...rest }: StackProps) {
  const Tag: ElementType = as;
  return (
    <Tag {...rest} className={className ? `${styles.stack} ${className}` : styles.stack} data-gap={gap}>
      {children}
    </Tag>
  );
}
