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
  /** Textos genéricos de los componentes del sistema de diseño. */
  ui: {
    optional: "opcional",
    loading: "Cargando…",
    status: {
      info: "Información",
      success: "Hecho",
      warning: "Atención",
      danger: "Error",
    },
  },
  home: {
    title: "Estamos construyendo la plataforma",
    intro:
      "Esta es una versión en desarrollo. Ya puedes crear tu cuenta; registrar animales llega en el siguiente paso.",
    nextTitle: "Lo que llegará primero",
    next: [
      "Registrar a tus animales, de cualquier especie.",
      "Consultar y editar su perfil básico.",
    ],
    community: "La comunidad de tu ciudad llegará más adelante. No mostramos actividad simulada.",
  },
  nav: {
    label: "Principal",
    home: "Inicio",
    myPets: "Mis mascotas",
    signIn: "Entrar",
    signUp: "Crear cuenta",
    signOut: "Salir",
  },
  auth: {
    fields: {
      email: "Correo electrónico",
      password: "Contraseña",
      newPassword: "Contraseña nueva",
      passwordHint: "Mínimo 8 caracteres. Una frase larga es más segura y fácil de recordar.",
    },
    validation: {
      emailRequired: "Escribe tu correo electrónico.",
      emailInvalid: "Escribe un correo válido, por ejemplo nombre@ejemplo.com.",
      passwordRequired: "Escribe tu contraseña.",
      passwordTooShort: "La contraseña necesita al menos 8 caracteres.",
      passwordTooLong: "La contraseña puede tener como máximo 72 caracteres.",
    },
    errors: {
      formTitle: "Revisa los datos marcados.",
      invalidCredentials: "El correo o la contraseña no coinciden.",
      emailNotConfirmed: "Primero confirma tu correo con el enlace que te enviamos.",
      weakPassword: "Esa contraseña es fácil de adivinar. Elige otra más larga.",
      samePassword: "La contraseña nueva debe ser distinta de la anterior.",
      rateLimited: "Hiciste muchos intentos seguidos. Espera unos minutos y vuelve a intentarlo.",
      linkInvalid: "El enlace ya se usó o venció. Pide uno nuevo.",
      otherBrowser:
        "Abre el enlace en el mismo navegador donde creaste la cuenta o pediste el cambio. Si no puedes, pide uno nuevo.",
      unexpected: "Algo salió mal de nuestro lado. Vuelve a intentarlo en un momento.",
    },
    signIn: {
      title: "Entrar",
      submit: "Entrar",
      submitting: "Entrando…",
      forgot: "¿Olvidaste tu contraseña?",
      noAccount: "¿No tienes cuenta?",
      createAccount: "Crea una",
      passwordUpdated: "Listo. Ya puedes entrar con tu contraseña nueva.",
    },
    signUp: {
      title: "Crear cuenta",
      intro: "Con tu cuenta guardas el expediente de tus animales. Solo tú lo ves.",
      submit: "Crear cuenta",
      submitting: "Creando cuenta…",
      haveAccount: "¿Ya tienes cuenta?",
      signIn: "Entra",
      sentTitle: "Revisa tu correo",
      sent:
        "Si este correo no tenía cuenta, te enviamos un enlace para confirmarlo. Si ya tenías cuenta, entra o recupera tu contraseña.",
    },
    confirm: {
      title: "Confirma para continuar",
      emailIntro: "Presiona el botón para confirmar tu correo y entrar.",
      recoveryIntro: "Presiona el botón para elegir una contraseña nueva.",
      submit: "Confirmar",
      submitting: "Confirmando…",
      missing: "Este enlace está incompleto. Ábrelo de nuevo desde el correo o pide uno nuevo.",
    },
    reset: {
      title: "Recuperar contraseña",
      intro: "Escribe el correo de tu cuenta y te enviaremos un enlace para elegir una contraseña nueva.",
      submit: "Enviar enlace",
      submitting: "Enviando…",
      sentTitle: "Revisa tu correo",
      sent: "Si hay una cuenta con ese correo, te enviamos un enlace. Vence en una hora.",
      back: "Volver a entrar",
    },
    newPassword: {
      title: "Elige una contraseña nueva",
      submit: "Guardar contraseña",
      submitting: "Guardando…",
    },
  },
  myPets: {
    title: "Mis mascotas",
    signedInAs: "Entraste como",
    comingSoon: "Aquí verás a tus animales y podrás registrar al primero. Es lo siguiente que construimos.",
  },
} as const;

export type Messages = typeof esMX;
