---
story: US-24
feature: F05
review_id: RV-24
status: Draft
updated: 2026-11-21
---

# Kế hoạch · Quyết toán và đóng hồ sơ

18/11/2026 · US-24 · F05 / `budget` · [Spec](spec.md)

## Summary

Chuyên viên khóa sổ theo dõi kinh phí của một đề tài nghiệm thu đạt để ghi nhận hoàn thành. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Pilot chưa bật đối soát dùng kết quả rà thủ công. Khi đã bật, mọi khoản phải `MATCHED`. Nếu còn `UNRECONCILED` hoặc `MISMATCHED`, giữ `PASSED` và liệt kê từng khoản vướng.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Dịch vụ dùng chung và điểm gọi của module sở hữu. Dữ liệu trong lát: Hồ sơ PASSED, người quyết toán, chế độ đối soát của đơn vị, kết quả rà thủ công hoặc trạng thái đối soát của từng khoản. Đối chiếu trên bộ thử hồ sơ PASSED cho hai chế độ, gồm pilot rà thủ công và đơn vị bật đối soát với các khoản MATCHED, UNRECONCILED, MISMATCHED. Điều kiện tích hợp: F05, F06, P01, P02.

### Xử lý tại module F05

Một lệnh đóng duy nhất qua dịch vụ miền kiểm quyết toán và quyền. Lưu khóa kinh phí, trạng thái COMPLETED và audit nguyên tử. Ghi kết quả rà thủ công hoặc căn cứ chặn theo cấu hình đã duyệt.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Chuyển trạng thái đề tài qua P01, lưu lịch sử và P02 cùng giao dịch. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-24 đã chấp thuận ngày 21/11/2026 | [RV-24](../review-decisions.md#rv-24). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/budget/close-project` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/budget/close-project`. Hợp đồng tại `packages/api-contracts/budget/close-project.yaml`. Kiểm tích hợp tại `e2e/budget/close-project`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Hồ sơ PASSED, người quyết toán, chế độ đối soát của đơn vị, kết quả rà thủ công hoặc trạng thái đối soát của từng khoản → Hồ sơ COMPLETED, sổ bị khóa, nhật ký quyết toán | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh chủ nhiệm trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Pilot chưa bật đối soát dùng kết quả rà thủ công. Khi đã bật, mọi khoản phải `MATCHED`. Nếu còn `UNRECONCILED` hoặc `MISMATCHED`, giữ `PASSED` và liệt kê từng khoản vướng. | TC-03 |
