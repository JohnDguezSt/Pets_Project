import { expect, test, type Page } from "@playwright/test";
import { correoDePrueba, enlaceDelCorreo } from "./helpers/correo";

/*
 * Recorridos de cuenta contra Supabase LOCAL (Docker). Envían correos reales
 * a Mailpit, así que corren solo en el proyecto de escritorio para no duplicar
 * cuentas ni chocar con los límites de envío.
 */
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "escritorio", "Recorridos con correo: solo en escritorio.");
});

const CONTRASENA = "una frase larga de prueba";

async function crearCuentaConfirmada(page: Page, correo: string) {
  await page.goto("/crear-cuenta");
  await page.getByLabel("Correo electrónico").fill(correo);
  await page.getByLabel("Contraseña").fill(CONTRASENA);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByRole("status")).toContainText("Revisa tu correo");

  const enlace = await enlaceDelCorreo(correo, /Confirma tu correo/);
  expect(new URL(enlace).pathname).toBe("/auth/confirmar");
  await page.goto(enlace);
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).toHaveURL(/\/mis-mascotas$/);
}

async function entrar(page: Page, correo: string, contrasena: string) {
  await page.getByLabel("Correo electrónico").fill(correo);
  await page.getByLabel("Contraseña").fill(contrasena);
  await page.getByRole("button", { name: "Entrar" }).click();
}

test.describe("cuenta", () => {
  test.use({ timezoneId: "America/Mazatlan" });

  test("crear cuenta, confirmar correo, salir y volver a entrar", async ({ page }) => {
    const correo = correoDePrueba("alta");
    await crearCuentaConfirmada(page, correo);

    await expect(page.getByRole("heading", { level: 1, name: "Mis mascotas" })).toBeVisible();
    await expect(page.getByText(correo)).toBeVisible();

    // La sesión sobrevive a recargar.
    await page.reload();
    await expect(page.getByText(correo)).toBeVisible();

    // Salir.
    await page.getByRole("button", { name: "Salir" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();

    // Sin sesión, la página protegida manda a entrar y luego regresa.
    await page.goto("/mis-mascotas");
    await expect(page).toHaveURL(/\/entrar\?siguiente=%2Fmis-mascotas$/);
    await entrar(page, correo, CONTRASENA);
    await expect(page).toHaveURL(/\/mis-mascotas$/);
  });

  test("la zona horaria del navegador se guarda en la cuenta", async ({ page }) => {
    const correo = correoDePrueba("zona");
    await crearCuentaConfirmada(page, correo);

    // Lee la propia fila de `parties` con la sesión de la persona (RLS en acción).
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const login = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: key, "content-type": "application/json" },
      body: JSON.stringify({ email: correo, password: CONTRASENA }),
    });
    const { access_token } = (await login.json()) as { access_token: string };
    const res = await fetch(`${url}/rest/v1/parties?select=time_zone,locale`, {
      headers: { apikey: key, authorization: `Bearer ${access_token}` },
    });
    expect(await res.json()).toEqual([{ time_zone: "America/Mazatlan", locale: "es-MX" }]);
  });

  test("datos inválidos: errores en cada campo y foco en el primero", async ({ page }) => {
    await page.goto("/crear-cuenta");
    await page.getByLabel("Correo electrónico").fill("no-es-correo");
    await page.getByLabel("Contraseña").fill("corta");
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    const correo = page.getByLabel("Correo electrónico");
    await expect(correo).toHaveAttribute("aria-invalid", "true");
    await expect(correo).toBeFocused();
    await expect(correo).toHaveAccessibleDescription(/correo válido/);
    await expect(page.getByLabel("Contraseña")).toHaveAccessibleDescription(/al menos 8 caracteres/);
    // El correo escrito se conserva; la contraseña no se devuelve.
    await expect(correo).toHaveValue("no-es-correo");
    await expect(page.getByLabel("Contraseña")).toHaveValue("");
  });

  test("contraseña incorrecta: mensaje genérico", async ({ page }) => {
    await page.goto("/entrar");
    await entrar(page, correoDePrueba("nadie"), "contraseña equivocada");
    await expect(page.getByText("El correo o la contraseña no coinciden.")).toBeVisible();
    await expect(page).toHaveURL(/\/entrar/);
  });

  test("no redirige a otros sitios después de entrar", async ({ page }) => {
    const correo = correoDePrueba("redir");
    await crearCuentaConfirmada(page, correo);
    await page.getByRole("button", { name: "Salir" }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/entrar?siguiente=https%3A%2F%2Fevil.example%2Frobar");
    // La regla en sí se prueba sin navegador en redireccion-segura.spec.ts.
    await expect(page.locator('input[name="siguiente"]')).toHaveValue("/mis-mascotas");
    await entrar(page, correo, CONTRASENA);
    await expect(page).toHaveURL(/^http:\/\/localhost:3100\/mis-mascotas$/);
  });

  test("con sesión, entrar y crear cuenta mandan a Mis mascotas", async ({ page }) => {
    await crearCuentaConfirmada(page, correoDePrueba("invitado"));
    await page.goto("/entrar");
    await expect(page).toHaveURL(/\/mis-mascotas$/);
    await page.goto("/crear-cuenta");
    await expect(page).toHaveURL(/\/mis-mascotas$/);
  });

  test("recuperar contraseña de punta a punta", async ({ page }) => {
    const correo = correoDePrueba("recupera");
    await crearCuentaConfirmada(page, correo);
    await page.getByRole("button", { name: "Salir" }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/recuperar");
    await page.getByLabel("Correo electrónico").fill(correo);
    await page.getByRole("button", { name: "Enviar enlace" }).click();
    await expect(page.getByRole("status")).toContainText("Si hay una cuenta con ese correo");

    const enlace = await enlaceDelCorreo(correo, /Restablece tu contraseña/);
    await page.goto(enlace);
    await page.getByRole("button", { name: "Confirmar" }).click();
    await expect(page).toHaveURL(/\/nueva-contrasena$/);

    const nueva = "otra frase larga distinta";
    await page.getByLabel("Contraseña nueva").fill(nueva);
    await page.getByRole("button", { name: "Guardar contraseña" }).click();
    await expect(page).toHaveURL(/\/entrar\?aviso=contrasena-actualizada$/);
    await expect(page.getByText("Ya puedes entrar con tu contraseña nueva")).toBeVisible();

    await entrar(page, correo, CONTRASENA);
    await expect(page.getByText("El correo o la contraseña no coinciden.")).toBeVisible();
    await entrar(page, correo, nueva);
    await expect(page).toHaveURL(/\/mis-mascotas$/);
  });

  test("un enlace de confirmación usado o inventado no da acceso", async ({ page }) => {
    await page.goto("/auth/confirmar?token_hash=inventado&type=email");
    await page.getByRole("button", { name: "Confirmar" }).click();
    await expect(page.getByText("El enlace ya se usó o venció")).toBeVisible();
    await page.goto("/mis-mascotas");
    await expect(page).toHaveURL(/\/entrar/);
  });
});
