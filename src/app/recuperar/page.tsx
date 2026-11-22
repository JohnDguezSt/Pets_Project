import type { Metadata } from "next";
import Link from "next/link";
import { AuthPage } from "@/features/auth/AuthPage";
import { ResetRequestForm } from "@/features/auth/ResetRequestForm";
import { getMessages } from "@/i18n";

const t = getMessages().auth.reset;

export const metadata: Metadata = { title: t.title };

export default function ResetRequestPage() {
  return (
    <AuthPage title={t.title} intro={t.intro}>
      <ResetRequestForm />
      <p>
        <Link href="/entrar">{t.back}</Link>
      </p>
    </AuthPage>
  );
}
