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
      <Stack gap="md">
        <Suspense fallback={null}>
          <PasswordUpdatedNotice searchParams={searchParams} />
        </Suspense>
        <SignInForm
          extra={
            <Suspense fallback={null}>
              <NextInput searchParams={searchParams} />
            </Suspense>
          }
        />
      </Stack>
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

type Params = Pick<PageProps<"/entrar">, "searchParams">;

async function PasswordUpdatedNotice({ searchParams }: Params) {
  const params = await searchParams;
  if (params.aviso !== "contrasena-actualizada") return null;
  return (
    <Alert tone="success" announce="polite">
      {t.passwordUpdated}
    </Alert>
  );
}

/** Ruta a la que volver después de entrar; solo rutas internas. */
async function NextInput({ searchParams }: Params) {
  const params = await searchParams;
  const rawNext = typeof params.siguiente === "string" ? params.siguiente : undefined;
  if (!rawNext) return null;
  return <input type="hidden" name="siguiente" value={safeNextPath(rawNext)} />;
}
