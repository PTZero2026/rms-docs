import { test, expect } from '../lib/fixtures';

/**
 * E4 — hoạt động khoa học mở rộng, THEO GIAO DIỆN THẬT của Thủy Lợi (khảo sát 2026-07-11):
 *  - F09/F10/F11 (đề tài cấp trên · sinh viên · dự án phục vụ sản xuất) = **loại đề tài** trong
 *    luồng tạo `/projects/create` — KHÔNG có menu/route riêng (/projects/upper… đều 404).
 *  - F12 (hoạt động khoa học) = trang `/science-activities` ("Hoạt động của tôi") và
 *    `/science-activities/approval` ("Hàng đợi phê duyệt").
 */
test.describe('E4 · Hoạt động khoa học mở rộng', () => {
  test('F09/F10/F11: loại đề tài mở rộng có trong luồng tạo (/projects/create)', async ({ lecturerPage }) => {
    await lecturerPage.goto('/projects/create', { waitUntil: 'domcontentloaded' });
    await lecturerPage.waitForLoadState('networkidle').catch(() => {});
    for (const t of ['Đề tài cấp trên', 'Đề tài sinh viên', 'Dự án phục vụ sản xuất']) {
      await expect(lecturerPage.getByText(t, { exact: false }).first(), `thiếu loại "${t}"`).toBeVisible({
        timeout: 30_000,
      });
    }
  });

  test('F12: menu "Hoạt động của tôi" + "Hàng đợi phê duyệt" hiển thị (admin)', async ({ adminPage }) => {
    await adminPage.goto('/');
    await expect(adminPage.getByRole('link', { name: /Hoạt động của tôi/i })).toBeVisible();
    await expect(adminPage.getByRole('link', { name: /Hàng đợi phê duyệt/i })).toBeVisible();
  });

  test('F12: giảng viên mở trang Hoạt động khoa học (/science-activities)', async ({ lecturerPage }) => {
    await lecturerPage.goto('/science-activities', { waitUntil: 'networkidle' });
    await expect(lecturerPage).toHaveTitle(/Hoạt động khoa học/i);
    await expect(lecturerPage.getByRole('heading', { name: /Hoạt động khoa học/i }).first()).toBeVisible();
  });

  test('F12: admin mở Hàng đợi phê duyệt (/science-activities/approval) có bảng', async ({ adminPage }) => {
    await adminPage.goto('/science-activities/approval', { waitUntil: 'networkidle' });
    await expect(adminPage).toHaveTitle(/Hàng đợi phê duyệt/i);
    await expect(adminPage.locator('table')).toBeVisible();
  });
});
