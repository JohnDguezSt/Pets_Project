import type { Age } from "@/domain/animals/age";
import { getMessages } from "@/i18n";

/** «2 años y 3 meses», «Unos 2 años», «Alrededor de 1 año»… */
export function formatAge(age: Age): string {
  const t = getMessages().age;
  switch (age.kind) {
    case "unknown":
      return t.unknown;
    case "lessThanMonth":
      return t.lessThanMonth;
    case "lessThanYear":
      return t.lessThanYear;
    case "months": {
      const text = t.months(age.months);
      if (!age.approximate) return text;
      return age.months === 1 ? t.approximately(text) : t.about(text);
    }
    case "years": {
      const text =
        age.months > 0 ? t.yearsAndMonths(t.years(age.years), t.months(age.months)) : t.years(age.years);
      if (!age.approximate) return text;
      return age.years === 1 ? t.approximately(text) : t.about(text);
    }
  }
}
