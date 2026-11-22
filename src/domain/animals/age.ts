/** Precisión de una fecha parcial (doc. 7): día exacto, solo mes y año, o solo año. */
export type DatePrecision = "day" | "month" | "year";

export type CivilDate = { year: number; month: number; day: number };

export type Age =
  | { kind: "unknown" }
  | { kind: "lessThanMonth"; approximate: boolean }
  | { kind: "lessThanYear" }
  | { kind: "months"; months: number; approximate: boolean }
  | { kind: "years"; years: number; months: number; approximate: boolean };

/** "2024-05-17" → { year: 2024, month: 5, day: 17 }. Devuelve null si no es una fecha válida. */
export function parseCivilDate(value: string | null | undefined): CivilDate | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day };
}

/** { year: 2024, month: 5, day: 7 } → "2024-05-07". */
export function toIsoDate(date: CivilDate): string {
  const pad = (n: number, width: number) => String(n).padStart(width, "0");
  return `${pad(date.year, 4)}-${pad(date.month, 2)}-${pad(date.day, 2)}`;
}

/** Fecha civil de "hoy" en una zona IANA (p. ej. America/Mazatlan). */
export function todayIn(timeZone: string, now: Date = new Date()): CivilDate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

/**
 * Edad a partir de una fecha parcial. Con precisión de mes o año el
 * resultado es aproximado y se redondea hacia abajo con lo que sí se sabe.
 */
export function ageFrom(birth: CivilDate | null, precision: DatePrecision | null, today: CivilDate): Age {
  if (!birth || !precision) return { kind: "unknown" };
  const approximate = precision !== "day";

  if (precision === "year") {
    const years = today.year - birth.year;
    if (years <= 0) return { kind: "lessThanYear" };
    // Sin mes conocido no se puede afinar: "unos N años".
    return { kind: "years", years, months: 0, approximate: true };
  }

  let months = (today.year - birth.year) * 12 + (today.month - birth.month);
  if (precision === "day" && today.day < birth.day) months -= 1;
  if (months < 0) months = 0;

  if (months < 1) return { kind: "lessThanMonth", approximate };
  if (months < 12) return { kind: "months", months, approximate };
  return { kind: "years", years: Math.floor(months / 12), months: months % 12, approximate };
}
