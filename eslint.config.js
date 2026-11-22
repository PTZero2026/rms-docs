import js from "@eslint/js"
import hooks from "eslint-plugin-react-hooks"
import globals from "globals"
import tseslint from "typescript-eslint"
import { defineConfig, globalIgnores } from "eslint/config"

export default defineConfig([
  globalIgnores(["**/dist/**"]),
  {
    files: ["apps/web/**/*.{ts,tsx}", "packages/ui/**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended, hooks.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
  },
])
