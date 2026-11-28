import "server-only";
import { z } from "zod";
import type { DatePrecision } from "@/domain/animals/age";
import type { Database } from "./database.types";
import { createSupabaseServerClient } from "./supabase";

export type AnimalSummary = {
  id: string;
  name: string;
  speciesName: string;
  speciesUncertain: boolean;
  birthDate: string | null;
  birthDatePrecision: DatePrecision | null;
};

type Enums = Database["public"]["Enums"];

export type AnimalDetail = AnimalSummary & {
  taxonId: string;
  sex: Enums["animal_sex"] | null;
  sterilized: Enums["tri_state"] | null;
  /** Instante de la última edición; identifica la versión de los datos. */
  updatedAt: string;
  /** La persona tiene un vínculo de tutor activo: puede editar. */
  canEdit: boolean;
};

export type TaxonOption = { id: string; slug: string; name: string };

export type SpeciesCatalog = {
  /** Botones rápidos, en el orden del catálogo. */
  quickPicks: TaxonOption[];
  /** Todas las demás opciones, agrupadas por grupo de cuidado. */
  groups: { slug: string; name: string; taxa: TaxonOption[] }[];
};

/**
 * Animales activos de la persona. No filtra por persona aquí: RLS solo
 * devuelve animales con un vínculo activo suyo (política animals_select_bonded).
 */
export async function listMyAnimals(): Promise<AnimalSummary[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("animals")
    .select("id, name, birth_date, birth_date_precision, taxon_certainty, taxon:taxa(common_name_es)")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudieron leer los animales: ${error.code}`);
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    speciesName: row.taxon.common_name_es,
    speciesUncertain: row.taxon_certainty === "uncertain",
    birthDate: row.birth_date,
    birthDatePrecision: row.birth_date_precision,
  }));
}

/**
 * Un animal visible para la persona, o null si no existe o no es suyo: las
 * dos situaciones se ven igual para no revelar qué identificadores existen.
 */
export async function getMyAnimal(id: string): Promise<AnimalDetail | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const supabase = await createSupabaseServerClient();
  const [animal, bond] = await Promise.all([
    supabase
      .from("animals")
      .select(
        "id, name, taxon_id, taxon_certainty, sex, sterilized, birth_date, birth_date_precision, updated_at, taxon:taxa(common_name_es)",
      )
      .eq("id", id)
      .eq("status", "active")
      .maybeSingle(),
    // RLS de bonds: cada persona solo ve los suyos.
    supabase
      .from("bonds")
      .select("id")
      .eq("animal_id", id)
      .eq("kind", "tutor")
      .eq("status", "active")
      .limit(1),
  ]);
  if (animal.error) throw new Error(`No se pudo leer el animal: ${animal.error.code}`);
  if (!animal.data) return null;
  const row = animal.data;
  return {
    id: row.id,
    name: row.name,
    taxonId: row.taxon_id,
    speciesName: row.taxon.common_name_es,
    speciesUncertain: row.taxon_certainty === "uncertain",
    sex: row.sex,
    sterilized: row.sterilized,
    birthDate: row.birth_date,
    birthDatePrecision: row.birth_date_precision,
    updatedAt: row.updated_at,
    canEdit: (bond.data?.length ?? 0) > 0,
  };
}

/** Catálogo de especies para el formulario de alta. */
export async function getSpeciesCatalog(): Promise<SpeciesCatalog> {
  const supabase = await createSupabaseServerClient();
  const [groups, taxa] = await Promise.all([
    supabase.from("care_groups").select("slug, name_es").order("sort_order"),
    supabase.from("taxa").select("id, slug, common_name_es, care_group, is_quick_pick").order("sort_order"),
  ]);
  if (groups.error) throw new Error(`No se pudo leer el catálogo: ${groups.error.code}`);
  if (taxa.error) throw new Error(`No se pudo leer el catálogo: ${taxa.error.code}`);

  const option = (t: (typeof taxa.data)[number]): TaxonOption => ({ id: t.id, slug: t.slug, name: t.common_name_es });
  return {
    quickPicks: taxa.data.filter((t) => t.is_quick_pick).map(option),
    groups: groups.data
      .map((g) => ({
        slug: g.slug,
        name: g.name_es,
        taxa: taxa.data.filter((t) => !t.is_quick_pick && t.care_group === g.slug).map(option),
      }))
      .filter((g) => g.taxa.length > 0),
  };
}

/**
 * Zona horaria IANA de la persona, para calcular «hoy» y la edad.
 * Sin zona guardada se usa la de Ciudad de México (es-MX).
 */
export async function getMyTimeZone(userId: string): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("parties").select("time_zone").eq("user_id", userId).maybeSingle();
  return data?.time_zone ?? "America/Mexico_City";
}
