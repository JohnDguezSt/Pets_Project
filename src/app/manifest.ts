import type { MetadataRoute } from "next";
import { getMessages } from "@/i18n";

/**
 * Manifest de la PWA. Por ahora solo identifica la app; el service worker y la
 * experiencia sin conexión llegan después del primer recorrido (precisión 4).
 * [PENDIENTE] Iconos definitivos con la marca.
 */
export default function manifest(): MetadataRoute.Manifest {
  const t = getMessages();
  return {
    name: t.app.name,
    short_name: t.app.shortName,
    description: t.app.description,
    lang: "es-MX",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f5f2",
    theme_color: "#f7f5f2",
    icons: [{ src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
