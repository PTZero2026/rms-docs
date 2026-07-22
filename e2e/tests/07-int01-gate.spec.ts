import { test, expect } from '../lib/fixtures';
import { createBasicProject, deleteProject } from '../lib/project-helpers';

/**
 * INT-01 — Cổng nghiệm thu: gate vòng đời qua workflow engine (P01).
 * Đề tài mới (DRAFT) KHÔNG được nhảy thẳng sang nghiệm thu/hoàn thành — chỉ đi bước kế tiếp
 * (gửi duyệt). Đây là cơ chế thứ tự vòng đời làm nền cho chuỗi F04→F07→F06→F05.
 *
 * GHI DỮ LIỆU trên **BKA (tenant test)** — KHÔNG đụng pilot Thủy Lợi. Tạo đề tài nhãn E2E-TEST-
 * rồi tự xoá ở finally. Chạy mặc định (không cần cờ) vì BKA là môi trường test.
 */
test.describe('INT-01 · Cổng nghiệm thu — gate workflow (BKA, tạo → kiểm → tự dọn)', () => {
  test('Đề tài DRAFT không nhảy thẳng nghiệm thu/hoàn thành', async ({ bkaAuthorPage }) => {
    const page = bkaAuthorPage;
    const name = `E2E-TEST-INT01-${Date.now()}`;
    let detailPath = '';
    try {
      // 1. Tạo đề tài cấp cơ sở
      detailPath = await createBasicProject(page, name);

      // 2. GATE: mở "Chuyển trạng thái"
      await page.getByRole('button', { name: /Chuyển trạng thái/i }).click();
      await page.waitForTimeout(1500);
      // Gate: KHÔNG có transition nhảy cóc sang nghiệm thu / hoàn thành
      await expect(page.getByRole('button', { name: /Gửi nghiệm thu/i })).toHaveCount(0);
      await expect(page.getByRole('button', { name: /Hoàn thành/i })).toHaveCount(0);
      // Có ít nhất một bước tiến hợp lệ (gửi duyệt / nộp)
      await expect(page.getByRole('button', { name: /Gửi duyệt|Nộp|Gửi/i }).first()).toBeVisible();
      // Đóng bằng Escape — KHÔNG bấm "Hủy" (đó là transition Hủy đề tài → CANCELLED).
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } finally {
      // 3. Tự dọn dữ liệu test trên BKA
      if (detailPath) await deleteProject(page, detailPath);
    }
  });
});
