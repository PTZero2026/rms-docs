import { defineConfig } from "@playwright/test"
export default defineConfig({
  testDir: "./keycloak",
  workers: 1,
  use: { channel: process.env.RMS_BROWSER_CHANNEL || undefined, locale: "en-US" },
})
