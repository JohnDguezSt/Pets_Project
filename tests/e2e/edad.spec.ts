import { expect, test } from "@playwright/test";
import { ageFrom, parseCivilDate, todayIn, toIsoDate } from "../../src/domain/animals/age";
import { formatAge } from "../../src/features/animals/format-age";

/** Reglas puras de fechas y edad: no necesitan navegador. */
const hoy = { year: 2026, month: 11, day: 22 };
const edad = (fecha: string, precision: "day" | "month" | "year") =>
  formatAge(ageFrom(parseCivilDate(fecha), precision, hoy));

test.describe("edad aproximada", () => {
  const casos: [string, "day" | "month" | "year", string][] = [
    ["2026-11-10", "day", "Menos de un mes"],
    ["2026-10-22", "day", "1 mes"],
    ["2026-10-23", "day", "Menos de un mes"],
    ["2026-05-01", "day", "6 meses"],
    ["2025-11-22", "day", "1 año"],
    ["2024-08-15", "day", "2 años y 3 meses"],
    ["2024-08-01", "month", "Unos 2 años y 3 meses"],
    ["2025-11-01", "month", "Alrededor de 1 año"],
    ["2026-09-01", "month", "Unos 2 meses"],
    ["2024-01-01", "year", "Unos 2 años"],
    ["2025-01-01", "year", "Alrededor de 1 año"],
    ["2026-01-01", "year", "Menos de un año"],
  ];
  for (const [fecha, precision, esperado] of casos) {
    test(`${fecha} (${precision}) → ${esperado}`, () => {
      expect(edad(fecha, precision)).toBe(esperado);
    });
  }

  test("sin fecha, la edad queda sin registrar", () => {
    expect(formatAge(ageFrom(null, null, hoy))).toBe("Edad sin registrar");
  });

  test("el 29 de febrero cumple meses al día siguiente del 28", () => {
    expect(formatAge(ageFrom(parseCivilDate("2024-02-29"), "day", { year: 2025, month: 2, day: 28 }))).toBe(
      "11 meses",
    );
  });
});

test.describe("fechas civiles", () => {
  test("rechaza fechas imposibles o mal escritas", () => {
    for (const mala of ["2025-02-29", "2025-13-01", "2025-1-01", "", "hoy", undefined]) {
      expect(parseCivilDate(mala)).toBeNull();
    }
    expect(parseCivilDate("2024-02-29")).toEqual({ year: 2024, month: 2, day: 29 });
  });

  test("«hoy» depende de la zona horaria de la persona", () => {
    // 22 nov 2026, 05:30 UTC: en Mazatlán (UTC−7) todavía es 21.
    const instante = new Date(Date.UTC(2026, 10, 22, 5, 30));
    expect(toIsoDate(todayIn("America/Mazatlan", instante))).toBe("2026-11-21");
    expect(toIsoDate(todayIn("UTC", instante))).toBe("2026-11-22");
  });
});
