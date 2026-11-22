import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { crearCuentaConfirmada } from "./helpers/cuentas";
import { correoDePrueba } from "./helpers/correo";

/*
 * Mis mascotas y registrar mascota contra Supabase LOCAL. Crean cuentas con
 * correo, así que corren solo en el proyecto de escritorio.
 */
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "escritorio", "Recorridos con cuenta: solo en escritorio.");
});

test.use({ timezoneId: "America/Mazatlan" });

const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function sinViolaciones(page: Page) {
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
    expect(results.violations, `${colorScheme}: ${JSON.stringify(results.violations, null, 2)}`).toEqual([]);
  }
  await page.emulateMedia({ colorScheme: "light" });
}

/** Hoy en Mazatlán, como lo ve la persona. */
function hoyEnMazatlan() {
  const [year, month, day] = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mazatlan" })
    .format(new Date())
    .split("-")
    .map(Number);
  return { year: year!, month: month!, day: day! };
}

test("alta mínima: nombre y especie, y vuelve a la lista con un aviso", async ({ page }) => {
  await crearCuentaConfirmada(page, correoDePrueba("mascota-minima"));

  await expect(page.getByRole("heading", { name: "Agrega a tu primera mascota" })).toBeVisible();
  await sinViolaciones(page);

  await page.getByRole("link", { name: "Registrar mascota" }).click();
  await expect(page).toHaveURL(/\/mis-mascotas\/nueva$/);
  await expect(page.getByRole("heading", { level: 1, name: "Registrar mascota" })).toBeVisible();
  await sinViolaciones(page);

  await page.getByLabel("Nombre").fill("  Luna  ");
  await page.getByRole("radio", { name: "Gato" }).check();
  await page.getByRole("button", { name: "Guardar" }).click();

  await expect(page).toHaveURL(/\/mis-mascotas\?registrado=[0-9a-f-]{36}$/);
  await expect(page.getByRole("status")).toHaveText(/Listo, registraste a Luna\./);
  const lista = page.getByRole("list", { name: "Tus animales" });
  await expect(lista.getByRole("listitem")).toHaveCount(1);
  await expect(lista.getByRole("heading", { name: "Luna" })).toBeVisible();
  await expect(lista).toContainText("Gato · Edad sin registrar");
  await sinViolaciones(page);

  // Al recargar sin el parámetro ya no se repite el aviso.
  await page.goto("/mis-mascotas");
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(lista.getByRole("heading", { name: "Luna" })).toBeVisible();
});

test("alta completa: especie de la lista, dudosa, con fecha parcial y datos opcionales", async ({ page }) => {
  await crearCuentaConfirmada(page, correoDePrueba("mascota-completa"));
  await page.goto("/mis-mascotas/nueva");

  await page.getByLabel("Nombre").fill("Toto");
  await page.getByRole("radio", { name: "Otra especie" }).check();
  await page.getByLabel("Elige la especie").selectOption({ label: "Hurón" });
  await page.getByLabel("No estoy seguro de la especie exacta").check();
  await page.getByRole("radio", { name: "Macho" }).check();

  const hoy = hoyEnMazatlan();
  await page.getByRole("radio", { name: "El mes y el año" }).check();
  await page.getByLabel("Mes", { exact: true }).selectOption(String(hoy.month));
  await page.getByLabel("Año", { exact: true }).fill(String(hoy.year - 2));
  await page.getByRole("group", { name: "¿Está esterilizado?" }).getByRole("radio", { name: "Sí" }).check();
  await sinViolaciones(page);

  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByRole("status")).toHaveText(/registraste a Toto/);
  await expect(page.getByRole("list", { name: "Tus animales" })).toContainText(
    "Hurón, especie por confirmar · Unos 2 años",
  );
});

test("errores por campo: se explican, llevan el foco y conservan lo escrito", async ({ page }) => {
  await crearCuentaConfirmada(page, correoDePrueba("mascota-errores"));
  await page.goto("/mis-mascotas/nueva");

  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByRole("status")).toContainText("Revisa los datos marcados.");
  const nombre = page.getByLabel("Nombre");
  await expect(nombre).toBeFocused();
  await expect(nombre).toHaveAttribute("aria-invalid", "true");
  await expect(nombre).toHaveAccessibleDescription(/Escribe su nombre\./);
  await expect(page.getByRole("group", { name: "Especie" })).toHaveAccessibleDescription(/Elige una especie/);
  await sinViolaciones(page);

  // Fecha futura: la rechaza el servidor y se conservan los demás datos.
  await nombre.fill("Kira");
  await page.getByRole("radio", { name: "Perro" }).check();
  await page.getByRole("radio", { name: "La fecha exacta" }).check();
  const hoy = hoyEnMazatlan();
  await page.getByLabel("Fecha de nacimiento").fill(`${hoy.year + 1}-01-15`);
  await page.getByRole("button", { name: "Guardar" }).click();

  const fecha = page.getByLabel("Fecha de nacimiento");
  await expect(fecha).toBeFocused();
  await expect(fecha).toHaveAccessibleDescription(/no puede ser posterior a hoy/);
  await expect(page.getByLabel("Nombre")).toHaveValue("Kira");
  await expect(page.getByRole("radio", { name: "Perro" })).toBeChecked();

  // Año incompleto.
  await page.getByRole("radio", { name: "Solo el año" }).check();
  await page.getByLabel("Año", { exact: true }).fill("21");
  await page.getByRole("button", { name: "Guardar" }).click();
  const anio = page.getByLabel("Año", { exact: true });
  await expect(anio).toBeFocused();
  await expect(anio).toHaveAccessibleDescription(/cuatro cifras/);

  // Corregido, se guarda.
  await anio.fill(String(hoy.year - 3));
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByRole("list", { name: "Tus animales" })).toContainText("Perro · Unos 3 años");
});

test("otra cuenta no ve el animal, ni siquiera con su identificador", async ({ browser }) => {
  const contextoA = await browser.newContext({ timezoneId: "America/Mazatlan" });
  const a = await contextoA.newPage();
  await crearCuentaConfirmada(a, correoDePrueba("tutor-a"));
  await a.goto("/mis-mascotas/nueva");
  await a.getByLabel("Nombre").fill("Secreto");
  await a.getByRole("radio", { name: "Conejo" }).check();
  await a.getByRole("button", { name: "Guardar" }).click();
  await expect(a).toHaveURL(/registrado=/);
  const id = new URL(a.url()).searchParams.get("registrado");

  const contextoB = await browser.newContext({ timezoneId: "America/Mazatlan" });
  const b = await contextoB.newPage();
  await crearCuentaConfirmada(b, correoDePrueba("tutor-b"));
  await expect(b.getByRole("heading", { name: "Agrega a tu primera mascota" })).toBeVisible();
  await expect(b.getByText("Secreto")).toHaveCount(0);

  await b.goto(`/mis-mascotas?registrado=${id}`);
  await expect(b.getByRole("status")).toHaveCount(0);
  await expect(b.getByText("Secreto")).toHaveCount(0);

  await contextoA.close();
  await contextoB.close();
});

test("sin sesión, registrar mascota manda a entrar y luego regresa", async ({ page }) => {
  await page.goto("/mis-mascotas/nueva");
  await expect(page).toHaveURL(/\/entrar\?siguiente=%2Fmis-mascotas%2Fnueva$/);
});
