import { test, expect } from '../lib/fixtures';

/**
 * Nhóm B (tích hợp) — kiểm ở mức "BỀ MẶT CẤU HÌNH" trên tenant BKA, READ-ONLY (mở form → kiểm → đóng,
 * KHÔNG ghi dữ liệu ⇒ không rác). Xác nhận hệ thống CÓ cấu hình thực thi các luật tích hợp;
 * còn HÀNH VI stateful đầy đủ (freeze sau submit, xung đột-dưới-ngưỡng, kết luận AND, idempotent, redo)
 * giữ ở test.fixme (cần seed + nhiều bước, chạy trên BKA khi có dữ liệu).
 */
test.describe('Nhóm B · bề mặt cấu hình (BKA, read-only)', () => {
  test('INT-05s: hỗ trợ Hội đồng khoa học + Hội đồng đạo đức (song song — ADR-0003)', async ({ bkaAdminPage }) => {
    await bkaAdminPage.goto('/councils', { waitUntil: 'networkidle' });
    await bkaAdminPage.getByRole('button', { name: /Tạo hội đồng/i }).click();
    await bkaAdminPage.waitForTimeout(1200);
    const opts = (await bkaAdminPage.locator('select option').allTextContents()).join(' | ');
    expect(opts, 'phải có loại hội đồng khoa học').toMatch(/Hội đồng khoa học/i);
    expect(opts, 'phải có loại hội đồng đạo đức (cho luồng song song)').toMatch(/Hội đồng đạo đức/i);
    await bkaAdminPage.keyboard.press('Escape');
  });

  test('INT-07s: đợt đăng ký có đủ trường cấu hình (sẽ bị đóng băng sau khi có đề tài nộp)', async ({
    bkaAdminPage,
  }) => {
    await bkaAdminPage.goto('/projects/rounds', { waitUntil: 'networkidle' });
    await bkaAdminPage.getByRole('button', { name: /Tạo mới/i }).click();
    await bkaAdminPage.waitForTimeout(1200);
    for (const label of ['Mã đợt', 'Loại đề tài', 'Mở đăng ký', 'Đóng đăng ký', 'Thành viên tối thiểu', 'Thành viên tối đa']) {
      await expect(bkaAdminPage.getByText(label, { exact: false }).first(), `thiếu trường "${label}"`).toBeVisible();
    }
    await bkaAdminPage.keyboard.press('Escape');
  });

  // 🟡 HÀNH VI đầy đủ — cần seed dữ liệu + nhiều bước trên BKA (đề tài SUBMITTED/APPROVED không xoá được).
  test.fixme('INT-07: đợt đóng băng cấu hình sau khi có đề tài SUBMITTED (chặn sửa, chỉ gia hạn)', async () => {});
  test.fixme('INT-03: xung đột lợi ích ⇒ tụt dưới ngưỡng phiếu tối thiểu (cần HĐ + thành viên + đề tài)', async () => {});
  test.fixme('INT-04: F03/F06 hai type không lẫn phiếu/tiêu chí (cần 2 vòng chấm)', async () => {});
  test.fixme('INT-05: APPROVED chỉ khi CẢ HAI hội đồng (KH + đạo đức) kết luận đạt', async () => {});
  test.fixme('INT-02: trần khoán approvedBudget + phí quản lý (cần đề tài IN_PROGRESS)', async () => {});
  test.fixme('INT-06: on-behalf — audit actor vs onBehalfOf (cần vai trò thư ký)', async () => {});
  test.fixme('INT-08: mã đề tài bất biến qua trả-bổ-sung/nộp lại (cần submit + staff trả lại)', async () => {});
  test.fixme('INT-09: giờ giảng idempotent + thu hồi (F09/F11 duyệt → P03 → F08)', async () => {});
  test.fixme('INT-10: phân bổ giờ đa vai trò tổng = 100% (F09/F11 nhiều người)', async () => {});
  test.fixme('INT-13: làm lại nghiệm thu ≤ MAX_REDO_COUNT (cần nghiệm thu FAILED)', async () => {});
});
