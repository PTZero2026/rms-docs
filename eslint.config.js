import js from "@eslint/js"
import hooks from "eslint-plugin-react-hooks"
import globals from "globals"
import tseslint from "typescript-eslint"
import { defineConfig, globalIgnores } from "eslint/config"

export default defineConfig([
  globalIgnores(["**/dist/**"]),
  {
    files: ["apps/backend/src/**/*.ts", "apps/sys-config-service/src/**/*.ts", "packages/api-contracts/src/**/*.ts"],
    ignores: ["**/*.d.ts"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["apps/web/**/*.{ts,tsx}", "packages/ui/**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended, hooks.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
  },
])
