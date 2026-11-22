import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPage } from "@/features/auth/AuthPage";
import { NewPasswordForm } from "@/features/auth/NewPasswordForm";
import { getMessages } from "@/i18n";
import { requireUser } from "@/server/auth";

const t = getMessages().auth.newPassword;

export const metadata: Metadata = { title: t.title, robots: { index: false } };

export default function NewPasswordPage() {
  return (
    <AuthPage title={t.title}>
      <Suspense fallback={<p>{getMessages().ui.loading}</p>}>
        <GuardedForm />
      </Suspense>
    </AuthPage>
  );
}

async function GuardedForm() {
  await requireUser("/nueva-contrasena");
  return <NewPasswordForm />;
}
