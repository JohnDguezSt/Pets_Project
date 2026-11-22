import { expect } from "@playwright/test";

/**
 * Lee los correos que Supabase local entrega a Mailpit (nunca salen a internet).
 */
const MAILPIT_URL = process.env.MAILPIT_URL ?? "http://127.0.0.1:54324";

type MailpitSearch = { messages: { ID: string; Subject: string }[] };
type MailpitMessage = { HTML: string };

/** Espera el último correo para `to` cuyo asunto coincide y devuelve su enlace. */
export async function enlaceDelCorreo(to: string, asunto: RegExp): Promise<string> {
  let link: string | undefined;
  await expect
    .poll(
      async () => {
        const query = encodeURIComponent(`to:"${to}"`);
        const search = (await (await fetch(`${MAILPIT_URL}/api/v1/search?query=${query}`)).json()) as MailpitSearch;
        const message = search.messages.find((m) => asunto.test(m.Subject));
        if (!message) return undefined;
        const full = (await (await fetch(`${MAILPIT_URL}/api/v1/message/${message.ID}`)).json()) as MailpitMessage;
        const match = full.HTML.match(/href="([^"]*token_hash=[^"]*)"/);
        link = match?.[1]?.replaceAll("&amp;", "&");
        return link;
      },
      { message: `correo «${asunto}» para ${to}`, timeout: 15_000 },
    )
    .toBeTruthy();
  return link!;
}

/** Correo único por prueba; el dominio .test está reservado y nunca existe. */
export function correoDePrueba(etiqueta: string): string {
  return `${etiqueta}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.test`;
}
