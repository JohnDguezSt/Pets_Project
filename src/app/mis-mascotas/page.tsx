import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Stack } from "@/design-system/layout";
import { Alert, EmptyState } from "@/design-system/patterns";
import { ButtonLink, Card } from "@/design-system/primitives";
import { ageFrom, parseCivilDate, todayIn } from "@/domain/animals/age";
import { formatAge } from "@/features/animals/format-age";
import { getMessages } from "@/i18n";
import { listMyAnimals, getMyTimeZone } from "@/server/animals";
import { requireUser } from "@/server/auth";
import styles from "./page.module.css";

const t = getMessages().myPets;

export const metadata: Metadata = { title: t.title, robots: { index: false } };

/** Mis mascotas (M-01): los animales con los que la persona tiene un vínculo activo. */
export default function MyPetsPage({ searchParams }: PageProps<"/mis-mascotas">) {
  return (
    <Container as="main" width="reading" className={styles.page}>
      <Stack gap="lg">
        <h1>{t.title}</h1>
        <Suspense fallback={<p>{getMessages().ui.loading}</p>}>
          <MyPets searchParams={searchParams} />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function MyPets({ searchParams }: Pick<PageProps<"/mis-mascotas">, "searchParams">) {
  const user = await requireUser("/mis-mascotas");
  const [animals, timeZone, params] = await Promise.all([listMyAnimals(), getMyTimeZone(user.id), searchParams]);
  const today = todayIn(timeZone);
  const registered = typeof params.registrado === "string" ? animals.find((a) => a.id === params.registrado) : undefined;

  return (
    <Stack gap="lg">
      {user.email ? (
        <p className={styles.muted}>
          {t.signedInAs} <strong>{user.email}</strong>
        </p>
      ) : null}

      {registered ? (
        <Alert tone="success" announce="polite">
          {t.registered(registered.name)}
        </Alert>
      ) : null}

      {animals.length === 0 ? (
        <EmptyState
          title={t.emptyTitle}
          description={t.emptyDescription}
          action={<ButtonLink href="/mis-mascotas/nueva">{t.add}</ButtonLink>}
        />
      ) : (
        <>
          <div>
            <ButtonLink href="/mis-mascotas/nueva">{t.add}</ButtonLink>
          </div>
          <Stack gap="sm" as="ul" role="list" aria-label={t.listLabel} className={styles.list}>
            {animals.map((animal) => (
              <Card as="li" key={animal.id}>
                <Stack gap="xs">
                  <h2 className={styles.name}>{animal.name}</h2>
                  <p className={styles.details}>
                    {animal.speciesUncertain ? `${animal.speciesName}, ${t.uncertainSpecies}` : animal.speciesName}
                    {" · "}
                    {formatAge(ageFrom(parseCivilDate(animal.birthDate), animal.birthDatePrecision, today))}
                  </p>
                </Stack>
              </Card>
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
}
