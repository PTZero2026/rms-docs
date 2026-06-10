---
title: "Danh mục & cấu hình — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
version: 0.1
updated: 2026-06-09
---

# Danh mục & cấu hình — Giao diện

> Một web app duy nhất; màn hình & hành động hiển thị **theo phân quyền (RBAC)** — xem
> [ADR-0009](../../architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md). Chỉ mô tả phần
> **đặc thù giao diện**. Luật nghiệp vụ → xem `./spec.md`.

## 1. Vai trò sử dụng

- **Quản trị hệ thống** (admin): chủ thể chính, CRUD toàn bộ danh mục và tham số cấu hình.
- **Chuyên viên QL KHCN**: xem các danh mục để đối chiếu khi vận hành; được quản lý (tạo/sửa) riêng
  **CriteriaSet/EvaluationCriterion** phục vụ nghiệp vụ xét duyệt/nghiệm thu.

Cùng một web app — mỗi vai trò thấy đúng tập màn hình/hành động theo quyền. Vai trò chi tiết:
[`../../product/personas.md`](../../product/personas.md). Quy tắc phân quyền nền:
[`../../architecture/overview.md`](../../architecture/overview.md) §4.1 (RBAC, kiểm tra quyền ở backend).

## 2. Phân quyền (Permission matrix)

Cột là vai trò; ✓ = được phép, – = không. Mọi quyền kiểm tra ở backend; web app/UI chỉ ẩn/hiện theo quyền.

| Hành động | Quản trị hệ thống | Chuyên viên QL KHCN |
|-----------|:-----------------:|:-------------------:|
| Xem danh mục Unit / ResearchField / ProductType | ✓ | ✓ |
| Tạo/sửa Unit / ResearchField / ProductType | ✓ | – |
| Vô hiệu hóa / Xóa mềm Unit / ResearchField / ProductType | ✓ | – |
| Xem SystemSetting | ✓ | ✓ |
| Sửa SystemSetting (tham số vận hành) | ✓ | – |
| Xem CriteriaSet / EvaluationCriterion | ✓ | ✓ |
| Tạo/sửa CriteriaSet / EvaluationCriterion | ✓ | ✓ |
| Vô hiệu hóa / Xóa mềm CriteriaSet | ✓ | – |
| Xem / Tạo / Sửa mẫu biểu thuyết minh¹ | ✓ | – |
| Xem nhật ký thay đổi (audit) | ✓ | ✓ (chỉ đọc) |

¹ Quản lý mẫu biểu thuyết minh phụ thuộc đề xuất bổ sung thực thể `BieuMauThuyetMinh` — xem
`spec.md` §5 và §7. Trước khi thực thể được duyệt, chức năng này coi là chưa khả dụng.

## 3. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| BO-01 | Cây đơn vị (Unit) | Xem/quản lý cây phân cấp đơn vị. |
| BO-02 | Cây lĩnh vực (ResearchField) | Xem/quản lý cây phân cấp lĩnh vực nghiên cứu. |
| BO-03 | Loại sản phẩm (ProductType) | Quản lý danh mục loại sản phẩm theo `category`. |
| BO-04 | Tham số hệ thống (SystemSetting) | Xem/sửa tham số khóa–giá trị vận hành. |
| BO-05 | Bộ tiêu chí đánh giá (CriteriaSet/EvaluationCriterion) | Quản lý bộ tiêu chí PROPOSAL_REVIEW/ACCEPTANCE và các tiêu chí con. |
| BO-06 | Mẫu biểu thuyết minh¹ | Quản lý cấu trúc biểu mẫu thuyết minh cho kỳ nhận đề xuất. |
| BO-07 | Nhật ký thay đổi danh mục | Tra cứu audit các thay đổi danh mục/cấu hình. |

## 4. Mô tả màn hình & thao tác

### BO-01 Cây đơn vị / BO-02 Cây lĩnh vực
- **Hiển thị:** dạng cây (tree) phân cấp theo `parentUnitId` / `parentFieldId`, kèm cột `code`, `name`,
  `recordStatus`. Bộ lọc theo trạng thái (ACTIVE/INACTIVE/DELETED) và ô tìm theo mã/tên.
- **Thao tác:** thêm nút con dưới một nút cha; sửa tên/mã; di chuyển nút (đổi cha) với kiểm tra chống
  vòng (BR-03); vô hiệu hóa (INACTIVE); xóa mềm (DELETED) chỉ khi không còn tham chiếu (BR-02/BR-04).
- **Phản hồi lỗi:** trùng mã (BR-01), tạo vòng (BR-03), đang được tham chiếu khi xóa (BR-02) hiển thị
  thông báo rõ và đề nghị vô hiệu hóa thay vì xóa.

### BO-03 Loại sản phẩm
- **Hiển thị:** bảng phẳng `code`, `name`, `category`, `recordStatus`. Lọc theo `category` (enum cố định, BR-09).
- **Thao tác:** tạo/sửa/vô hiệu/xóa mềm. `category` chọn từ danh sách cố định, không nhập tự do.

### BO-04 Tham số hệ thống
- **Hiển thị:** bảng `key`, `value`, `dataType`, `description`. Nhóm hiển thị theo nhóm chức năng
  (xét duyệt, nhắc hạn, …) cho dễ tra.
- **Thao tác:** chỉ **sửa giá trị** (không tạo/xóa khóa tùy tiện qua UI — khóa do hệ thống định nghĩa).
  Validate theo `dataType` (BR-06); hiển thị cảnh báo phạm vi ảnh hưởng (vd "ảnh hưởng F03 xét duyệt").

### BO-05 Bộ tiêu chí đánh giá
- **Hiển thị:** danh sách `CriteriaSet` (lọc theo `type` PROPOSAL_REVIEW/ACCEPTANCE); mở một bộ để xem/sửa các
  `EvaluationCriterion` (cột `name`, `maxScore`, `weight`). Hiển thị **tổng trọng số** real-time.
- **Thao tác:** thêm/sửa/xóa tiêu chí con; ràng buộc `maxScore > 0`, `0 ≤ weight ≤ 100` (BR-08).
  Khi lưu, nếu tổng `weight ≠ 100%` hiển thị cảnh báo nhưng vẫn cho lưu (BR-07).

### BO-06 Mẫu biểu thuyết minh¹
- **Hiển thị/thao tác:** quản lý cấu trúc biểu mẫu (danh sách section/trường) dùng cho kỳ nhận đề xuất F02.
  Phụ thuộc đề xuất bổ sung `BieuMauThuyetMinh` (spec §5).

### BO-07 Nhật ký thay đổi danh mục
- **Hiển thị:** bảng `AuditLog` lọc theo `targetType` (Unit/ResearchField/ProductType/SystemSetting/
  CriteriaSet), khoảng thời gian, người thực hiện. Cột `oldValue` / `newValue`. Chỉ đọc.

## 5. Audit & nhật ký

- Mọi thao tác **tạo / sửa / vô hiệu hóa / xóa mềm** danh mục và **sửa tham số** cấu hình ghi
  `AuditLog` (append-only) với `actorId`, `action`, `targetType`, `targetId`,
  `oldValue`, `newValue`, `occurredAt`, `ipAddress` (BR-05; data-model §4.7).
- Audit là **bất biến**, không sửa/xóa qua UI.
- **Ai xem:** Quản trị hệ thống xem toàn bộ; Chuyên viên QL KHCN xem (chỉ đọc) phục vụ đối chiếu. Truy
  cập audit cũng kiểm tra ở backend.

## 6. Liên kết AC

| Màn hình | AC liên quan (xem `spec.md` §6) |
|----------|----------------------------------|
| BO-01 Cây đơn vị | AC-03 (chống vòng), AC-08 (quyền) |
| BO-02 Cây lĩnh vực | AC-01, AC-02 (trùng mã), AC-04 (RESTRICT), AC-05 (xóa mềm) |
| BO-03 Loại sản phẩm | AC-02 (trùng mã), AC-08 (quyền) |
| BO-04 Tham số hệ thống | AC-06 (sai kiểu dữ liệu) |
| BO-05 Bộ tiêu chí | AC-07 (cảnh báo trọng số), AC-08 (quyền CriteriaSet), AC-09 (maxScore) |
| BO-07 Nhật ký | AC-01, AC-05 (kiểm chứng audit được ghi) |
