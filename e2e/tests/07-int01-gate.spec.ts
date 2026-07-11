import { test, expect } from '../lib/fixtures';
import type { Page } from '@playwright/test';

/**
 * INT-01 — Cổng nghiệm thu: gate vòng đời qua workflow engine (P01).
 * Kiểm rằng đề tài mới (DRAFT) KHÔNG thể nhảy thẳng sang nghiệm thu/hoàn thành —
 * chỉ được "Gửi duyệt". Đây là cơ chế thứ tự vòng đời làm nền cho toàn bộ chuỗi
 * F04→F07→F06→F05 (không có bước nào bị bỏ qua).
 *
 * GHI DỮ LIỆU: test tạo 1 đề tài nháp gắn nhãn E2E-TEST- rồi **tự xoá** ở finally.
 * Chỉ chạy khi RMS_MUTATE=1 để tránh ghi dữ liệu ngoài ý muốn vào pilot dùng chung.
 *   RMS_MUTATE=1 npx playwright test 07-int01-gate
 */
const RUN = !!process.env.RMS_MUTATE;

async function fillEditor(page: Page, label: string, value: string): Promise<void> {
  const ed = page
    .locator(`xpath=//label[contains(normalize-space(.),"${label}")]/following::div[contains(@class,"tiptap")][1]`)
    .first();
  await ed.click();
  await ed.fill(value).catch(async () => {
    await ed.pressSequentially(value, { delay: 3 });
  });
}

/**
 * Xoá đề tài (nút trang "Xoá" o+á → xác nhận modal "Xóa" ó+a). Tự dọn, có retry +
 * xác minh: xoá thành công thì app điều hướng về danh sách / nút Xoá biến mất.
 */
async function deleteProject(page: Page, detailPath: string): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto(detailPath, { waitUntil: 'networkidle' }).catch(() => {});
    const trigger = page.getByRole('button', { name: 'Xoá', exact: true }).first();
    try {
      await trigger.waitFor({ state: 'visible', timeout: 8000 });
    } catch {
      return; // không còn nút Xoá => đã xoá / không ở trạng thái xoá được
    }
    await trigger.click();
    await page.locator('.modal').getByRole('button', { name: 'Xóa', exact: true }).click();
    await page.waitForURL(/\/projects$/, { timeout: 10_000 }).catch(() => {});
    await page.waitForTimeout(1200);
  }
}

test.describe('INT-01 · Cổng nghiệm thu — gate workflow (tạo → kiểm → tự dọn)', () => {
  test.skip(!RUN, 'Ghi dữ liệu pilot — chỉ chạy khi RMS_MUTATE=1');

  test('Đề tài DRAFT chỉ được "Gửi duyệt", KHÔNG nhảy thẳng nghiệm thu/hoàn thành', async ({ lecturerPage }) => {
    const page = lecturerPage;
    const name = `E2E-TEST-INT01-${Date.now()}`;
    let detailPath = '';
    try {
      // --- 1. Tạo đề tài cấp cơ sở (bỏ qua đợt) ---
      await page.goto('/projects/create?type=BASIC&roundId=none', { waitUntil: 'networkidle' });
      await page.locator('#input-title').fill(name);
      await fillEditor(page, 'Đặt vấn đề', 'E2E gate test — đặt vấn đề');
      await fillEditor(page, 'Mục tiêu', 'E2E gate test — mục tiêu');
      await fillEditor(page, 'Đối tượng & Phương pháp', 'E2E gate test — phương pháp');
      await fillEditor(page, 'Đạo đức nghiên cứu', 'E2E gate test — đạo đức');
      await page.getByRole('button', { name: 'Đăng ký đề tài', exact: true }).click();

      await page.waitForURL(/\/projects\/[0-9a-fA-F-]{36}/, { timeout: 30_000 });
      detailPath = new URL(page.url()).pathname;
      await expect(page.getByText(/Nháp/).first()).toBeVisible();

      // --- 2. GATE: mở "Chuyển trạng thái" ---
      await page.getByRole('button', { name: /Chuyển trạng thái/i }).click();
      await page.waitForTimeout(1200);
      // Hợp lệ: chỉ được gửi duyệt (bước kế tiếp trong vòng đời)
      await expect(page.getByRole('button', { name: /Gửi duyệt/i })).toBeVisible();
      // Gate: KHÔNG có transition nhảy cóc sang nghiệm thu / hoàn thành
      await expect(page.getByRole('button', { name: /Gửi nghiệm thu/i })).toHaveCount(0);
      await expect(page.getByRole('button', { name: /Hoàn thành/i })).toHaveCount(0);
      // ĐÓNG panel bằng Escape — KHÔNG bấm "Hủy" (đó là transition Hủy đề tài → CANCELLED).
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } finally {
      // --- 3. Tự dọn dữ liệu test ---
      if (detailPath) await deleteProject(page, detailPath);
    }
  });
});
