import { Container, Stack } from "@/design-system/layout";
import { getMessages } from "@/i18n";
import styles from "./page.module.css";

/** Inicio de la alfa: estado honesto, sin actividad simulada (doc. 22, UX-1). */
export default function HomePage() {
  const t = getMessages().home;

  return (
    <Container as="main" width="reading" className={styles.page}>
      <Stack gap="xl">
        <Stack gap="sm" as="header">
          <h1>{t.title}</h1>
          <p className={styles.lead}>{t.intro}</p>
        </Stack>

        <Stack gap="sm" as="section" aria-labelledby="next-title">
          <h2 id="next-title">{t.nextTitle}</h2>
          <Stack gap="xs" as="ul" role="list" className={styles.list}>
            {t.next.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </Stack>
        </Stack>

        <p className={styles.note}>{t.community}</p>
      </Stack>
    </Container>
  );
}
