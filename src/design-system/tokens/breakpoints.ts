/**
 * Puntos de adaptación (doc. 16 §2).
 *
 * Limitación de CSS: las variables no funcionan dentro de las condiciones
 * de @media ni de @container. Por eso estos valores se documentan aquí como
 * constantes y se escriben literalmente (en rem) en las consultas:
 *
 *   @media (width >= 48rem) { ... }
 *
 * Si cambia un valor, se busca y reemplaza en todo el proyecto.
 */
export const breakpoints = {
  sm: "40rem", // 640 px: móvil horizontal / móvil grande
  md: "48rem", // 768 px: tablet
  lg: "64rem", // 1024 px: escritorio
  xl: "80rem", // 1280 px: escritorio amplio
} as const;

export type Breakpoint = keyof typeof breakpoints;
