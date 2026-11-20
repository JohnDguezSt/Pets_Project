import { esMX } from "./es-MX";

/** Idioma de la interfaz. Por ahora solo hay uno. */
export const locale = "es-MX";

/**
 * Devuelve los textos del idioma activo. Cuando haya un segundo idioma,
 * esta función elegirá el diccionario; los componentes no cambian.
 */
export function getMessages() {
  return esMX;
}
