import Link from "next/link";
import { Cluster } from "@/design-system/layout";
import { Button } from "@/design-system/primitives";
import { getMessages } from "@/i18n";
import { getCurrentUser } from "@/server/auth";
import { signOut } from "./actions";

/** Enlaces de la cabecera según haya sesión o no. Lee la sesión: va dentro de <Suspense>. */
export async function SessionNav() {
  const t = getMessages().nav;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Cluster as="ul" role="list" gap="md">
        <li>
          <Link href="/entrar">{t.signIn}</Link>
        </li>
        <li>
          <Link href="/crear-cuenta">{t.signUp}</Link>
        </li>
      </Cluster>
    );
  }

  return (
    <Cluster as="ul" role="list" gap="md">
      <li>
        <Link href="/mis-mascotas">{t.myPets}</Link>
      </li>
      <li>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm">
            {t.signOut}
          </Button>
        </form>
      </li>
    </Cluster>
  );
}
