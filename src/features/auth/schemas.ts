import { z } from "zod";
import { getMessages } from "@/i18n";

const v = getMessages().auth.validation;

/** Límite de bcrypt (Supabase Auth): más allá de 72 bytes se ignora. */
const PASSWORD_MAX = 72;
export const PASSWORD_MIN = 8;

const email = z
  .string({ error: v.emailRequired })
  .trim()
  .min(1, v.emailRequired)
  .max(254, v.emailInvalid)
  .pipe(z.email({ error: v.emailInvalid }));

const newPassword = z
  .string({ error: v.passwordRequired })
  .min(1, v.passwordRequired)
  .min(PASSWORD_MIN, v.passwordTooShort)
  .refine((value) => new TextEncoder().encode(value).length <= PASSWORD_MAX, v.passwordTooLong);

export const signInSchema = z.object({
  email,
  password: z.string({ error: v.passwordRequired }).min(1, v.passwordRequired).max(PASSWORD_MAX * 4),
});

export const signUpSchema = z.object({
  email,
  password: newPassword,
  // Zona IANA del navegador; si no es válida, la base de datos la descarta.
  timeZone: z.string().max(64).optional(),
});

export const resetRequestSchema = z.object({ email });

export const newPasswordSchema = z.object({ password: newPassword });

export const confirmSchema = z.object({
  tokenHash: z.string().min(1).max(256),
  type: z.enum(["email", "recovery"]),
});
