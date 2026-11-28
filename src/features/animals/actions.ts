"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { todayIn } from "@/domain/animals/age";
import { getMessages } from "@/i18n";
import { getMyTimeZone } from "@/server/animals";
import { getCurrentUser } from "@/server/auth";
import { createSupabaseServerClient } from "@/server/supabase";
import type { AnimalField, AnimalFormState, AnimalFormValues } from "./form-state";
import { type AnimalInput, animalSchema, readAnimalForm } from "./schemas";

const t = getMessages().animalForm;

type Parsed = { ok: true; input: AnimalInput } | { ok: false; state: AnimalFormState };

/** Sesión + validación comunes al alta y a la edición. */
async function parseAnimal(prev: AnimalFormState, formData: FormData): Promise<Parsed> {
  const values = readAnimalForm(formData);
  const attempt = prev.attempt + 1;

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, state: { status: "error", message: t.errors.session, values, attempt } };
  }

  const today = todayIn(await getMyTimeZone(user.id));
  const parsed = animalSchema(today).safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<AnimalField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if ((field === "name" || field === "taxon" || field === "birth") && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return { ok: false, state: { status: "error", message: t.validation.formTitle, fieldErrors, values, attempt } };
  }
  return { ok: true, input: parsed.data };
}

/** Traduce los errores de PostgreSQL que la persona puede corregir. */
function databaseError(code: string, values: AnimalFormValues, attempt: number): AnimalFormState {
  const base = { status: "error" as const, message: t.validation.formTitle, values, attempt };
  switch (code) {
    case "22008": // fecha futura según la base (zona más adelantada del planeta)
      return { ...base, fieldErrors: { birth: t.validation.birthFuture } };
    case "23503": // la especie no existe en el catálogo
      return { ...base, fieldErrors: { taxon: t.validation.speciesRequired } };
    case "42501":
      return { ...base, message: t.errors.session };
    default:
      return { ...base, message: t.errors.unexpected };
  }
}

/**
 * Registra un animal con create_animal(): la base toma la identidad de la
 * sesión (auth.uid()) y crea el animal y el vínculo de tutor en una sola
 * transacción. Aquí no se envía ningún identificador de persona.
 */
export async function createAnimal(prev: AnimalFormState, formData: FormData): Promise<AnimalFormState> {
  const parsed = await parseAnimal(prev, formData);
  if (!parsed.ok) return parsed.state;

  const { input } = parsed;
  const supabase = await createSupabaseServerClient();
  const { data: animalId, error } = await supabase.rpc("create_animal", {
    p_name: input.name,
    p_taxon_id: input.taxonId,
    p_taxon_certainty: input.taxonCertainty,
    p_sex: input.sex ?? undefined,
    p_sterilized: input.sterilized ?? undefined,
    p_birth_date: input.birthDate ?? undefined,
    p_birth_date_precision: input.birthDatePrecision ?? undefined,
  });
  if (error) return databaseError(error.code, readAnimalForm(formData), prev.attempt + 1);

  // Vacía la caché del navegador para Mis mascotas y sus perfiles.
  revalidatePath("/mis-mascotas", "layout");
  redirect(`/mis-mascotas?registrado=${encodeURIComponent(animalId)}`);
}

/**
 * Guarda cambios del perfil. Es un UPDATE normal con la sesión de la
 * persona: los permisos por columna y la política animals_update_tutor
 * deciden si se aplica. Si no es tutora, no se actualiza ninguna fila.
 */
export async function updateAnimal(
  animalId: string,
  prev: AnimalFormState,
  formData: FormData,
): Promise<AnimalFormState> {
  const parsed = await parseAnimal(prev, formData);
  if (!parsed.ok) return parsed.state;

  const { input } = parsed;
  const values = readAnimalForm(formData);
  const attempt = prev.attempt + 1;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("animals")
    .update({
      name: input.name,
      taxon_id: input.taxonId,
      taxon_certainty: input.taxonCertainty,
      sex: input.sex,
      sterilized: input.sterilized,
      birth_date: input.birthDate,
      birth_date_precision: input.birthDatePrecision,
    })
    .eq("id", animalId)
    .select("id");
  if (error) return databaseError(error.code, values, attempt);
  if (data.length === 0) {
    return { status: "error", message: t.errors.notAllowed, values, attempt };
  }

  revalidatePath("/mis-mascotas", "layout");
  redirect(`/mis-mascotas/${encodeURIComponent(animalId)}?aviso=guardado`);
}
