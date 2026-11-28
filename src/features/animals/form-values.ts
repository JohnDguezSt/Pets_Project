import type { AnimalDetail, SpeciesCatalog } from "@/server/animals";
import { type AnimalFormValues, OTHER_SPECIES } from "./form-state";

/** Valores iniciales del formulario a partir de un animal guardado (edición). */
export function formValuesFrom(animal: AnimalDetail, catalog: SpeciesCatalog): AnimalFormValues {
  const quick = catalog.quickPicks.some((taxon) => taxon.id === animal.taxonId);
  const [year, month] = animal.birthDate?.split("-") ?? [];
  return {
    name: animal.name,
    taxonChoice: quick ? animal.taxonId : OTHER_SPECIES,
    taxonListed: quick ? undefined : animal.taxonId,
    uncertain: animal.speciesUncertain,
    sex: animal.sex ?? undefined,
    sterilized: animal.sterilized ?? undefined,
    birthPrecision: animal.birthDatePrecision ?? "unknown",
    birthDay: animal.birthDatePrecision === "day" ? (animal.birthDate ?? undefined) : undefined,
    birthMonth: animal.birthDatePrecision === "month" && month ? String(Number(month)) : undefined,
    birthYear: animal.birthDatePrecision === "year" || animal.birthDatePrecision === "month" ? year : undefined,
  };
}
