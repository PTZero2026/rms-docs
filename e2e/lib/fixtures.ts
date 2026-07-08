import { test as base, type Page } from '@playwright/test';
import { ACCOUNTS } from './accounts';

/**
 * Fixtures cấp sẵn page đã đăng nhập cho từng role (lấy từ storageState do
 * auth.setup.ts sinh ra). Cho phép một test so sánh 2 role cạnh nhau (RBAC).
 */
export const test = base.extend<{ adminPage: Page; lecturerPage: Page }>({
  adminPage: async ({ browser, baseURL }, use) => {
    const ctx = await browser.newContext({ baseURL, storageState: ACCOUNTS.admin.storageState });
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },
  lecturerPage: async ({ browser, baseURL }, use) => {
    const ctx = await browser.newContext({ baseURL, storageState: ACCOUNTS.giangvien.storageState });
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },
});

export const expect = test.expect;
