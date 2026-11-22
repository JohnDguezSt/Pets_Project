import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Stack } from "@/design-system/layout";
import { todayIn, toIsoDate } from "@/domain/animals/age";
import { AnimalForm } from "@/features/animals/AnimalForm";
import { getMessages } from "@/i18n";
import { getMyTimeZone, getSpeciesCatalog } from "@/server/animals";
import { requireUser } from "@/server/auth";
import styles from "./page.module.css";

const t = getMessages().animalForm;

export const metadata: Metadata = { title: t.title, robots: { index: false } };

/** Registrar mascota (M-08): una sola página; solo nombre y especie son obligatorios. */
export default function NewAnimalPage() {
  return (
    <Container as="main" width="reading" className={styles.page}>
      <Stack gap="lg">
        <Stack gap="sm">
          <h1>{t.title}</h1>
          <p className={styles.intro}>{t.intro}</p>
        </Stack>
        <Suspense fallback={<p>{getMessages().ui.loading}</p>}>
          <Form />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function Form() {
  const user = await requireUser("/mis-mascotas/nueva");
  const [catalog, timeZone] = await Promise.all([getSpeciesCatalog(), getMyTimeZone(user.id)]);
  return <AnimalForm catalog={catalog} today={toIsoDate(todayIn(timeZone))} />;
}
