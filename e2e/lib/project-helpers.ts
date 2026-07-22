import { expect, type Page } from '@playwright/test';

/** Điền editor Tiptap của form đề cương (label → div.tiptap kế tiếp). */
export async function fillEditor(page: Page, label: string, value: string): Promise<void> {
  const ed = page
    .locator(`xpath=//label[contains(normalize-space(.),"${label}")]/following::div[contains(@class,"tiptap")][1]`)
    .first();
  await ed.click();
  await ed.fill(value).catch(async () => {
    await ed.pressSequentially(value, { delay: 3 });
  });
}

/**
 * Tạo đề tài cấp cơ sở qua wizard (chọn loại → bỏ qua đợt → form). Robust cho cả 2 tenant
 * (deep-link ?type=BASIC không luôn hydrate form). Trả về đường dẫn chi tiết.
 */
export async function createBasicProject(page: Page, name: string): Promise<string> {
  await page.goto('/projects/create', { waitUntil: 'networkidle' });
  await page.getByText('Đề tài cấp cơ sở', { exact: false }).first().click();
  await page.waitForTimeout(1500);
  const skip = page.getByText('Không chọn đợt', { exact: false }).first();
  if (await skip.count()) await skip.click();
  await page.locator('#input-title').waitFor({ state: 'visible', timeout: 20_000 });
  await page.locator('#input-title').fill(name);
  await fillEditor(page, 'Đặt vấn đề', 'E2E gate test — đặt vấn đề');
  await fillEditor(page, 'Mục tiêu', 'E2E gate test — mục tiêu');
  await fillEditor(page, 'Đối tượng & Phương pháp', 'E2E gate test — phương pháp');
  await fillEditor(page, 'Đạo đức nghiên cứu', 'E2E gate test — đạo đức');
  await page.getByRole('button', { name: 'Đăng ký đề tài', exact: true }).click();
  await page.waitForURL(/\/projects\/[0-9a-fA-F-]{36}/, { timeout: 30_000 });
  await expect(page.getByText(/Nháp/).first()).toBeVisible();
  return new URL(page.url()).pathname;
}

/**
 * Xoá đề tài (nút trang "Xoá" o+á → xác nhận modal "Xóa" ó+a). Có retry, tự dọn, không ném lỗi.
 * Chờ nút Xoá render (nút hành động load trễ). Đề tài đã hủy sẽ KHÔNG có nút Xoá → thoát.
 */
export async function deleteProject(page: Page, detailPath: string): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto(detailPath, { waitUntil: 'networkidle' }).catch(() => {});
    const trigger = page.getByRole('button', { name: 'Xoá', exact: true }).first();
    try {
      await trigger.waitFor({ state: 'visible', timeout: 8000 });
    } catch {
      return;
    }
    await trigger.click();
    await page.locator('.modal').getByRole('button', { name: 'Xóa', exact: true }).click();
    await page.waitForURL(/\/projects$/, { timeout: 10_000 }).catch(() => {});
    await page.waitForTimeout(1200);
  }
}
