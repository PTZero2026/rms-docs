---
story: US-21
feature: F07
review_id: RV-21
status: Draft
updated: 2026-11-24
---

# Căn cứ và quyết định · US-21

**Vấn đề.** Duyệt cùng sản phẩm hai lần có làm tăng số cam kết đã đạt không?

**Quyết định triển khai.** Tổng hợp theo định danh sản phẩm đã duyệt, độc lập số lần gửi lệnh.

**Lý do.** Trong trường hợp cùng một đầu ra vừa duyệt, cam kết còn thiếu một sản phẩm cùng loại, người dùng cần thấy kết quả “chỉ một đầu ra được tính, mục cam kết vẫn thiếu một”. Phương án khác: Cộng biến đếm theo mỗi lượt bấm duyệt. Dùng TC-03 để phân biệt hai phương án. [RV-21](../review-decisions.md#rv-21)

**Tài liệu đối chiếu.** [F07](../../docs/features/F07-san-pham-khoa-hoc/spec.md) — AC-03, AC-08, AC-11. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-03 (Happy — duyệt sản phẩm)** — Given sản phẩm `PENDING_APPROVAL` đủ minh chứng; When chuyên viên duyệt; Then `approvalStatus=APPROVED`, ghi người/thời điểm duyệt, khóa trường chính, sản phẩm được tính cho nghiệm thu/lý lịch/báo cáo (BR-09, BR-10).

- **AC-08 (Negative — sai quyền duyệt)** — Given người dùng là chủ nhiệm/thành viên đề tài; When gọi hành động duyệt/từ chối sản phẩm; Then backend trả 403, không đổi trạng thái (BR-09).

- **AC-11 (Happy — đối chiếu đủ sản phẩm cam kết)** — Given đề tài có cam kết 2 bài báo và đã có 2 `ResearchOutput.APPROVED` loại bài báo gắn với đề tài; When F04/F06 kiểm điều kiện sản phẩm; Then F07 trả kết quả **đủ**, cho phép bước nghiệm thu tiếp tục (BR-11).

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [design.md](../../docs/features/F07-san-pham-khoa-hoc/design.md) · [test-plan.md](../../docs/features/F07-san-pham-khoa-hoc/test-plan.md) · [ui.md](../../docs/features/F07-san-pham-khoa-hoc/ui.md)
