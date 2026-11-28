import type { DatePrecision } from "@/domain/animals/age";
import { parseCivilDate } from "@/domain/animals/age";
import { getMessages, locale } from "@/i18n";

/** «Nació el 15 de marzo de 2023», «Nació en marzo de 2023» o «Nació en 2023». */
export function formatBirth(birthDate: string | null, precision: DatePrecision | null): string | null {
  const date = parseCivilDate(birthDate);
  if (!date || !precision) return null;
  const t = getMessages().animalProfile;
  // Fecha civil: se formatea en UTC para que ninguna zona horaria la mueva de día.
  const instant = new Date(Date.UTC(date.year, date.month - 1, date.day));
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(instant);
  switch (precision) {
    case "day":
      return t.bornOn(format({ day: "numeric", month: "long", year: "numeric" }));
    case "month":
      return t.bornIn(format({ month: "long", year: "numeric" }));
    case "year":
      return t.bornIn(String(date.year));
  }
}
