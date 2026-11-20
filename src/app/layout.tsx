import type { Metadata, Viewport } from "next";
import { getMessages, locale } from "@/i18n";
import "@/design-system/styles/index.css";

const t = getMessages();

export const metadata: Metadata = {
  title: {
    default: t.app.name,
    template: `%s · ${t.app.shortName}`,
  },
  description: t.app.description,
  applicationName: t.app.shortName,
  icons: { icon: "/icons/icon.svg" },
};

/*
 * Colores de la barra del navegador. No pueden leer variables CSS, así que
 * repiten los valores de --color-surface-page de tokens/base.css.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f2" },
    { media: "(prefers-color-scheme: dark)", color: "#181613" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
