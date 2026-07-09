import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/**
 * E2E pilot ĐH Thủy Lợi (tenant RMS đầu tiên, bật E4).
 * - project `setup`: đăng nhập 2 role, lưu storageState vào .auth/.
 * - project `e2e`  : chạy mọi spec, phụ thuộc `setup` (dùng lại phiên đăng nhập).
 * Login flow (01-auth) tự đăng nhập trong test nên chạy ở cả 2, không cần storageState.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 1, // site live — hấp thụ blip mạng
  reporter: [['list'], ['html', { open: 'never' }], ['./reporters/telegram-reporter.ts']],
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: process.env.RMS_BASE_URL || 'https://tl-nckh.vnest.vn',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // RMS_VIDEO=1 -> ghi video mọi test (dùng khi cần bằng chứng bàn giao)
    video: process.env.RMS_VIDEO ? { mode: 'on', size: { width: 1280, height: 720 } } : 'retain-on-failure',
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'e2e',
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
