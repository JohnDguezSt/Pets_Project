import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase";

export type CurrentUser = {
  id: string;
  email: string | null;
};

/**
 * Persona autenticada en esta petición, o null.
 *
 * Usa getClaims(), que verifica la firma del token (no se fía solo de la
 * cookie). Devuelve lo mínimo que necesita la interfaz.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  const email = typeof data.claims.email === "string" ? data.claims.email : null;
  return { id: data.claims.sub, email };
}

/** Exige sesión. Sin ella, manda a «Entrar» y luego regresa a `returnTo`. */
export async function requireUser(returnTo: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/entrar?siguiente=${encodeURIComponent(returnTo)}`);
  }
  return user;
}
