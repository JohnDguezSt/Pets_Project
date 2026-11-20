import styles from "./Icon.module.css";

/**
 * Iconos del sistema [PROVISIONAL]: trazo simple y coherente con los radios.
 * El conjunto definitivo se elige con la marca (R24-3). Solo existen los que
 * se usan; un icono nuevo se añade aquí, nunca suelto en una pantalla.
 */
const paths = {
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  success: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.5 2.5L16 9.5" />
    </>
  ),
  warning: (
    <>
      <path d="M10.3 4.6 2.9 17.4A2 2 0 0 0 4.6 20.4h14.8a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  danger: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.5h.01" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
} as const;

export type IconName = keyof typeof paths;

type IconProps = {
  name: IconName;
  size?: "sm" | "md";
  className?: string;
};

/**
 * Icono decorativo: siempre acompaña a un texto visible, por eso queda oculto
 * para los lectores de pantalla. Hereda el color del texto (`currentColor`).
 */
export function Icon({ name, size = "md", className }: IconProps) {
  return (
    <svg
      className={className ? `${styles.icon} ${className}` : styles.icon}
      data-size={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
