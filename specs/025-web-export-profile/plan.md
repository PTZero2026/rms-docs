---
story: US-25
feature: F08
review_id: RV-25
status: Draft
updated: 2026-11-21
---

# Kế hoạch · Xuất lý lịch nghiên cứu của cá nhân

18/11/2026 · US-25 · F08 / `profile` · [Spec](spec.md)

## Summary

Nhà nghiên cứu lấy lý lịch theo mẫu đơn vị, tái dùng đề tài và sản phẩm đã đủ điều kiện tổng hợp. Truy vấn trong phạm vi hiện tại. Đọc hoặc mở liên kết giữ nguyên trạng thái hồ sơ. Mỗi lần xuất dùng phiên bản mẫu của trường đang có hiệu lực tại thời điểm xuất. Nhật ký `EXPORT_CV` của lần đó ghi mã mẫu và phiên bản thực tế đã dùng.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Web RMS theo quyền của người thực hiện. Dữ liệu trong lát: Cá nhân, mẫu tenant, sản phẩm duyệt và vai trò. Đối chiếu trên bộ thử hai phiên bản v1 và v2 có tiêu đề khác nhau của cùng một mẫu tenant, một người có hai vai trò trên cùng sản phẩm đã duyệt và một sản phẩm đang chờ duyệt. Điều kiện tích hợp: F08, F07, P03.

### Xử lý tại module F08

Khử trùng theo ID sản phẩm trước khi đổ mẫu. Kiểm chủ hồ sơ hoặc quyền xem của chuyên viên, xác định phiên bản mẫu hiệu lực khi xuất và dùng cùng phiên bản cho tệp và nhật ký `EXPORT_CV`.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Lát đọc này không phát lệnh chuyển. | Truy vấn trong phạm vi hiện tại. Đọc hoặc mở liên kết giữ nguyên trạng thái hồ sơ. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-25 đã chấp thuận ngày 21/11/2026 | [RV-25](../review-decisions.md#rv-25). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/profile/export-profile` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/profile/export-profile`. Hợp đồng tại `packages/api-contracts/profile/export-profile.yaml`. Kiểm tích hợp tại `e2e/profile/export-profile`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Cá nhân, mẫu tenant, sản phẩm duyệt và vai trò → Bản lý lịch theo mẫu, từng đầu ra chỉ xuất hiện một lần | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh người dùng ngoài phạm vi trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Mỗi lần xuất dùng phiên bản mẫu của trường đang có hiệu lực tại thời điểm xuất. Nhật ký `EXPORT_CV` của lần đó ghi mã mẫu và phiên bản thực tế đã dùng. | TC-03 |
