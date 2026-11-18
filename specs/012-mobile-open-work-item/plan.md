---
story: US-12
feature: B06
review_id: RV-12
status: Draft
updated: 2026-11-18
---

# Kế hoạch · Mở việc cần xử lý trên điện thoại

18/11/2026 · US-12 · B06 / `home` · [Spec](spec.md)

## Summary

Chủ nhiệm dùng web trên điện thoại để tìm hồ sơ bị trả và mở đúng nơi sửa. Trang chủ chỉ đọc. Truy vấn trong phạm vi hiện tại. Đọc hoặc mở liên kết giữ nguyên trạng thái hồ sơ. Kiểm quyền khi mở liên kết, hướng người dùng về danh sách đã làm mới.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Web responsive, màn hình 360 px và 390 px. Dữ liệu trong lát: Phiên người dùng, danh sách việc, liên kết của thẻ ở màn hình hẹp. Đối chiếu trên bộ thử một hồ sơ cần bổ sung, tài khoản đúng và sai phạm vi. Điều kiện tích hợp: B06, F01, B03.

### Xử lý tại module B06

Hiển thị thẻ theo trạng thái chuẩn của hồ sơ. Chạm thẻ mở route F01 của đúng hồ sơ; lấy lại quyền tại đích. Trang chủ chỉ đọc.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Lát đọc này không phát lệnh chuyển. | Truy vấn trong phạm vi hiện tại. Đọc hoặc mở liên kết giữ nguyên trạng thái hồ sơ. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-12 là giả định có người phụ trách | [RV-12](../review-decisions.md#rv-12). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/home/open-work-item` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/home/open-work-item`. Hợp đồng tại `packages/api-contracts/home/open-work-item.yaml`. Kiểm tích hợp tại `e2e/home/open-work-item`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Phiên người dùng, danh sách việc, liên kết của thẻ ở màn hình hẹp → Chuyển tới đúng hồ sơ nguồn, giữ nguyên dữ liệu | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh người ngoài phạm vi trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Kiểm quyền khi mở liên kết, hướng người dùng về danh sách đã làm mới. | TC-03 |
