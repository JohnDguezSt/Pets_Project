import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Alert } from "@/design-system/patterns";
import { AuthPage } from "@/features/auth/AuthPage";
import { ConfirmLinkForm } from "@/features/auth/ConfirmLinkForm";
import { getMessages } from "@/i18n";

const t = getMessages().auth.confirm;

export const metadata: Metadata = {
  title: t.title,
  robots: { index: false },
  // El enlace lleva un token de un solo uso: no se envía a otros sitios.
  referrer: "no-referrer",
};

export default function ConfirmPage({ searchParams }: PageProps<"/auth/confirmar">) {
  return (
    <AuthPage title={t.title}>
      <Suspense fallback={<p>{getMessages().ui.loading}</p>}>
        <ConfirmWithParams searchParams={searchParams} />
      </Suspense>
    </AuthPage>
  );
}

async function ConfirmWithParams({ searchParams }: Pick<PageProps<"/auth/confirmar">, "searchParams">) {
  const params = await searchParams;
  const tokenHash = typeof params.token_hash === "string" ? params.token_hash : "";
  const type = params.type === "email" || params.type === "recovery" ? params.type : null;

  if (!tokenHash || !type) {
    return (
      <Alert tone="warning" title={t.missing}>
        <Link href="/recuperar">{getMessages().auth.reset.title}</Link>
      </Alert>
    );
  }
  return <ConfirmLinkForm tokenHash={tokenHash} type={type} />;
}
