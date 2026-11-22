"use client";

import { useActionState, useId, useRef, useState } from "react";
import { Stack } from "@/design-system/layout";
import { FormField } from "@/design-system/patterns";
import { ButtonLink, Checkbox, Input, RadioGroup, Select } from "@/design-system/primitives";
import { FormMessage } from "@/features/forms/FormMessage";
import { SubmitButton } from "@/features/forms/SubmitButton";
import { useFocusResult } from "@/features/forms/useFocusResult";
import { getMessages } from "@/i18n";
import type { SpeciesCatalog } from "@/server/animals";
import { type AnimalFormState, type AnimalFormValues, OTHER_SPECIES } from "./form-state";
import styles from "./AnimalForm.module.css";

type FieldsProps = {
  catalog: SpeciesCatalog;
  /** «Hoy» de la persona (AAAA-MM-DD), tope del selector de fecha. */
  today: string;
};

type AnimalFormProps = FieldsProps & {
  /** Server Action: createAnimal para el alta o updateAnimal ligada al animal. */
  action: (state: AnimalFormState, formData: FormData) => Promise<AnimalFormState>;
  /** Datos guardados, al editar. */
  initialValues?: AnimalFormValues;
  /** A dónde vuelve «Cancelar». */
  backHref: string;
  backLabel: string;
};

export function AnimalForm({ catalog, today, action: submit, initialValues, backHref, backLabel }: AnimalFormProps) {
  const t = getMessages().animalForm;
  const [state, action] = useActionState(submit, { status: "idle", attempt: 0, values: initialValues });
  const formRef = useRef<HTMLFormElement>(null);
  useFocusResult(formRef, state);

  return (
    <form ref={formRef} action={action} noValidate>
      <Stack gap="lg">
        <FormMessage state={state} />
        {/* Se vuelve a montar tras cada envío con error para mostrar lo que se escribió. */}
        <Fields key={state.attempt} state={state} catalog={catalog} today={today} />
        <div className={styles.actions}>
          <SubmitButton pendingLabel={t.submitting}>{t.submit}</SubmitButton>
          <ButtonLink href={backHref} variant="ghost">
            {backLabel}
          </ButtonLink>
        </div>
      </Stack>
    </form>
  );
}

function Fields({ state, catalog, today }: { state: AnimalFormState } & FieldsProps) {
  const t = getMessages().animalForm;
  const values = state.values ?? {};
  const errors = state.fieldErrors ?? {};
  // Ids únicos por formulario: Next conserva ocultas las páginas visitadas y
  // dos formularios con los mismos ids romperían la asociación de etiquetas.
  const uid = useId();
  const id = (name: string) => `${uid}${name}`;
  const [species, setSpecies] = useState(values.taxonChoice ?? "");
  const [precision, setPrecision] = useState(values.birthPrecision ?? "unknown");

  const listed = species === OTHER_SPECIES;
  const otherAnimal = catalog.quickPicks.find((taxon) => taxon.slug === "animal");
  const speciesOptions = [
    ...catalog.quickPicks
      .filter((taxon) => taxon !== otherAnimal)
      .map((taxon) => ({ value: taxon.id, label: t.quickLabels[taxon.slug] ?? taxon.name })),
    { value: OTHER_SPECIES, label: t.otherSpecies, hint: t.otherSpeciesHint },
    ...(otherAnimal
      ? [{ value: otherAnimal.id, label: t.quickLabels.animal ?? otherAnimal.name, hint: t.otherAnimalHint }]
      : []),
  ];

  const birthError = errors.birth;
  const monthError = birthError === t.validation.birthMonthRequired ? birthError : undefined;
  const yearError = precision !== "day" && !monthError ? birthError : undefined;

  return (
    <>
      <FormField id={id("name")} label={t.name} hint={t.nameHint} error={errors.name} required>
        {(control) => (
          <Input {...control} name="name" autoComplete="off" maxLength={60} defaultValue={values.name} />
        )}
      </FormField>

      <Stack gap="sm">
        <RadioGroup
          id={id("taxon")}
          name="taxon"
          legend={t.species}
          options={speciesOptions}
          defaultValue={values.taxonChoice}
          error={listed ? undefined : errors.taxon}
          onValueChange={setSpecies}
          required
        />
        {listed ? (
          <FormField id={id("taxon_listed")} label={t.speciesList} error={errors.taxon} required>
            {(control) => (
              <Select {...control} name="taxon_listed" defaultValue={values.taxonListed ?? ""}>
                <option value="" disabled>
                  {t.speciesListPlaceholder}
                </option>
                {catalog.groups.map((group) => (
                  <optgroup key={group.slug} label={group.name}>
                    {group.taxa.map((taxon) => (
                      <option key={taxon.id} value={taxon.id}>
                        {taxon.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            )}
          </FormField>
        ) : null}
        <Checkbox id={id("taxon_uncertain")} name="taxon_uncertain" label={t.uncertain} defaultChecked={values.uncertain} />
      </Stack>

      <Stack gap="md" as="section" aria-labelledby={id("optional-title")}>
        <h2 id={id("optional-title")} className={styles.sectionTitle}>
          {t.optionalTitle}
        </h2>

        <RadioGroup
          id={id("sex")}
          name="sex"
          legend={t.sex}
          orientation="horizontal"
          defaultValue={values.sex}
          options={[
            { value: "female", label: t.sexOptions.female },
            { value: "male", label: t.sexOptions.male },
            { value: "unknown", label: t.sexOptions.unknown },
          ]}
        />

        <Stack gap="sm">
          <RadioGroup
            id={id("birth_precision")}
            name="birth_precision"
            legend={t.birth}
            defaultValue={precision}
            onValueChange={setPrecision}
            options={[
              { value: "unknown", label: t.birthOptions.unknown },
              { value: "year", label: t.birthOptions.year },
              { value: "month", label: t.birthOptions.month },
              { value: "day", label: t.birthOptions.day },
            ]}
          />
          {precision === "day" ? (
            <FormField id={id("birth_day")} label={t.birthDate} error={birthError} required>
              {(control) => (
                <Input
                  {...control}
                  name="birth_day"
                  type="date"
                  min="1900-01-01"
                  max={today}
                  defaultValue={values.birthDay}
                  className={styles.short}
                />
              )}
            </FormField>
          ) : null}
          {precision === "month" || precision === "year" ? (
            <div className={styles.dateParts}>
              {precision === "month" ? (
                <FormField id={id("birth_month")} label={t.birthMonth} error={monthError} required>
                  {(control) => (
                    <Select {...control} name="birth_month" defaultValue={values.birthMonth ?? ""}>
                      <option value="" disabled>
                        {t.speciesListPlaceholder}
                      </option>
                      {t.months.map((month, index) => (
                        <option key={month} value={String(index + 1)}>
                          {month}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormField>
              ) : null}
              <FormField id={id("birth_year")} label={t.birthYear} hint={t.birthYearHint} error={yearError} required>
                {(control) => (
                  <Input
                    {...control}
                    name="birth_year"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    defaultValue={values.birthYear}
                    className={styles.year}
                  />
                )}
              </FormField>
            </div>
          ) : null}
        </Stack>

        <RadioGroup
          id={id("sterilized")}
          name="sterilized"
          legend={t.sterilized}
          orientation="horizontal"
          defaultValue={values.sterilized}
          options={[
            { value: "yes", label: t.sterilizedOptions.yes },
            { value: "no", label: t.sterilizedOptions.no },
            { value: "unknown", label: t.sterilizedOptions.unknown },
          ]}
        />
      </Stack>
    </>
  );
}
