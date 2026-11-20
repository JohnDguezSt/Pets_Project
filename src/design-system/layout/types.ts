import type { HTMLAttributes } from "react";

/** Escala cerrada de separaciones. Se traduce a tokens semánticos de espaciado. */
export type Space = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "section";

/** Etiquetas HTML permitidas para las primitivas: siempre la semántica correcta. */
export type LayoutElement =
  | "div"
  | "section"
  | "article"
  | "aside"
  | "header"
  | "footer"
  | "main"
  | "nav"
  | "ul"
  | "ol"
  | "li"
  | "form"
  | "fieldset";

/**
 * Atributos HTML comunes que aceptan las primitivas. `style` queda fuera:
 * los valores visuales salen siempre de los tokens.
 */
export type LayoutAttributes = Omit<HTMLAttributes<HTMLElement>, "style">;
