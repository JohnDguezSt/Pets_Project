import type { ReactNode } from "react";
import { Container, Stack } from "@/design-system/layout";
import styles from "./AuthPage.module.css";

/** Estructura común de las pantallas de cuenta: título, introducción y formulario. */
export function AuthPage({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <Container as="main" width="reading" className={styles.page}>
      <Stack gap="lg">
        <Stack gap="sm">
          <h1>{title}</h1>
          {intro ? <p className={styles.intro}>{intro}</p> : null}
        </Stack>
        {children}
      </Stack>
    </Container>
  );
}
