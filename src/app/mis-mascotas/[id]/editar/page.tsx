import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container, Stack } from "@/design-system/layout";
import { todayIn, toIsoDate } from "@/domain/animals/age";
import { updateAnimal } from "@/features/animals/actions";
import { AnimalForm } from "@/features/animals/AnimalForm";
import { formValuesFrom } from "@/features/animals/form-values";
import { getMessages } from "@/i18n";
import { getMyAnimal, getMyTimeZone, getSpeciesCatalog } from "@/server/animals";
import { requireUser } from "@/server/auth";
import styles from "../page.module.css";

const t = getMessages().animalProfile;

export const metadata: Metadata = { title: t.edit, robots: { index: false } };

/** Editar el perfil básico (M-15): el mismo formulario del alta, con los datos cargados. */
export default function EditAnimalPage(props: PageProps<"/mis-mascotas/[id]/editar">) {
  return (
    <Container as="main" width="reading" className={styles.page}>
      <Suspense fallback={<p>{getMessages().ui.loading}</p>}>
        <Edit {...props} />
      </Suspense>
    </Container>
  );
}

async function Edit({ params }: PageProps<"/mis-mascotas/[id]/editar">) {
  const { id } = await params;
  const user = await requireUser(`/mis-mascotas/${id}/editar`);
  const [animal, catalog, timeZone] = await Promise.all([getMyAnimal(id), getSpeciesCatalog(), getMyTimeZone(user.id)]);
  // Sin vínculo de tutor tampoco se ofrece editar; la base lo impediría de todos modos.
  if (!animal || !animal.canEdit) notFound();

  const profileHref = `/mis-mascotas/${animal.id}`;
  return (
    <Stack gap="lg">
      <h1>{t.editTitle(animal.name)}</h1>
      {/* Otra versión de los datos = formulario nuevo, aunque Next conserve la página anterior. */}
      <AnimalForm
        key={animal.updatedAt}
        action={updateAnimal.bind(null, animal.id)}
        catalog={catalog}
        today={toIsoDate(todayIn(timeZone))}
        initialValues={formValuesFrom(animal, catalog)}
        backHref={profileHref}
        backLabel={getMessages().ui.cancel}
      />
    </Stack>
  );
}
