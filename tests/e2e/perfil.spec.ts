import AxeBuilder from "@axe-core/playwright";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import { CONTRASENA, crearCuentaConfirmada } from "./helpers/cuentas";
import { correoDePrueba } from "./helpers/correo";

/*
 * Perfil y edición contra Supabase LOCAL. Crean cuentas con correo, así que
 * corren solo en el proyecto de escritorio.
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

/** Registra un animal con nombre y especie rápida; devuelve su identificador. */
async function registrar(page: Page, nombre: string, especie: string): Promise<string> {
  await page.goto("/mis-mascotas/nueva");
  await page.getByLabel("Nombre").filter({ visible: true }).fill(nombre);
  await page.getByRole("radio", { name: especie }).check();
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page).toHaveURL(/registrado=/);
  return new URL(page.url()).searchParams.get("registrado")!;
}

const datos = (page: Page) => page.getByRole("region", { name: "Datos básicos" });

test("perfil: muestra lo registrado y ofrece completar lo que falta", async ({ page }) => {
  await crearCuentaConfirmada(page, correoDePrueba("perfil"));
  await registrar(page, "Luna", "Gato");

  await page.getByRole("link", { name: "Luna" }).click();
  await expect(page).toHaveURL(/\/mis-mascotas\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("heading", { level: 1, name: "Luna" })).toBeVisible();
  await expect(datos(page)).toContainText("EspecieGato");
  await expect(datos(page)).toContainText("NacimientoSin registrar");
  await expect(page.getByRole("link", { name: "Agregar nacimiento" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Agregar sexo" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Indicar si está esterilizado" })).toBeVisible();
  await sinViolaciones(page);

  await page.getByRole("link", { name: "Mis mascotas" }).first().click();
  await expect(page).toHaveURL(/\/mis-mascotas$/);
});

test("editar: el formulario llega con los datos y los cambios se ven en el perfil", async ({ page }) => {
  await crearCuentaConfirmada(page, correoDePrueba("editar"));
  await registrar(page, "Toto", "Perro");
  await page.getByRole("link", { name: "Toto" }).click();

  await page.getByRole("link", { name: "Editar datos" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Editar a Toto" })).toBeVisible();
  await expect(page.getByLabel("Nombre").filter({ visible: true })).toHaveValue("Toto");
  await expect(page.getByRole("radio", { name: "Perro" })).toBeChecked();
  await expect(page.getByRole("radio", { name: "No lo sé" }).first()).not.toBeChecked();
  await sinViolaciones(page);

  // Cambiar a una especie de la lista, con fecha exacta y datos opcionales.
  await page.getByLabel("Nombre").filter({ visible: true }).fill("Toto Grande");
  await page.getByRole("radio", { name: "Otra especie" }).check();
  await page.getByLabel("Elige la especie").filter({ visible: true }).selectOption({ label: "Hurón" });
  await page.getByRole("radio", { name: "Hembra" }).check();
  await page.getByRole("radio", { name: "La fecha exacta" }).check();
  await page.getByLabel("Fecha de nacimiento").filter({ visible: true }).fill("2023-03-15");
  await page.getByRole("group", { name: "¿Está esterilizado?" }).getByRole("radio", { name: "No", exact: true }).check();
  await page.getByRole("button", { name: "Guardar" }).click();

  await expect(page).toHaveURL(/\/mis-mascotas\/[0-9a-f-]{36}\?aviso=guardado$/);
  await expect(page.getByRole("status")).toHaveText(/Cambios guardados\./);
  await expect(page.getByRole("heading", { level: 1, name: "Toto Grande" })).toBeVisible();
  await expect(datos(page)).toContainText("EspecieHurón");
  await expect(datos(page)).toContainText("NacimientoNació el 15 de marzo de 2023");
  await expect(datos(page)).toContainText("SexoHembra");
  await expect(datos(page)).toContainText("EsterilizadoNo");
  await sinViolaciones(page);

  // Al volver a editar, la especie de la lista y la fecha siguen cargadas.
  await page.getByRole("link", { name: "Editar datos" }).click();
  await expect(page.getByRole("radio", { name: "Otra especie" })).toBeChecked();
  await expect(page.getByLabel("Elige la especie").filter({ visible: true })).toHaveValue(/[0-9a-f-]{36}/);
  await expect(page.getByLabel("Fecha de nacimiento").filter({ visible: true })).toHaveValue("2023-03-15");

  // Pasar a «solo mes y año» guarda la fecha con esa precisión.
  await page.getByRole("radio", { name: "El mes y el año" }).check();
  await page.getByLabel("Mes", { exact: true }).filter({ visible: true }).selectOption("6");
  await page.getByLabel("Año", { exact: true }).filter({ visible: true }).fill("2022");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(datos(page)).toContainText("NacimientoNació en junio de 2022");

  // «Cancelar» vuelve al perfil sin cambios.
  await page.getByRole("link", { name: "Editar datos" }).click();
  await page.getByLabel("Nombre").filter({ visible: true }).fill("No se guarda");
  await page.getByRole("link", { name: "Cancelar" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Toto Grande" })).toBeVisible();
});

test("editar: los errores se explican y conservan lo escrito", async ({ page }) => {
  await crearCuentaConfirmada(page, correoDePrueba("editar-errores"));
  const id = await registrar(page, "Kira", "Conejo");
  await page.goto(`/mis-mascotas/${id}/editar`);

  await page.getByLabel("Nombre").filter({ visible: true }).fill("");
  await page.getByRole("radio", { name: "Solo el año" }).check();
  await page.getByLabel("Año", { exact: true }).filter({ visible: true }).fill("1850");
  await page.getByRole("button", { name: "Guardar" }).click();

  const nombre = page.getByLabel("Nombre").filter({ visible: true });
  await expect(nombre).toBeFocused();
  await expect(nombre).toHaveAccessibleDescription(/Escribe su nombre\./);
  await expect(page.getByLabel("Año", { exact: true }).filter({ visible: true })).toHaveValue("1850");
  await expect(page.getByLabel("Año", { exact: true }).filter({ visible: true })).toHaveAccessibleDescription(/1900 en adelante/);
  await expect(page.getByRole("radio", { name: "Conejo" })).toBeChecked();
  await sinViolaciones(page);

  await page.goto(`/mis-mascotas/${id}`);
  await expect(page.getByRole("heading", { level: 1, name: "Kira" })).toBeVisible();
});

test("otra cuenta no ve ni edita el animal, aunque tenga el enlace", async ({ browser }) => {
  const contextoA = await browser.newContext({ timezoneId: "America/Mazatlan" });
  const a = await contextoA.newPage();
  await crearCuentaConfirmada(a, correoDePrueba("dueno-a"));
  const id = await registrar(a, "Privada", "Pez");

  const contextoB = await browser.newContext({ timezoneId: "America/Mazatlan" });
  const b = await contextoB.newPage();
  const correoB = correoDePrueba("ajeno-b");
  await crearCuentaConfirmada(b, correoB);

  for (const ruta of [`/mis-mascotas/${id}`, `/mis-mascotas/${id}/editar`]) {
    await b.goto(ruta);
    await expect(b.getByRole("heading", { level: 1, name: "No encontramos este animal" })).toBeVisible();
    await expect(b.getByText("Privada")).toHaveCount(0);
  }
  // Un identificador inventado o mal escrito se ve igual.
  await b.goto("/mis-mascotas/no-es-un-id");
  await expect(b.getByRole("heading", { level: 1, name: "No encontramos este animal" })).toBeVisible();
  await sinViolaciones(b);

  // Guardado forzado con la sesión de B directamente contra la API: no cambia nada.
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false },
  });
  const { error: loginError } = await supabase.auth.signInWithPassword({ email: correoB, password: CONTRASENA });
  expect(loginError).toBeNull();
  const { data, error } = await supabase.from("animals").update({ name: "Robada" }).eq("id", id).select("id");
  expect(error).toBeNull();
  expect(data).toEqual([]);

  await a.goto(`/mis-mascotas/${id}`);
  await expect(a.getByRole("heading", { level: 1, name: "Privada" })).toBeVisible();

  await contextoA.close();
  await contextoB.close();
});

test("sin sesión, el perfil manda a entrar y luego regresa", async ({ page }) => {
  await page.goto("/mis-mascotas/00000000-0000-4000-8000-000000000000");
  await expect(page).toHaveURL(/\/entrar\?siguiente=%2Fmis-mascotas%2F00000000-0000-4000-8000-000000000000$/);
});
