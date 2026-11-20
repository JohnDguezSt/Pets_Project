import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * Pruebas en navegador real: accesibilidad automática y comportamiento básico.
 * Se ejecutan contra el build de producción, con el catálogo activado.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "off",
  },
  projects: [
    { name: "movil", use: { ...devices["Pixel 7"] } },
    { name: "escritorio", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `pnpm build && pnpm start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { ENABLE_DEV_CATALOG: "1", NEXT_TELEMETRY_DISABLED: "1" },
  },
});
