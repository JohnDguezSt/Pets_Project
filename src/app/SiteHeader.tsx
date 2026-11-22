import Link from "next/link";
import { Suspense } from "react";
import { Cluster, Container } from "@/design-system/layout";
import { SessionNav } from "@/features/auth/SessionNav";
import { getMessages } from "@/i18n";
import styles from "./SiteHeader.module.css";

/** Cabecera común. La parte que depende de la sesión llega en streaming. */
export function SiteHeader() {
  const t = getMessages();
  return (
    <header className={styles.header}>
      <Container>
        <Cluster justify="between" gap="md" as="nav" aria-label={t.nav.label}>
          <Link href="/" className={styles.brand}>
            {t.app.shortName}
          </Link>
          <Suspense fallback={null}>
            <SessionNav />
          </Suspense>
        </Cluster>
      </Container>
    </header>
  );
}
