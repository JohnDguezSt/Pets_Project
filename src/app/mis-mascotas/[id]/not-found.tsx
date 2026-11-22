import Link from "next/link";
import { Container, Stack } from "@/design-system/layout";
import { getMessages } from "@/i18n";
import styles from "./page.module.css";

/** Igual si el animal no existe o si no es de la persona: no se revela cuál de las dos. */
export default function AnimalNotFound() {
  const t = getMessages().animalProfile;
  return (
    <Container as="main" width="reading" className={styles.page}>
      <Stack gap="md">
        <h1>{t.notFoundTitle}</h1>
        <p>{t.notFound}</p>
        <p>
          <Link href="/mis-mascotas">{t.back}</Link>
        </p>
      </Stack>
    </Container>
  );
}
