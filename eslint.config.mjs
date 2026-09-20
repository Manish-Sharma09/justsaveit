import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts", ".agents/**"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // The app streams files from its own API where dimensions are unknown at
      // build time, so next/image cannot be used for those.
      "@next/next/no-img-element": "warn",
    },
  },
];

export default config;
