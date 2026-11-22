import "server-only";
import type { DatePrecision } from "@/domain/animals/age";
import { createSupabaseServerClient } from "./supabase";

export type AnimalSummary = {
  id: string;
  name: string;
  speciesName: string;
  speciesUncertain: boolean;
  birthDate: string | null;
  birthDatePrecision: DatePrecision | null;
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
