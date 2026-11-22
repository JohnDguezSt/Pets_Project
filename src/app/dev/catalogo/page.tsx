import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Cluster, Container, Grid, Stack } from "@/design-system/layout";
import { Alert, EmptyState, FormField } from "@/design-system/patterns";
import { Button, ButtonLink, Card, Checkbox, Input, RadioGroup, Select } from "@/design-system/primitives";
import { isCatalogEnabled } from "./enabled";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Catálogo de componentes",
  robots: { index: false, follow: false },
};

/**
 * Catálogo interno (doc. 16 §10): cada componente con sus variantes y estados,
 * en tema claro y oscuro a la vez. Los ejemplos son ficticios.
 */
export default function CatalogPage() {
  if (!isCatalogEnabled()) notFound();

  return (
    <Container as="main" className={styles.page}>
      <Stack gap="section">
        <Stack gap="xs" as="header">
          <h1>Catálogo de componentes</h1>
          <p className={styles.muted}>Interno. Solo visible en desarrollo y vistas previas.</p>
        </Stack>

        <Specimen title="Button">
          {(theme) => (
            <Stack gap="md">
              <Cluster>
                <Button>Guardar</Button>
                <Button variant="secondary">Editar</Button>
                <Button variant="ghost">Cancelar</Button>
                <Button variant="danger">Eliminar</Button>
              </Cluster>
              <Cluster>
                <Button size="sm">Pequeño</Button>
                <Button disabled>Deshabilitado</Button>
                <Button loading loadingLabel="Guardando…" id={`btn-loading-${theme}`}>
                  Guardar
                </Button>
              </Cluster>
              <Cluster>
                <ButtonLink href="/dev/catalogo">Registrar mascota</ButtonLink>
                <ButtonLink href="/dev/catalogo" variant="ghost">
                  Volver
                </ButtonLink>
              </Cluster>
            </Stack>
          )}
        </Specimen>

        <Specimen title="FormField + Input + Select">
          {(theme) => (
            <Stack gap="lg">
              <FormField id={`name-${theme}`} label="Nombre" required hint="Como lo llamas en casa.">
                {(control) => <Input {...control} name="name" autoComplete="off" />}
              </FormField>
              <FormField id={`chip-${theme}`} label="Fecha aproximada de nacimiento">
                {(control) => <Input {...control} name="birth" type="date" />}
              </FormField>
              <FormField
                id={`weight-${theme}`}
                label="Peso en kg"
                error="Escribe un número mayor que 0."
              >
                {(control) => <Input {...control} name="weight" inputMode="decimal" defaultValue="0" />}
              </FormField>
              <FormField id={`group-${theme}`} label="Grupo">
                {(control) => (
                  <Select {...control} name="group" defaultValue="">
                    <option value="" disabled>
                      Elige un grupo
                    </option>
                    <option value="dog">Perro</option>
                    <option value="cat">Gato</option>
                    <option value="small-mammal">Mamífero pequeño</option>
                    <option value="bird">Ave</option>
                  </Select>
                )}
              </FormField>
              <FormField id={`disabled-${theme}`} label="Campo deshabilitado">
                {(control) => <Input {...control} name="disabled" disabled defaultValue="No editable" />}
              </FormField>
            </Stack>
          )}
        </Specimen>

        <Specimen title="RadioGroup">
          {(theme) => (
            <Stack gap="lg">
              <RadioGroup
                id={`sex-${theme}`}
                name={`sex-${theme}`}
                legend="Sexo"
                defaultValue="unknown"
                options={[
                  { value: "female", label: "Hembra" },
                  { value: "male", label: "Macho" },
                  { value: "unknown", label: "No lo sé" },
                ]}
              />
              <RadioGroup
                id={`sterilized-${theme}`}
                name={`sterilized-${theme}`}
                legend="¿Está esterilizado?"
                orientation="horizontal"
                error="Elige una opción."
                options={[
                  { value: "yes", label: "Sí" },
                  { value: "no", label: "No" },
                  { value: "unknown", label: "No lo sé", hint: "Puedes cambiarlo después." },
                ]}
              />
            </Stack>
          )}
        </Specimen>

        <Specimen title="Checkbox">
          {(theme) => (
            <Stack gap="xs">
              <Checkbox id={`uncertain-${theme}`} name="uncertain" label="No estoy seguro de la especie exacta" />
              <Checkbox
                id={`hint-${theme}`}
                name="hint"
                label="Con aclaración"
                hint="Texto breve debajo de la etiqueta."
                defaultChecked
              />
              <Checkbox id={`off-${theme}`} name="off" label="Deshabilitada" disabled />
            </Stack>
          )}
        </Specimen>

        <Specimen title="Alert">
          {() => (
            <Stack gap="sm">
              <Alert tone="info" title="La comunidad llegará después">
                Por ahora puedes registrar a tus animales.
              </Alert>
              <Alert tone="success" title="Cambios guardados" />
              <Alert tone="warning" title="Sin conexión">
                Tus datos siguen en este dispositivo. Vuelve a intentarlo cuando tengas internet.
              </Alert>
              <Alert tone="danger" title="No pudimos guardar">
                Revisa los campos marcados.
              </Alert>
            </Stack>
          )}
        </Specimen>

        <Specimen title="Card y EmptyState">
          {() => (
            <Stack gap="md">
              <Grid min="sm">
                <Card as="article">
                  <Stack gap="xs">
                    <h3>Nombre largo de ejemplo para probar el ajuste de línea</h3>
                    <p className={styles.muted}>Ejemplo ficticio · Gato</p>
                  </Stack>
                </Card>
                <Card as="article" padding="sm">
                  <Stack gap="xs">
                    <h3>Relleno pequeño</h3>
                    <p className={styles.muted}>Ejemplo ficticio · Conejo</p>
                  </Stack>
                </Card>
              </Grid>
              <EmptyState
                headingLevel={3}
                title="Agrega a tu primera mascota"
                description="Empieza con su nombre y especie. Lo demás puede esperar."
                action={<Button>Agregar mascota</Button>}
              />
            </Stack>
          )}
        </Specimen>
      </Stack>
    </Container>
  );
}

/** Muestra el mismo ejemplo en tema claro y oscuro, lado a lado. */
function Specimen({ title, children }: { title: string; children: (theme: "light" | "dark") => ReactNode }) {
  return (
    <Stack gap="sm" as="section" aria-label={title}>
      <h2>{title}</h2>
      <Grid min="lg" gap="md">
        {(["light", "dark"] as const).map((theme) => (
          <div key={theme} data-theme={theme} className={styles.theme}>
            <p className={styles.themeLabel}>{theme === "light" ? "Claro" : "Oscuro"}</p>
            {children(theme)}
          </div>
        ))}
      </Grid>
    </Stack>
  );
}
