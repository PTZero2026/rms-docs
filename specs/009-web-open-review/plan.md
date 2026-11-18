---
story: US-09
feature: F03
review_id: RV-09
status: Draft
updated: 2026-11-18
---

# Kế hoạch · Mở đợt chấm cho một đề tài

18/11/2026 · US-09 · F03 / `review` · [Spec](spec.md)

## Summary

Chuyên viên gắn đề tài đã chốt vào hội đồng và bộ tiêu chí để phát phiếu cho người được phân công. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Chỉ mở một đợt đang thu phiếu cho cùng hồ sơ và lần xét, trả thông tin đợt đã mở cho lần sau.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Web RMS theo quyền của người thực hiện. Dữ liệu trong lát: Hồ sơ chốt, hội đồng, bộ tiêu chí và phân công. Đối chiếu trên bộ thử kỳ đã đóng, hồ sơ đã nộp, hội đồng xét duyệt có thành viên. Điều kiện tích hợp: F02, F03, P01.

### Xử lý tại module F03

Kiểm kỳ đã đóng, hồ sơ đã chốt và ít nhất một thành viên trước khi tạo đợt. Tạo đợt và chuyển UNDER_REVIEW như một đơn vị công việc.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Chuyển trạng thái đề tài qua P01, lưu lịch sử và P02 cùng giao dịch. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-09 là giả định có người phụ trách | [RV-09](../review-decisions.md#rv-09). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/review/open-review` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/review/open-review`. Hợp đồng tại `packages/api-contracts/review/open-review.yaml`. Kiểm tích hợp tại `e2e/review/open-review`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Hồ sơ chốt, hội đồng, bộ tiêu chí và phân công → Đợt thu phiếu và danh sách người được chấm | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh thành viên chỉ có quyền chấm trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Chỉ mở một đợt đang thu phiếu cho cùng hồ sơ và lần xét, trả thông tin đợt đã mở cho lần sau. | TC-03 |
