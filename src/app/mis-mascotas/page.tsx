import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Stack } from "@/design-system/layout";
import { getMessages } from "@/i18n";
import { requireUser } from "@/server/auth";
import styles from "./page.module.css";

const t = getMessages().myPets;

export const metadata: Metadata = { title: t.title, robots: { index: false } };

/** Página protegida mínima. El paso 4 la convierte en la lista de animales (M-01). */
export default function MyPetsPage() {
  return (
    <Container as="main" width="reading" className={styles.page}>
      <Stack gap="md">
        <h1>{t.title}</h1>
        <Suspense fallback={<p>{getMessages().ui.loading}</p>}>
          <Owner />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function Owner() {
  const user = await requireUser("/mis-mascotas");
  return (
    <Stack gap="sm">
      {user.email ? (
        <p className={styles.muted}>
          {t.signedInAs} <strong>{user.email}</strong>
        </p>
      ) : null}
      <p>{t.comingSoon}</p>
    </Stack>
  );
}
