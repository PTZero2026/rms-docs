import { test as base, type Page, type BrowserContext } from '@playwright/test';
import path from 'node:path';
import { ACCOUNTS } from './accounts';

const REC_ALL = !!process.env.RMS_VIDEO;
const VIDEO_DIR = 'videos';
const RAW_DIR = 'video-tmp';
const sanitize = (s: string) => s.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 70);

/**
 * Fixtures cấp page đã đăng nhập cho từng role (storageState từ auth.setup.ts).
 * Luôn ghi video vào thư mục tạm. Khi test FAIL (hoặc RMS_VIDEO=1) -> lưu ra
 * videos/<role>-<tên-test>.webm; nếu fail còn attach vào testInfo để reporter
 * Telegram lấy đường dẫn gửi kèm. Lượt pass (không cờ) thì xoá raw.
 */
async function makeRolePage(
  browser: import('@playwright/test').Browser,
  baseURL: string | undefined,
  storageState: string,
  role: string,
  testInfo: import('@playwright/test').TestInfo,
  use: (p: Page) => Promise<void>,
) {
  const ctx: BrowserContext = await browser.newContext({
    baseURL,
    storageState,
    recordVideo: { dir: RAW_DIR, size: { width: 1280, height: 720 } },
  });
  const page = await ctx.newPage();
  const video = page.video();
  await use(page);
  await ctx.close();
  if (!video) return;
  const failed = testInfo.status !== testInfo.expectedStatus;
  if (REC_ALL || failed) {
    const dest = path.join(VIDEO_DIR, `${role}-${sanitize(testInfo.title)}.webm`);
    await video.saveAs(dest).catch(() => {});
    if (failed) await testInfo.attach('video', { path: dest, contentType: 'video/webm' }).catch(() => {});
  }
  await video.delete().catch(() => {}); // dọn raw trong video-tmp
}

export const test = base.extend<{ adminPage: Page; lecturerPage: Page }>({
  adminPage: async ({ browser, baseURL }, use, testInfo) => {
    await makeRolePage(browser, baseURL, ACCOUNTS.admin.storageState, 'admin', testInfo, use);
  },
  lecturerPage: async ({ browser, baseURL }, use, testInfo) => {
    await makeRolePage(browser, baseURL, ACCOUNTS.giangvien.storageState, 'giangvien', testInfo, use);
  },
});

export const expect = test.expect;
