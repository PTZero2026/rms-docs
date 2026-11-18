---
story: US-11
feature: F03
review_id: RV-11
status: Draft
updated: 2026-11-18
---

# Kế hoạch · Chốt kết quả xét duyệt

18/11/2026 · US-11 · F03 / `review` · [Spec](spec.md)

## Summary

Chuyên viên kết luận theo số phiếu và ngưỡng điểm để công bố đúng quyết định của đợt. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Lưu kết luận khoa học riêng, giữ chuyển APPROVED cho tới khi đủ kết quả đạo đức nếu quy chế yêu cầu.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Dịch vụ dùng chung và điểm gọi của module sở hữu. Dữ liệu trong lát: Đợt đang thu phiếu, ngưỡng, phiếu đã nộp, kết quả đạo đức nếu áp dụng. Đối chiếu trên bộ thử ba bộ phiếu dựng sẵn ở trên, dưới và bằng ngưỡng. Điều kiện tích hợp: F03, P01, B04.

### Xử lý tại module F03

Tính số phiếu hợp lệ trước điểm tổng hợp. Bằng ngưỡng cho kết quả đạt. Khi phải thẩm định đạo đức, tách lưu kết luận khoa học khỏi bước công bố phê duyệt cuối.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Chuyển trạng thái đề tài qua P01, lưu lịch sử và P02 cùng giao dịch. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-11 là giả định có người phụ trách | [RV-11](../review-decisions.md#rv-11). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/review/review-decision` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/review/review-decision`. Hợp đồng tại `packages/api-contracts/review/review-decision.yaml`. Kiểm tích hợp tại `e2e/review/review-decision`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Đợt đang thu phiếu, ngưỡng, phiếu đã nộp, kết quả đạo đức nếu áp dụng → Kết luận đợt, trạng thái đề tài và số phiếu thiếu nếu bị chặn | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh chưa đủ phiếu trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Lưu kết luận khoa học riêng, giữ chuyển APPROVED cho tới khi đủ kết quả đạo đức nếu quy chế yêu cầu. | TC-03 |
