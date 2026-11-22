import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

// En tu equipo se leen de .env.local (si existe); las variables ya definidas mandan.
try {
  process.loadEnvFile(".env.local");
} catch {
  // Sin .env.local: se usan las variables del entorno (CI).
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
if (!supabaseUrl.startsWith("http://127.0.0.1") && !supabaseUrl.startsWith("http://localhost")) {
  // Las pruebas crean cuentas: jamás deben apuntar a un proyecto remoto.
  throw new Error("Las pruebas solo corren contra Supabase local. Define NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321.");
}

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
    // Supabase LOCAL (supabase start). En la CI las variables vienen de `supabase status`.
    env: {
      ENABLE_DEV_CATALOG: "1",
      NEXT_TELEMETRY_DISABLED: "1",
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: supabaseKey,
    },
  },
});
