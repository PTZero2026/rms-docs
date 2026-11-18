---
story: US-10
feature: F03
review_id: RV-10
status: Draft
updated: 2026-11-18
---

# Kế hoạch · Gửi phiếu chấm cá nhân

18/11/2026 · US-10 · F03 / `review` · [Spec](spec.md)

## Summary

Thành viên hội đồng nhập điểm theo tiêu chí và nhận xét để phiếu hợp lệ được tính đúng trọng số. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Kiểm lại phân công và quan hệ với đề tài ngay lúc gửi.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Web RMS theo quyền của người thực hiện. Dữ liệu trong lát: Đợt, thành viên, điểm và nhận xét theo tiêu chí. Đối chiếu trên bộ thử một thành viên được phân công và một thành viên có xung đột lợi ích. Điều kiện tích hợp: F03, B03.

### Xử lý tại module F03

Kiểm lại quan hệ với đề tài, đủ từng tiêu chí và giới hạn điểm. Tính tổng từ điểm và trọng số phía máy chủ, khóa phiếu ngay khi SUBMITTED.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-10 là giả định có người phụ trách | [RV-10](../review-decisions.md#rv-10). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/review/submit-score` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/review/submit-score`. Hợp đồng tại `packages/api-contracts/review/submit-score.yaml`. Kiểm tích hợp tại `e2e/review/submit-score`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Đợt, thành viên, điểm và nhận xét theo tiêu chí → Phiếu đã nộp, tổng trọng số và trạng thái khóa | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh người chấm là thành viên đề tài trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Kiểm lại phân công và quan hệ với đề tài ngay lúc gửi. | TC-03 |
