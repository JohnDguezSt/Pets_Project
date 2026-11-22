import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonLinkProps = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "style" | "children">;

/**
 * Enlace con aspecto de botón, para llevar a otra página («Registrar
 * mascota»). Sigue siendo un enlace: se anuncia como tal y abre con Enter.
 */
export function ButtonLink({ variant = "primary", size = "md", className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link
      {...rest}
      className={className ? `${styles.button} ${className}` : styles.button}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </Link>
  );
}
