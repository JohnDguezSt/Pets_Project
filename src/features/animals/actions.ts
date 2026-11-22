"use server";

import { redirect } from "next/navigation";
import { todayIn } from "@/domain/animals/age";
import { getMessages } from "@/i18n";
import { getMyTimeZone } from "@/server/animals";
import { getCurrentUser } from "@/server/auth";
import { createSupabaseServerClient } from "@/server/supabase";
import type { AnimalField, AnimalFormState } from "./form-state";
import { animalSchema, readAnimalForm } from "./schemas";

const t = getMessages().animalForm;

/**
 * Registra un animal con create_animal(): la base toma la identidad de la
 * sesión (auth.uid()) y crea el animal y el vínculo de tutor en una sola
 * transacción. Aquí no se envía ningún identificador de persona.
 */
export async function createAnimal(prev: AnimalFormState, formData: FormData): Promise<AnimalFormState> {
  const values = readAnimalForm(formData);
  const attempt = prev.attempt + 1;

  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: t.errors.session, values, attempt };
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
    return { status: "error", message: t.validation.formTitle, fieldErrors, values, attempt };
  }

  const supabase = await createSupabaseServerClient();
  const { data: animalId, error } = await supabase.rpc("create_animal", parsed.data);

  if (error) {
    switch (error.code) {
      case "22008": // fecha futura según la base (zona más adelantada del planeta)
        return {
          status: "error",
          message: t.validation.formTitle,
          fieldErrors: { birth: t.validation.birthFuture },
          values,
          attempt,
        };
      case "23503": // la especie no existe en el catálogo
        return {
          status: "error",
          message: t.validation.formTitle,
          fieldErrors: { taxon: t.validation.speciesRequired },
          values,
          attempt,
        };
      case "42501":
        return { status: "error", message: t.errors.session, values, attempt };
      default:
        return { status: "error", message: t.errors.unexpected, values, attempt };
    }
  }

  redirect(`/mis-mascotas?registrado=${encodeURIComponent(animalId)}`);
}
