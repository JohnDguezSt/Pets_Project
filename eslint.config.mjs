import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Límites entre capas (doc. 16 §3 y §9). Cada capa solo usa capas inferiores:
 * - design-system: no conoce el producto.
 * - domain: reglas puras, sin interfaz ni proveedores.
 * Si una importación rompe estas reglas, la CI falla.
 */
const productLayers = ["@/app/**", "@/features/**", "@/domain/**", "@/services/**", "@/server/**"];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/design-system/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: productLayers,
              message: "El sistema de diseño no puede importar lógica ni datos del producto.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "react", message: "El dominio no depende de la interfaz." },
            { name: "react-dom", message: "El dominio no depende de la interfaz." },
          ],
          patterns: [
            {
              group: ["next", "next/**", "@/design-system/**", ...productLayers.filter((p) => p !== "@/domain/**"), "*.css"],
              message: "El dominio contiene reglas puras: sin interfaz, framework ni proveedores.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
