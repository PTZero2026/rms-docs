---
story: US-24
feature: F05
review_id: RV-24
status: Draft
updated: 2026-11-21
---

# Căn cứ và quyết định · US-24

**Vấn đề.** Khi pilot chưa nối kế toán, căn cứ nào đủ để khóa sổ?

**Quyết định ngày 21/11/2026.** Pilot chưa bật đối soát cho phép chuyên viên xác nhận quyết toán sau khi rà thủ công. Khi đã bật, chỉ được đóng khi mọi khoản của đề tài đều `MATCHED`. Còn `UNRECONCILED` hoặc `MISMATCHED` thì giữ `PASSED` và liệt kê từng khoản cần xử lý.

**Lý do.** Trong trường hợp đề tài PASSED đã bật đối soát và còn một dòng MISMATCHED, người dùng cần thấy kết quả “giữ PASSED, chỉ rõ dòng cần xử lý trước khi đóng”. Phương án khác: Bắt buộc đối soát điện tử cho mọi đơn vị, kể cả nơi chưa có nguồn kế toán. TC-01 kiểm hai trường hợp được đóng, TC-03 kiểm riêng từng trạng thái vướng và trường hợp có cả hai. [RV-24](../review-decisions.md#rv-24)

**Tài liệu đối chiếu.** [F05](../../docs/features/F05-quan-ly-kinh-phi/spec.md) — AC-05, AC-07. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-05 (Happy — quyết toán & đóng đề tài)** — Given đề tài `PASSED` đã rà thủ công ở pilot chưa bật đối soát hoặc mọi khoản đều `MATCHED` ở đơn vị đã bật; When chuyên viên thực hiện quyết toán & đóng đề tài; Then `ResearchProject` chuyển `PASSED → COMPLETED` (qua domain service, phối hợp F06), kinh phí bị khóa, chủ nhiệm nhận thông báo, ghi audit (BR-06, BR-07).

- **AC-07 (Negative — chủ nhiệm không được xác nhận cấp/quyết toán)** — Given người dùng là **Chủ nhiệm đề tài**; When gọi hành động xác nhận cấp kinh phí hoặc quyết toán/đóng đề tài; Then hệ thống trả 403, không thực hiện (BR-04).

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [test-plan.md](../../docs/features/F05-quan-ly-kinh-phi/test-plan.md) · [ui.md](../../docs/features/F05-quan-ly-kinh-phi/ui.md) [F06 BR-09/AC-10](../../docs/features/F06-nghiem-thu/spec.md).
