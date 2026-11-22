import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import type { Database } from "./database.types";

/**
 * URL y clave PUBLICABLE del proyecto de Supabase. Ambas son públicas:
 * la protección real está en las políticas RLS de la base de datos.
 * La clave de servicio (secret / service_role) nunca se usa en la app.
 */
export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Revisa .env.example.",
    );
  }
  if (publishableKey.startsWith("sb_secret_")) {
    throw new Error("Se configuró una clave secreta como clave pública. Usa la clave publicable.");
  }
  return { url, publishableKey };
}

/**
 * Cliente de Supabase para Server Components, Server Actions y Route Handlers.
 * Se crea uno por petición (nunca se comparte entre personas).
 */
export async function createSupabaseServerClient() {
  // La sesión es siempre de la petición: nunca se prerenderiza. Sin esto, el
  // cliente de Auth arranca tareas con la hora actual durante el prerender.
  await connection();
  const cookieStore = await cookies();
  const { url, publishableKey } = supabaseConfig();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Desde un Server Component no se pueden escribir cookies.
          // El proxy (src/proxy.ts) renueva la sesión en cada petición.
        }
      },
    },
  });
}
