/** Campos del formulario de alta que pueden mostrar un error. */
export type AnimalField = "name" | "taxon" | "birth";

/** Lo que la persona escribió, para volver a mostrarlo si hay errores. */
export type AnimalFormValues = {
  name?: string;
  taxonChoice?: string;
  taxonListed?: string;
  uncertain?: boolean;
  sex?: string;
  birthPrecision?: string;
  birthDay?: string;
  birthMonth?: string;
  birthYear?: string;
  sterilized?: string;
};

export type AnimalFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<AnimalField, string>>;
  values?: AnimalFormValues;
  /** Cambia en cada envío con error para volver a montar los campos con `values`. */
  attempt: number;
};


/** Valor del grupo de especie que muestra la lista completa. */
export const OTHER_SPECIES = "lista";
