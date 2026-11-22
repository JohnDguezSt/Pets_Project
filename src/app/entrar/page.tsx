import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Alert } from "@/design-system/patterns";
import { Stack } from "@/design-system/layout";
import { safeNextPath } from "@/domain/auth/safe-next-path";
import { AuthPage } from "@/features/auth/AuthPage";
import { SignInForm } from "@/features/auth/SignInForm";
import { getMessages } from "@/i18n";

const t = getMessages().auth.signIn;

export const metadata: Metadata = { title: t.title };

export default function SignInPage({ searchParams }: PageProps<"/entrar">) {
  return (
    <AuthPage title={t.title}>
      <Suspense fallback={<SignInForm />}>
        <SignInWithParams searchParams={searchParams} />
      </Suspense>
      <Stack gap="xs" as="ul" role="list">
        <li>
          <Link href="/recuperar">{t.forgot}</Link>
        </li>
        <li>
          {t.noAccount} <Link href="/crear-cuenta">{t.createAccount}</Link>
        </li>
      </Stack>
    </AuthPage>
  );
}

async function SignInWithParams({ searchParams }: Pick<PageProps<"/entrar">, "searchParams">) {
  const params = await searchParams;
  const rawNext = typeof params.siguiente === "string" ? params.siguiente : undefined;
  const next = rawNext ? safeNextPath(rawNext) : undefined;
  const passwordUpdated = params.aviso === "contrasena-actualizada";

  return (
    <Stack gap="md">
      {passwordUpdated ? (
        <Alert tone="success" announce="polite">
          {t.passwordUpdated}
        </Alert>
      ) : null}
      <SignInForm next={next} />
    </Stack>
  );
}
