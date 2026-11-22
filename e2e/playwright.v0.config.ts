import { defineConfig } from "@playwright/test"

const baseURL = "http://127.0.0.1:4187"

export default defineConfig({
  testDir: "./v0",
  workers: 2,
  timeout: 60_000,
  use: {
    baseURL,
    locale: "vi-VN",
    channel: process.env.RMS_BROWSER_CHANNEL || undefined,
  },
  webServer: {
    command:
      "corepack pnpm --filter @rms/web exec vite preview --host 127.0.0.1 --port 4187 --strictPort",
    cwd: "..",
    url: baseURL,
    reuseExistingServer: true,
  },
})
