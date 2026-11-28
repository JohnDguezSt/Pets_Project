import { z } from "zod";
import type { CivilDate } from "@/domain/animals/age";
import { parseCivilDate, toIsoDate } from "@/domain/animals/age";
import { getMessages } from "@/i18n";
import { type AnimalFormValues, OTHER_SPECIES } from "./form-state";

const v = getMessages().animalForm.validation;

const MIN_YEAR = 1900;

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .enum(values)
    .optional()
    .catch(undefined);

/**
 * Convierte lo enviado en los datos de un animal. `today` es la
 * fecha civil de la persona en su zona horaria; la base vuelve a comprobar
 * que la fecha no sea futura.
 */
const nameSchema = z
  .string({ error: v.nameRequired })
  .trim()
  .min(1, v.nameRequired)
  .max(60, v.nameTooLong)
  // Sin caracteres de control (la base también lo exige).
  .refine((value) => !/\p{Cc}/u.test(value), v.nameInvalid);

export function animalSchema(today: CivilDate) {
  const todayIso = toIsoDate(today);

  return z
    .object({
      // El nombre se valida dentro de transform para informar todos los errores a la vez.
      name: z.string().optional(),
      taxonChoice: z.string().optional(),
      taxonListed: z.string().optional(),
      uncertain: z.boolean(),
      sex: optionalEnum(["female", "male", "unknown"] as const),
      sterilized: optionalEnum(["yes", "no", "unknown"] as const),
      birthPrecision: z.enum(["unknown", "year", "month", "day"]).catch("unknown"),
      birthDay: z.string().optional(),
      birthMonth: z.string().optional(),
      birthYear: z.string().optional(),
    })
    .transform((input, ctx) => {
      const name = nameSchema.safeParse(input.name);
      if (!name.success) {
        ctx.addIssue({ code: "custom", path: ["name"], message: name.error.issues[0]!.message });
      }

      const taxon = input.taxonChoice === OTHER_SPECIES ? input.taxonListed : input.taxonChoice;
      const taxonId = z.uuid().safeParse(taxon);
      if (!taxonId.success) {
        ctx.addIssue({ code: "custom", path: ["taxon"], message: v.speciesRequired });
      }

      let birthDate: string | null = null;
      const precision = input.birthPrecision === "unknown" ? null : input.birthPrecision;
      if (precision) {
        const year = input.birthYear?.trim() ?? "";
        const month = input.birthMonth ?? "";
        if (precision === "day") {
          if (!parseCivilDate(input.birthDay)) {
            ctx.addIssue({ code: "custom", path: ["birth"], message: v.birthDateRequired });
          } else {
            birthDate = input.birthDay!;
          }
        } else if (!/^\d{4}$/.test(year)) {
          ctx.addIssue({ code: "custom", path: ["birth"], message: v.birthYearRequired });
        } else if (precision === "month" && !/^(0?[1-9]|1[0-2])$/.test(month)) {
          ctx.addIssue({ code: "custom", path: ["birth"], message: v.birthMonthRequired });
        } else {
          const mm = precision === "month" ? month.padStart(2, "0") : "01";
          birthDate = `${year}-${mm}-01`;
        }

        if (birthDate) {
          if (Number(birthDate.slice(0, 4)) < MIN_YEAR) {
            ctx.addIssue({ code: "custom", path: ["birth"], message: v.birthTooOld });
          } else if (birthDate > todayIso) {
            ctx.addIssue({ code: "custom", path: ["birth"], message: v.birthFuture });
          }
        }
      }

      return {
        name: name.data ?? "",
        taxonId: taxonId.data ?? "",
        taxonCertainty: input.uncertain ? ("uncertain" as const) : ("certain" as const),
        sex: input.sex ?? null,
        sterilized: input.sterilized ?? null,
        birthDate: birthDate,
        birthDatePrecision: birthDate && precision ? precision : null,
      };
    });
}

export type AnimalInput = z.output<ReturnType<typeof animalSchema>>;

/** Lee el formulario tal como llegó, sin interpretarlo. */
export function readAnimalForm(formData: FormData): AnimalFormValues {
  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : undefined;
  };
  return {
    name: text("name"),
    taxonChoice: text("taxon"),
    taxonListed: text("taxon_listed"),
    uncertain: formData.get("taxon_uncertain") === "on",
    sex: text("sex"),
    birthPrecision: text("birth_precision"),
    birthDay: text("birth_day"),
    birthMonth: text("birth_month"),
    birthYear: text("birth_year"),
    sterilized: text("sterilized"),
  };
}
