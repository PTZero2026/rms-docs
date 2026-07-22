import { test, expect } from '../lib/fixtures';
import { DENIED_TEXT } from '../lib/accounts';

/**
 * Kiểm thử TÍCH HỢP — luồng phức tạp / đa vai trò.
 * Nguồn: docs/features/integration-test-plan.md
 *
 * 🟢 chạy thật: các TC read-only, không phá dữ liệu pilot.
 * 🟡 test.fixme: chờ feature dựng xong / cần tạo dữ liệu có kiểm soát (env test riêng).
 *    Bước đã ghi trong thân test dưới dạng comment để hiện thực khi sẵn sàng.
 */

// ============================================================
// INT-12 — RLS + phạm vi dữ liệu + deep-link guard  🟢 (một phần)
// ============================================================
test.describe('INT-12 · Phạm vi dữ liệu & guard phân quyền', () => {
  test('INT-12a: giảng viên chỉ thấy đề tài trong phạm vi của mình (< admin)', async ({ adminPage, lecturerPage }) => {
    await adminPage.goto('/projects', { waitUntil: 'domcontentloaded' });
    await expect(adminPage.locator('table tbody tr').first()).toBeVisible({ timeout: 30_000 });
    const adminCount = await adminPage.locator('table tbody tr').count();

    await lecturerPage.goto('/projects', { waitUntil: 'domcontentloaded' });
    await expect(lecturerPage.getByRole('heading', { name: /Quản lý Đề tài/i })).toBeVisible({ timeout: 30_000 });
    await lecturerPage.waitForLoadState('networkidle').catch(() => {});
    const lecturerCount = await lecturerPage.locator('table tbody tr').count();

    expect(adminCount, 'admin phải thấy dữ liệu toàn hệ thống').toBeGreaterThan(0);
    expect(lecturerCount, 'giảng viên bị giới hạn phạm vi, ít hơn admin').toBeLessThan(adminCount);
  });

  test('INT-12b: giảng viên deep-link route quản trị → backend từ chối', async ({ lecturerPage }) => {
    for (const route of ['/users', '/councils', '/users/author-requests']) {
      await lecturerPage.goto(route);
      await expect(
        lecturerPage.getByText(DENIED_TEXT, { exact: false }),
        `route ${route} phải bị chặn ở backend`,
      ).toBeVisible();
    }
  });

  // 🟡 Gap phát hiện 2026-07-10: /meetings/create render form cho giảng viên thay vì chặn.
  // Kỳ vọng an toàn (nhất quán các trang quản trị khác) — bật lại sau khi backend guard route,
  // đồng thời cần xác minh POST tạo cuộc họp bị chặn với tài khoản giảng viên.
  test.fixme('INT-12c: giảng viên deep-link /meetings/create phải bị chặn', async ({ lecturerPage }) => {
    await lecturerPage.goto('/meetings/create');
    await expect(lecturerPage.getByText(DENIED_TEXT, { exact: false })).toBeVisible();
  });

  test('INT-12d: IDOR — giảng viên mở chi tiết đề tài không thuộc mình → bị chặn', async ({
    adminPage,
    lecturerPage,
  }) => {
    // Lấy UUID đề tài thật từ danh sách của admin (không hardcode)
    await adminPage.goto('/projects', { waitUntil: 'domcontentloaded' });
    await adminPage.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 30_000 });
    await adminPage.locator('table tbody tr').first().locator('td').first().click();
    await adminPage.waitForURL(/\/projects\/[0-9a-fA-F-]{36}/, { timeout: 20_000 });
    const detailPath = new URL(adminPage.url()).pathname;
    expect(detailPath).toMatch(/\/projects\/[0-9a-fA-F-]{36}/);

    // Giảng viên deep-link đúng đề tài đó → phải bị chặn ở tầng DỮ LIỆU (không chỉ route).
    // Giảng viên không sở hữu đề tài của admin ⇒ backend chặn: "Không có quyền xem đề tài này"
    // + trang "không tìm thấy" (không render nội dung đề tài).
    await lecturerPage.goto(detailPath, { waitUntil: 'networkidle' });
    await lecturerPage.waitForTimeout(1000);
    await expect(
      lecturerPage.getByText(/Không có quyền xem đề tài|không tìm thấy trang/i).first(),
    ).toBeVisible({ timeout: 20_000 });
  });

  // ⚪ MANUAL: cách ly 2 tenant (RLS app.current_tenant) — cần tài khoản tenant thứ hai.
});

// ============================================================
// INT-14 — E4 bật đúng ở luồng tạo đề tài (VP-FEAT)  🟢
// ============================================================
test.describe('INT-14 · Loại đề tài mở rộng E4 khả dụng', () => {
  test('Luồng tạo đề tài cung cấp đủ loại lõi + E4 (F09/F10/F11)', async ({ lecturerPage }) => {
    await lecturerPage.goto('/projects/create', { waitUntil: 'domcontentloaded' });
    await lecturerPage.waitForLoadState('networkidle').catch(() => {});
    for (const type of ['Đề tài cấp cơ sở', 'Đề tài cấp trên', 'Đề tài sinh viên', 'Dự án phục vụ sản xuất']) {
      await expect(lecturerPage.getByText(type, { exact: false }).first(), `loại "${type}" phải hiển thị`).toBeVisible({
        timeout: 30_000,
      });
    }
  });
});

// ============================================================
// INT-15 — Dấu vết audit trên đề tài (P02 dùng chung)  🟢
// ============================================================
test.describe('INT-15 · Lịch sử / audit trail đề tài', () => {
  test('Chi tiết đề tài có tab Lịch sử và mở được (chứng cứ P02)', async ({ adminPage }) => {
    await adminPage.goto('/projects');
    await adminPage.locator('table tbody tr').first().waitFor({ state: 'visible' });
    await adminPage.locator('table tbody tr').first().locator('td').first().click();
    await adminPage.waitForURL(/\/projects\/[0-9a-fA-F-]{36}/, { timeout: 20_000 });
    const historyTab = adminPage.getByRole('tab', { name: /Lịch sử/i }).or(adminPage.getByText(/^Lịch sử$/));
    await expect(historyTab.first()).toBeVisible();
    await historyTab.first().click();
    // Panel không lỗi: vẫn ở trang chi tiết, tiêu đề còn hiển thị
    await expect(adminPage.getByRole('heading', { name: /Chi tiết đề tài/i })).toBeVisible();
  });
});

// Nhóm B (INT-01 gate, INT-02..INT-10, INT-13): xem `07-int01-gate.spec.ts` (INT-01 chạy thật
// trên BKA) và `10-groupB-surface-bka.spec.ts` (bề mặt cấu hình read-only + fixme hành vi stateful).
// ⚪ INT-11 (nguyên tử workflow + audit cùng transaction): kiểm tầng DB/service, KHÔNG qua UI.

// ============================================================
// INT-16 — F04 (tiến độ & giao/khoán) ĐÃ BẬT  🟢 (read-only)
// Xác minh F04 lộ trên UI + bề mặt workflow engine P01 gate nghiệm thu.
// Không commit chuyển trạng thái (tránh đổi dữ liệu pilot).
// ============================================================
test.describe('INT-16 · F04 tiến độ & giao/khoán', () => {
  const openInProgress = async (page: import('@playwright/test').Page) => {
    await page.goto('/projects', { waitUntil: 'domcontentloaded' });
    const row = page.locator('table tbody tr', { hasText: /Đang triển khai/i }).first();
    await row.waitFor({ state: 'visible', timeout: 30_000 });
    await row.locator('td').first().click();
    await page.waitForURL(/\/projects\/[0-9a-fA-F-]{36}/, { timeout: 20_000 });
    await expect(page.getByRole('heading', { name: /Chi tiết đề tài/i })).toBeVisible();
  };

  test('INT-16a: đề tài đang thực hiện có tab Giao/Khoán + Tiến độ với đúng khu vực', async ({ adminPage }) => {
    await openInProgress(adminPage);
    await adminPage.getByRole('tab', { name: 'Giao/Khoán' }).click();
    await expect(adminPage.getByRole('heading', { name: /Hồ sơ Giao\/Khoán/i })).toBeVisible();
    await adminPage.getByRole('tab', { name: 'Tiến độ' }).click();
    await expect(adminPage.getByRole('heading', { name: /Báo cáo tiến độ/i })).toBeVisible();
    await expect(adminPage.getByRole('button', { name: /Tạo các kỳ/i })).toBeVisible();
  });

  test('INT-16b: workflow engine (P01) mở chuyển trạng thái "Gửi nghiệm thu" — KHÔNG commit', async ({ adminPage }) => {
    await openInProgress(adminPage);
    await adminPage.getByRole('button', { name: /Chuyển trạng thái/i }).click();
    // đề tài IN_PROGRESS: transition hợp lệ tiếp theo là gửi nghiệm thu (F04 BR-10 → F06)
    await expect(adminPage.getByRole('button', { name: /Gửi nghiệm thu/i })).toBeVisible();
    // đóng dialog, tuyệt đối không xác nhận để giữ nguyên dữ liệu pilot
    await adminPage.keyboard.press('Escape');
  });
});
