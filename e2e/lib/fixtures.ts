import { test as base, type Page, type BrowserContext } from '@playwright/test';
import path from 'node:path';
import { ACCOUNTS } from './accounts';

const REC = !!process.env.RMS_VIDEO;
const VIDEO_DIR = 'videos';
const sanitize = (s: string) => s.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 70);

/**
 * Fixtures cấp page đã đăng nhập cho từng role (storageState từ auth.setup.ts).
 * Khi RMS_VIDEO=1: ghi video mỗi context và lưu ra videos/<role>-<tên-test>.webm.
 */
async function makeRolePage(
  browser: import('@playwright/test').Browser,
  baseURL: string | undefined,
  storageState: string,
  role: string,
  title: string,
  use: (p: Page) => Promise<void>,
) {
  const ctx: BrowserContext = await browser.newContext({
    baseURL,
    storageState,
    ...(REC ? { recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 720 } } } : {}),
  });
  const page = await ctx.newPage();
  const video = REC ? page.video() : null;
  await use(page);
  await ctx.close();
  if (video) await video.saveAs(path.join(VIDEO_DIR, `${role}-${sanitize(title)}.webm`)).catch(() => {});
}

export const test = base.extend<{ adminPage: Page; lecturerPage: Page }>({
  adminPage: async ({ browser, baseURL }, use, testInfo) => {
    await makeRolePage(browser, baseURL, ACCOUNTS.admin.storageState, 'admin', testInfo.title, use);
  },
  lecturerPage: async ({ browser, baseURL }, use, testInfo) => {
    await makeRolePage(browser, baseURL, ACCOUNTS.giangvien.storageState, 'giangvien', testInfo.title, use);
  },
});

export const expect = test.expect;
