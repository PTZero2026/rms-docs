import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  server: { proxy: { "^/api/tenants/[a-z0-9-]+/catalog/configurations(?:/|\\?|$)": process.env.RMS_CONFIG_ORIGIN ?? "http://127.0.0.1:3110", "/api": process.env.RMS_API_ORIGIN ?? "http://127.0.0.1:3100" } },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
})
