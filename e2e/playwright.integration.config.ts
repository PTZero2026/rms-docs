import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: ".",
  outputDir: process.env.RMS_PERF ? "test-results/load" : "test-results/integrated",
  // Scenarios update shared settings in the same two test schools.
  workers: 1,
  globalTimeout: process.env.RMS_PERF?32*60*1000:240000,
  testMatch: [...(process.env.RMS_PERF?["perf/**/*.spec.ts"]:[]),"assistant/**/*.spec.ts","extension/**/*.spec.ts","student-project/**/*.spec.ts","applied-project/**/*.spec.ts","product/**/*.spec.ts","profile/**/*.spec.ts","budget/**/*.spec.ts","home/**/*.spec.ts","notification/**/*.spec.ts","integration/**/*.spec.ts","catalog/**/*.spec.ts","audit/**/*.spec.ts","iam/**/*.spec.ts","workflow/**/*.spec.ts","call/**/*.spec.ts","review/**/*.spec.ts","report/**/*.spec.ts"],
  use: {
    baseURL: "http://127.0.0.1:4191",
    channel: process.env.RMS_BROWSER_CHANNEL || undefined,
    locale: "vi-VN",
  },
  webServer: [
    {command:"node e2e/assistant/model-fixture.mjs",cwd:"..",url:"http://127.0.0.1:3193/health"},
    {
      command: "node apps/backend/dist/main.js",
      cwd: "..",
      env: { HOST: "127.0.0.1", PORT: "3191", RMS_AI_LOCAL_ORIGIN:"http://127.0.0.1:3193", RMS_AI_MODEL:"test-passage-selector-v1", RMS_CONFIG_ORIGIN:"http://127.0.0.1:3192" },
      url: "http://127.0.0.1:3191/api/health",
    },
    ...(process.env.RMS_CONFIG_DATABASE_URL ? ["3192", "3194"].map(port => ({
      command: "node apps/sys-config-service/dist/main.js", cwd: "..",
      env: {HOST:"127.0.0.1", PORT:port, RMS_IAM_ORIGIN:"http://127.0.0.1:3191"},
      url:"http://127.0.0.1:" + port + "/health",
    })) : []),
    {
      command: "corepack pnpm --filter @rms/web exec vite preview --host 127.0.0.1 --port 4191 --strictPort",
      cwd: "..",
      env: { RMS_API_ORIGIN: "http://127.0.0.1:3191", RMS_CONFIG_ORIGIN:"http://127.0.0.1:3192" },
      url: "http://127.0.0.1:4191",
    },
  ],
})
