---
story: US-08
feature: F01
review_id: RV-08
status: Draft
updated: 2026-11-24
---

# Căn cứ và quyết định · US-08

**Vấn đề.** Có thể trả hồ sơ mà chỉ ghi khoảng trắng ở lý do?

**Quyết định triển khai.** Yêu cầu lý do có chữ nhìn thấy, hiển thị nguyên nội dung cho chủ nhiệm.

**Lý do.** Trong trường hợp hồ sơ còn hạn và lý do chỉ chứa khoảng trắng, người dùng cần thấy kết quả “giữ Đã nộp, yêu cầu nhập lý do”. Phương án khác: Cho phép trả hồ sơ với lý do mặc định. Dùng TC-03 để phân biệt hai phương án. [RV-08](../review-decisions.md#rv-08)

**Tài liệu đối chiếu.** [F01](../../docs/features/F01-de-xuat-de-tai/spec.md) — AC-07, AC-08, AC-11. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-07** (happy — chuyên viên trả lại bổ sung) — Given chuyên viên QL KHCN và một hồ sơ **Đã nộp** trong kỳ còn hạn, When trả lại bổ sung kèm lý do, Then hồ sơ chuyển **Nháp**, mở khóa cho chủ nhiệm sửa, lý do hiển thị cho chủ nhiệm và lưu nhật ký (BR-06).

- **AC-08** (biên — trả lại khi hết hạn) — Given một hồ sơ **Đã nộp** mà kỳ đã hết hạn nộp, When chuyên viên trả lại bổ sung, Then hệ thống chặn vì chủ nhiệm không còn thời gian nộp lại (BR-06), gợi ý xử lý theo F03.

- **AC-11** (biên — mã đề tài giữ nguyên khi nộp lại) — Given một hồ sơ từng **Đã nộp** rồi bị trả lại về **Nháp**, When chủ nhiệm sửa và nộp lại, Then **mã đề tài không** sinh mới, **thời điểm nộp** cập nhật theo lần nộp mới nhất (BR-07).

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [design.md](../../docs/features/F01-de-xuat-de-tai/design.md) · [test-plan.md](../../docs/features/F01-de-xuat-de-tai/test-plan.md) · [ui.md](../../docs/features/F01-de-xuat-de-tai/ui.md)
