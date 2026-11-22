"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { safeNextPath } from "@/domain/auth/safe-next-path";
import { getMessages } from "@/i18n";
import { createSupabaseServerClient } from "@/server/supabase";
import type { AuthFormState } from "./form-state";
import {
  confirmSchema,
  newPasswordSchema,
  resetRequestSchema,
  signInSchema,
  signUpSchema,
} from "./schemas";

const t = getMessages().auth;

function text(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === "string" ? value : undefined;
}

function fieldErrors(error: z.ZodError): AuthFormState["fieldErrors"] {
  const result: NonNullable<AuthFormState["fieldErrors"]> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if ((field === "email" || field === "password") && !result[field]) {
      result[field] = issue.message;
    }
  }
  return result;
}

/** Traduce los códigos de Supabase Auth a mensajes para la persona. */
function authErrorMessage(code: string | undefined): string {
  switch (code) {
    case "invalid_credentials":
      return t.errors.invalidCredentials;
    case "email_not_confirmed":
      return t.errors.emailNotConfirmed;
    case "weak_password":
      return t.errors.weakPassword;
    case "same_password":
      return t.errors.samePassword;
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return t.errors.rateLimited;
    case "otp_expired":
    case "flow_state_expired":
      return t.errors.linkInvalid;
    case "flow_state_not_found":
    case "bad_code_verifier":
    case "pkce_code_verifier_not_found":
      return t.errors.otherBrowser;
    default:
      return t.errors.unexpected;
  }
}

/**
 * Origen de esta petición para los enlaces de los correos. Next.js ya rechaza
 * Server Actions cuyo Origin no coincide con el Host, y Supabase solo acepta
 * destinos de su lista de URLs permitidas.
 */
async function requestOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = text(formData, "email");
  const parsed = signInSchema.safeParse({ email, password: text(formData, "password") });
  if (!parsed.success) {
    return { status: "error", message: t.errors.formTitle, fieldErrors: fieldErrors(parsed.error), values: { email } };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { status: "error", message: authErrorMessage(error.code), values: { email: parsed.data.email } };
  }

  redirect(safeNextPath(text(formData, "siguiente")));
}

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = text(formData, "email");
  const parsed = signUpSchema.safeParse({
    email,
    password: text(formData, "password"),
    timeZone: text(formData, "time_zone") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: t.errors.formTitle, fieldErrors: fieldErrors(parsed.error), values: { email } };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${await requestOrigin()}/auth/confirmar?tipo=alta`,
      // Metadatos que lee private.handle_new_user(); la base los valida.
      data: parsed.data.timeZone ? { time_zone: parsed.data.timeZone } : {},
    },
  });

  if (error) {
    return { status: "error", message: authErrorMessage(error.code), values: { email: parsed.data.email } };
  }

  // Mismo mensaje exista o no la cuenta: no revela qué correos están registrados.
  return { status: "success", message: t.signUp.sent };
}

export async function requestPasswordReset(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = text(formData, "email");
  const parsed = resetRequestSchema.safeParse({ email });
  if (!parsed.success) {
    return { status: "error", message: t.errors.formTitle, fieldErrors: fieldErrors(parsed.error), values: { email } };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await requestOrigin()}/auth/confirmar?tipo=recuperacion`,
  });

  if (error?.code === "over_email_send_rate_limit" || error?.code === "over_request_rate_limit") {
    return { status: "error", message: t.errors.rateLimited, values: { email: parsed.data.email } };
  }
  // Cualquier otro resultado se responde igual para no revelar si el correo existe.
  return { status: "success", message: t.reset.sent };
}

/**
 * Confirma un enlace del correo. Se hace con un botón (POST) y no al abrir el
 * enlace: así los analizadores de correo que visitan los enlaces no lo gastan.
 */
export async function confirmEmailLink(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = confirmSchema.safeParse(
    formData.has("code")
      ? { code: text(formData, "code"), purpose: text(formData, "purpose") }
      : { tokenHash: text(formData, "token_hash"), type: text(formData, "type") },
  );
  if (!parsed.success) return { status: "error", message: t.confirm.missing };

  const supabase = await createSupabaseServerClient();
  let recovery: boolean;
  if ("code" in parsed.data) {
    const { error } = await supabase.auth.exchangeCodeForSession(parsed.data.code);
    if (error) return { status: "error", message: authErrorMessage(error.code ?? "otp_expired") };
    recovery = parsed.data.purpose === "recuperacion";
  } else {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: parsed.data.tokenHash,
      type: parsed.data.type,
    });
    if (error) return { status: "error", message: authErrorMessage(error.code ?? "otp_expired") };
    recovery = parsed.data.type === "recovery";
  }

  redirect(recovery ? "/nueva-contrasena" : "/mis-mascotas");
}

export async function updatePassword(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = newPasswordSchema.safeParse({ password: text(formData, "password") });
  if (!parsed.success) {
    return { status: "error", message: t.errors.formTitle, fieldErrors: fieldErrors(parsed.error) };
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/entrar?siguiente=%2Fnueva-contrasena");

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", message: authErrorMessage(error.code) };

  // Cierra todas las sesiones: quien pidió recuperar puede haber perdido el control de una.
  await supabase.auth.signOut({ scope: "global" });
  redirect("/entrar?aviso=contrasena-actualizada");
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
