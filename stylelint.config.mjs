/**
 * Regla principal: "un valor, un lugar" (doc. 16 §1).
 * Fuera de los archivos de tokens no se escriben colores, píxeles,
 * capas (z-index) ni duraciones a mano: se usan variables.
 */
/** @type {import('stylelint').Config} */
const config = {
  extends: ["stylelint-config-standard"],
  rules: {
    "color-no-hex": true,
    "color-named": "never",
    "function-disallowed-list": ["rgb", "rgba", "hsl", "hsla", "hwb", "lab", "lch", "oklab", "oklch", "color"],
    "unit-disallowed-list": [["px", "ms", "s"], { ignoreMediaFeatureNames: { px: ["/.*/"] } }],
    "declaration-property-value-allowed-list": {
      "z-index": ["/^var\\(--layer-/", "0", "auto"],
      "font-family": ["/^var\\(--font-/", "inherit"],
      "box-shadow": ["/^var\\(--shadow-/", "none"],
    },
    "declaration-no-important": true,
    "import-notation": "string",
    "selector-class-pattern": [
      "^[a-z][a-zA-Z0-9]*$",
      { message: "Clases en camelCase, como las usan los CSS Modules." },
    ],
    "custom-property-pattern": [
      "^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
      { message: "Variables en kebab-case, por ejemplo --color-text-primary." },
    ],
  },
  overrides: [
    {
      files: ["src/design-system/tokens/**/*.css"],
      rules: {
        "color-no-hex": null,
        "function-disallowed-list": null,
        "unit-disallowed-list": null,
        "declaration-property-value-allowed-list": null,
      },
    },
  ],
};

export default config;
