---
story: US-05
feature: F02
review_id: RV-05
status: Draft
updated: 2026-11-18
---

# Kế hoạch · Mở một kỳ nhận đề xuất

18/11/2026 · US-05 · F02 / `call` · [Spec](spec.md)

## Summary

Chuyên viên thiết lập mã kỳ, thời gian, bộ tiêu chí và mở đợt để giảng viên biết nơi nộp đúng hạn. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Kiểm lại danh mục và bộ tiêu chí tại thời điểm mở, chỉ rõ mục phải thay.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Web RMS theo quyền của người thực hiện. Dữ liệu trong lát: Mã kỳ, cửa sổ thời gian, danh mục, bộ tiêu chí. Đối chiếu trên bộ thử một kỳ nháp, danh mục còn hiệu lực. Điều kiện tích hợp: B01, B03.

### Xử lý tại module F02

Kiểm lại mã kỳ không trùng và danh mục hiệu lực khi mở. Chỉ công bố cho người nộp sau khi trạng thái OPEN cùng sự kiện audit đã ghi.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-05 là giả định có người phụ trách | [RV-05](../review-decisions.md#rv-05). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/call/open-call` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/call/open-call`. Hợp đồng tại `packages/api-contracts/call/open-call.yaml`. Kiểm tích hợp tại `e2e/call/open-call`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Mã kỳ, cửa sổ thời gian, danh mục, bộ tiêu chí → Kỳ OPEN hiển thị ở danh sách tiếp nhận | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh ngày kết thúc trước ngày bắt đầu trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Kiểm lại danh mục và bộ tiêu chí tại thời điểm mở, chỉ rõ mục phải thay. | TC-03 |
