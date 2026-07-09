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

  test('INT-12d: IDOR — giảng viên mở chi tiết đề tài không thuộc mình → "Bị từ chối"', async ({
    adminPage,
    lecturerPage,
  }) => {
    // Lấy UUID đề tài thật từ danh sách của admin (không hardcode)
    await adminPage.goto('/projects');
    await adminPage.locator('table tbody tr').first().waitFor({ state: 'visible' });
    await adminPage.locator('table tbody tr').first().locator('td').first().click();
    await adminPage.waitForURL(/\/projects\/[0-9a-fA-F-]{36}/, { timeout: 20_000 });
    const detailPath = new URL(adminPage.url()).pathname;
    expect(detailPath).toMatch(/\/projects\/[0-9a-fA-F-]{36}/);

    // Giảng viên deep-link đúng đề tài đó → phải bị chặn ở tầng DỮ LIỆU (không chỉ route)
    await lecturerPage.goto(detailPath);
    await expect(lecturerPage.getByText(/Bị từ chối/i).first()).toBeVisible();
  });

  // ⚪ MANUAL: cách ly 2 tenant (RLS app.current_tenant) — cần tài khoản tenant thứ hai.
});

// ============================================================
// INT-14 — E4 bật đúng ở luồng tạo đề tài (VP-FEAT)  🟢
// ============================================================
test.describe('INT-14 · Loại đề tài mở rộng E4 khả dụng', () => {
  test('Luồng tạo đề tài cung cấp đủ loại lõi + E4 (F09/F10/F11)', async ({ lecturerPage }) => {
    await lecturerPage.goto('/projects/create');
    await expect(lecturerPage.getByText('Chọn loại đề tài', { exact: false }).first()).toBeVisible();
    for (const type of ['Đề tài cấp cơ sở', 'Đề tài cấp trên', 'Đề tài sinh viên', 'Dự án phục vụ sản xuất']) {
      await expect(lecturerPage.getByText(type, { exact: false }).first()).toBeVisible();
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

// ============================================================
// A. Chuỗi gate đa nghiệp vụ  🟡 (chờ F04–F07 dựng + dữ liệu)
// ============================================================
test.describe('Chuỗi gate đa nghiệp vụ', () => {
  test.fixme('INT-01: cổng nghiệm thu (kỳ cuối + sản phẩm cam kết + quyết toán)', async () => {
    // 1. Kỳ cuối F04 PASSED nhưng sản phẩm cam kết F07 chưa đủ APPROVED
    //    -> thử chuyển PENDING_ACCEPTANCE: BỊ CHẶN (F06 BR-01 / F04 BR-10)
    // 2. Duyệt đủ sản phẩm cam kết (đúng loại + số lượng) -> cho vào nghiệm thu
    // 3. Hội đồng ACCEPTANCE PASSED; F05 còn MISMATCHED -> thử COMPLETED: CHẶN (F06 BR-09)
    // 4. Quyết toán hết MISMATCHED -> PASSED->COMPLETED
  });

  test.fixme('INT-02: trần khoán approvedBudget F04→F05 + phí quản lý không hồi tố', async () => {
    // 1. Giao đề tài kèm approvedBudget; F05 xác nhận cấp một lần, tổng <= approvedBudget (BR-08)
    // 2. Phí quản lý = min(floor(cấp*rate), cap) tách khỏi kinh phí thực hiện (BR-10)
    // 3. Ghi chi vượt kinh phí thực hiện -> chỉ CẢNH BÁO, vẫn ghi (BR-03)
    // 4. Sửa rate -> đề tài đã tính KHÔNG hồi tố (BR-10)
  });
});

// ============================================================
// B. Hội đồng dùng chung + phân quyền  🟡
// ============================================================
test.describe('Hội đồng & phân quyền', () => {
  test.fixme('INT-03: xung đột lợi ích ⇒ tụt dưới ngưỡng phiếu tối thiểu', async () => {
    // 1. Thành viên HĐ đồng thời là thành viên/chủ nhiệm -> ẩn hàng chờ + chặn tạo phiếu (BR-03)
    // 2. Sau loại, còn < MIN_SUBMITTED_SCORE_SHEETS -> không cho kết luận (BR-07)
    // 3. aggregateScore = trung bình phiếu SUBMITTED; totalScore = Σ(score*weight) (BR-06)
  });

  test.fixme('INT-04: F03/F06 hai type (PROPOSAL_REVIEW vs ACCEPTANCE) không lẫn dữ liệu', async () => {
    // Cùng đề tài: tạo round PROPOSAL_REVIEW rồi ACCEPTANCE; phiếu/tiêu chí/ngưỡng độc lập, không rò chéo
  });

  test.fixme('INT-05: hội đồng đạo đức song song — APPROVED chỉ khi CẢ HAI đạt (AND)', async () => {
    // SUBMITTED -> HĐ khoa học + HĐ đạo đức (ETHICS_REVIEW) song song
    // Một bên chưa đạt -> KHÔNG APPROVED; cả hai đạt -> APPROVED
  });

  test.fixme('INT-06: thư ký on-behalf — audit ghi actor vs onBehalfOf, chặn ngoài ủy quyền', async () => {
    // 1. Thư ký nộp báo cáo thay chủ nhiệm -> AuditLog actorId=thư ký, onBehalfOf=chủ nhiệm (P02 BR-04)
    // 2. Thư ký thử xác nhận cấp kinh phí (quyền chuyên viên) -> CHẶN
  });
});

// ============================================================
// C. Đóng băng cấu hình theo kỳ  🟡 (mutation — env test riêng)
// ============================================================
test.describe('Đóng băng cấu hình kỳ', () => {
  test.fixme('INT-07: kỳ đóng băng sau khi có đề tài SUBMITTED', async () => {
    // 1. Kỳ OPEN, đã ghim biểu mẫu + reviewCriteriaSetId, có >=1 đề tài SUBMITTED
    // 2. Sửa biểu mẫu/tiêu chí -> CHẶN; chỉ cho gia hạn endDate về tương lai (BR-06)
    // 3. Hủy kỳ có SUBMITTED -> CHẶN (phải CLOSED, không CANCELLED) (BR-07)
    // 4. Nộp đề tài sau khi kỳ CLOSED/quá hạn -> CHẶN (BR-05)
  });

  test.fixme('INT-08: mã đề tài bất biến qua trả-bổ-sung / nộp lại', async () => {
    // nộp -> trả bổ sung (SUBMITTED->DRAFT + lý do, còn hạn) -> sửa -> nộp lại
    // -> mã đề tài KHÔNG đổi (BR-07); field khóa/mở đúng state; quá hạn -> không mở lại
  });
});

// ============================================================
// D. E4 — quy đổi giờ giảng  🟡
// ============================================================
test.describe('E4 · quy đổi giờ giảng', () => {
  test.fixme('INT-09: giờ giảng idempotent + thu hồi (F09/F11→P03→F08)', async () => {
    // 1. Duyệt đầu mục F09 (ON_APPROVE) -> P03 tạo TeachingHourRecord idempotent
    //    theo (tenantId, sourceType, sourceId, eventKey) -> F08 hiển thị
    // 2. Duyệt lại / tính lại -> KHÔNG nhân đôi giờ (P03 BR-08)
    // 3. Thu hồi đầu mục (APPROVED->DRAFT) -> P03 điều chỉnh/gỡ giờ + audit -> F08 cập nhật (F09 BR-06)
    // 4. Công thức áp theo sourceOccurredAt, không theo ngày tính lại (P03 BR-03)
  });

  test.fixme('INT-10: phân bổ giờ đa vai trò, tổng tỷ lệ = 100%', async () => {
    // Đầu mục nhiều người + contributionRatio -> P03 phân bổ theo allocationRule; tổng != 100% -> chặn/cảnh báo
  });
});

// ============================================================
// E. Nền tảng  🟡 / ⚪
// ============================================================
test.describe('Nền tảng workflow & nghiệm thu', () => {
  test.fixme('INT-13: làm lại nghiệm thu có giới hạn MAX_REDO_COUNT', async () => {
    // FAILED->IN_PROGRESS <= ACCEPTANCE.MAX_REDO_COUNT; vượt -> chặn; mỗi lần qua domain service + audit (F06 BR-10)
  });

  // ⚪ INT-11 (nguyên tử workflow + audit cùng transaction): kiểm ở tầng DB/service, KHÔNG qua UI.
  //    Nghiệm thu thủ công / integration test backend — không scaffold ở đây.
});
