import type { Metadata } from "next";
import Link from "next/link";
import { AuthPage } from "@/features/auth/AuthPage";
import { SignUpForm } from "@/features/auth/SignUpForm";
import { getMessages } from "@/i18n";

const t = getMessages().auth.signUp;

export const metadata: Metadata = { title: t.title };

export default function SignUpPage() {
  return (
    <AuthPage title={t.title} intro={t.intro}>
      <SignUpForm />
      <p>
        {t.haveAccount} <Link href="/entrar">{t.signIn}</Link>
      </p>
    </AuthPage>
  );
}
