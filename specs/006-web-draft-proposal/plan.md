---
story: US-06
feature: F01
review_id: RV-06
status: Draft
updated: 2026-11-24
---

# Kế hoạch · Lưu nháp thuyết minh

18/11/2026 · US-06 · F01 / `proposal` · [Spec](spec.md)

## Summary

Chủ nhiệm lưu đề xuất của mình trong kỳ đang mở để hoàn thiện qua nhiều lần trước khi xin xét. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Cho lưu bản nháp thiếu trường bắt buộc của lần nộp khi đã xác định kỳ và chủ nhiệm.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Web RMS theo quyền của người thực hiện. Dữ liệu trong lát: Kỳ mở, chủ nhiệm, phần thuyết minh đã soạn. Đối chiếu trên bộ thử kỳ mở, hai nhà nghiên cứu độc lập. Điều kiện tích hợp: F02, B03.

### Xử lý tại module F01

Lưu hồ sơ và thành viên chủ nhiệm cùng giao dịch; truy xuất nháp kiểm chủ sở hữu. Giữ yêu cầu điền đủ thuyết minh cho bước nộp.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-06 đã chốt cho triển khai ngày 24/11/2026 | [RV-06](../review-decisions.md#rv-06). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/proposal/draft-proposal` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/proposal/draft-proposal`. Hợp đồng tại `packages/api-contracts/proposal/draft-proposal.yaml`. Kiểm tích hợp tại `e2e/proposal/draft-proposal`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Kỳ mở, chủ nhiệm, phần thuyết minh đã soạn → Định danh nháp và nội dung đã lưu | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh nhà nghiên cứu khác ngoài phạm vi trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Cho lưu bản nháp thiếu trường bắt buộc của lần nộp khi đã xác định kỳ và chủ nhiệm. | TC-03 |
