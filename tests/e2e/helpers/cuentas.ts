import { expect, type Page } from "@playwright/test";
import { enlaceDelCorreo } from "./correo";

export const CONTRASENA = "una frase larga de prueba";

export async function crearCuentaConfirmada(page: Page, correo: string) {
  await page.goto("/crear-cuenta");
  await page.getByLabel("Correo electrónico").filter({ visible: true }).fill(correo);
  await page.getByLabel("Contraseña").filter({ visible: true }).fill(CONTRASENA);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByRole("status")).toContainText("Revisa tu correo");

  const enlace = await enlaceDelCorreo(correo, /Confirm|Confirma/);
  await page.goto(enlace);
  await expect(page).toHaveURL(/\/auth\/confirmar\?/);
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).toHaveURL(/\/mis-mascotas$/);
}
