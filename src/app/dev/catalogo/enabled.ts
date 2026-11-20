/**
 * El catálogo interno solo existe en desarrollo y en las vistas previas de
 * Vercel. En producción responde 404.
 */
export function isCatalogEnabled() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "preview" ||
    process.env.ENABLE_DEV_CATALOG === "1"
  );
}
