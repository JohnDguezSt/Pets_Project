/**
 * Ruta interna a la que volver después de entrar.
 *
 * Solo acepta rutas relativas del propio sitio. Cualquier otra cosa
 * (otro dominio, `//evil.com`, `/\\evil.com`, esquemas como `javascript:`)
 * devuelve la ruta por defecto, para que nadie pueda usar el inicio de
 * sesión como trampolín hacia otra página (redirección abierta).
 */
export function safeNextPath(value: unknown, fallback = "/mis-mascotas"): string {
  if (typeof value !== "string") return fallback;
  if (value.length === 0 || value.length > 512) return fallback;
  if (!value.startsWith("/")) return fallback;
  // "//host" y "/\host" los navegadores los interpretan como otro dominio.
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  // Caracteres de control o espacios: los navegadores los ignoran o reinterpretan.
  if (/[\u0000-\u001F\u007F\s\\]/.test(value)) return fallback;

  // Comprobación final con el analizador de URL del propio entorno.
  const base = "http://interno.invalid";
  let url: URL;
  try {
    url = new URL(value, base);
  } catch {
    return fallback;
  }
  if (url.origin !== base) return fallback;

  return `${url.pathname}${url.search}${url.hash}`;
}
