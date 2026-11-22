import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
  { name: "Inicio", path: "/" },
  { name: "Catálogo", path: "/dev/catalogo" },
  { name: "Entrar", path: "/entrar" },
  { name: "Crear cuenta", path: "/crear-cuenta" },
  { name: "Recuperar contraseña", path: "/recuperar" },
  { name: "Confirmar enlace", path: "/auth/confirmar?token_hash=x&type=email" },
];

/** WCAG 2.2 AA es la referencia del proyecto (doc. 16). */
const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const { name, path } of pages) {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`${name} cumple WCAG 2.2 AA en tema ${colorScheme === "light" ? "claro" : "oscuro"}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });
  }

  test(`${name} no desborda horizontalmente`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("el foco con teclado es visible", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium");
  await page.goto("/dev/catalogo");
  await page.keyboard.press("Tab");
  const outline = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return null;
    const style = getComputedStyle(el);
    return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
  });
  expect(outline).not.toBeNull();
  expect(outline?.style).not.toBe("none");
  expect(outline?.width ?? 0).toBeGreaterThanOrEqual(2);
});

test("los campos con error se anuncian como inválidos", async ({ page }) => {
  await page.goto("/dev/catalogo");
  const weight = page.getByLabel("Peso en kg").first();
  await expect(weight).toHaveAttribute("aria-invalid", "true");
  await expect(weight).toHaveAccessibleDescription(/mayor que 0/);
});

test("el catálogo muestra de verdad el tema oscuro junto al claro", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/dev/catalogo");
  const [light, dark] = await Promise.all(
    ["light", "dark"].map((theme) =>
      page.locator(`[data-theme="${theme}"]`).first().evaluate((el) => getComputedStyle(el).backgroundColor),
    ),
  );
  expect(dark).not.toBe(light);
});
