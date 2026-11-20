/**
 * Textos de la interfaz en español de México (idioma inicial confirmado).
 *
 * Todos los textos visibles viven aquí desde el primer día para que la
 * interfaz sea traducible sin reescribir componentes (doc. 16 §13).
 * Se agrupan por área. Trato de tú, directo y sin culpa (doc. 20 §2).
 */
export const esMX = {
  app: {
    name: "Plataforma de cuidado animal",
    shortName: "Cuidado animal",
    description: "Expediente, cuidados y recordatorios de tus animales, en un solo lugar.",
  },
  home: {
    title: "Estamos construyendo la plataforma",
    intro:
      "Esta es una versión en desarrollo. Todavía no guarda datos ni tiene cuentas.",
    nextTitle: "Lo que llegará primero",
    next: [
      "Crear tu cuenta.",
      "Registrar a tus animales, de cualquier especie.",
      "Consultar y editar su perfil básico.",
    ],
    community: "La comunidad de tu ciudad llegará más adelante. No mostramos actividad simulada.",
  },
} as const;

export type Messages = typeof esMX;
