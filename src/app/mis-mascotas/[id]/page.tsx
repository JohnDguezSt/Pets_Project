import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container, Stack } from "@/design-system/layout";
import { Alert } from "@/design-system/patterns";
import { ButtonLink } from "@/design-system/primitives";
import { ageFrom, parseCivilDate, todayIn } from "@/domain/animals/age";
import { formatAge } from "@/features/animals/format-age";
import { formatBirth } from "@/features/animals/format-birth";
import { getMessages } from "@/i18n";
import { getMyAnimal, getMyTimeZone } from "@/server/animals";
import { requireUser } from "@/server/auth";
import styles from "./page.module.css";

const t = getMessages().animalProfile;

export const metadata: Metadata = { title: t.title, robots: { index: false } };

/** Perfil básico de un animal (M-03). */
export default function AnimalProfilePage(props: PageProps<"/mis-mascotas/[id]">) {
  return (
    <Container as="main" width="reading" className={styles.page}>
      <Stack gap="lg">
        <p>
          <Link href="/mis-mascotas">{t.back}</Link>
        </p>
        <Suspense fallback={<p>{getMessages().ui.loading}</p>}>
          <Profile {...props} />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function Profile({ params, searchParams }: PageProps<"/mis-mascotas/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/mis-mascotas/${id}`);
  const [animal, timeZone, query] = await Promise.all([getMyAnimal(id), getMyTimeZone(user.id), searchParams]);
  if (!animal) notFound();

  const editHref = `/mis-mascotas/${animal.id}/editar`;
  const birth = formatBirth(animal.birthDate, animal.birthDatePrecision);
  const age = formatAge(ageFrom(parseCivilDate(animal.birthDate), animal.birthDatePrecision, todayIn(timeZone)));

  const missing = (linkLabel: string) => (
    <>
      {t.notRecorded}
      {animal.canEdit ? (
        <>
          {" · "}
          <Link href={editHref}>{linkLabel}</Link>
        </>
      ) : null}
    </>
  );

  return (
    <Stack gap="lg">
      <h1>{animal.name}</h1>

      {query.aviso === "guardado" ? (
        <Alert tone="success" announce="polite">
          {t.saved}
        </Alert>
      ) : null}

      <Stack gap="sm" as="section" aria-labelledby="details-title">
        <h2 id="details-title" className={styles.sectionTitle}>
          {t.detailsTitle}
        </h2>
        <dl className={styles.details}>
          <div>
            <dt>{t.species}</dt>
            <dd>
              {animal.speciesName}
              {animal.speciesUncertain ? `, ${getMessages().myPets.uncertainSpecies}` : null}
            </dd>
          </div>
          {birth ? (
            <>
              <div>
                <dt>{t.age}</dt>
                <dd>{age}</dd>
              </div>
              <div>
                <dt>{t.birth}</dt>
                <dd>{birth}</dd>
              </div>
            </>
          ) : (
            <div>
              <dt>{t.birth}</dt>
              <dd>{missing(t.addBirth)}</dd>
            </div>
          )}
          <div>
            <dt>{t.sex}</dt>
            <dd>{animal.sex ? t.sexValues[animal.sex] : missing(t.addSex)}</dd>
          </div>
          <div>
            <dt>{t.sterilized}</dt>
            <dd>{animal.sterilized ? t.sterilizedValues[animal.sterilized] : missing(t.addSterilized)}</dd>
          </div>
        </dl>
      </Stack>

      {animal.canEdit ? (
        <div>
          <ButtonLink href={editHref} variant="secondary">
            {t.edit}
          </ButtonLink>
        </div>
      ) : null}
    </Stack>
  );
}
