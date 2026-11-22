import { expect, test } from "@playwright/test";
import { safeNextPath } from "../../src/domain/auth/safe-next-path";

/** Regla pura: no necesita navegador. Evita redirecciones abiertas tras entrar. */
test.describe("safeNextPath", () => {
  const fallback = "/mis-mascotas";

  for (const ok of ["/mis-mascotas", "/mis-mascotas?pestana=salud", "/a/b#seccion"]) {
    test(`acepta la ruta interna ${ok}`, () => {
      expect(safeNextPath(ok)).toBe(ok);
    });
  }

  for (const malo of [
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "\\\\evil.example",
    "javascript:alert(1)",
    "/\tevil",
    " /mis-mascotas",
    "mis-mascotas",
    "",
    "/" + "a".repeat(600),
  ]) {
    test(`rechaza ${JSON.stringify(malo).slice(0, 40)}`, () => {
      expect(safeNextPath(malo)).toBe(fallback);
    });
  }

  test("rechaza valores que no son texto", () => {
    expect(safeNextPath(undefined)).toBe(fallback);
    expect(safeNextPath(["/x"])).toBe(fallback);
  });
});
