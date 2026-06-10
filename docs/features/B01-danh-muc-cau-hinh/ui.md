---
title: "Danh mục & cấu hình — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
version: 0.2
updated: 2026-06-10
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
| Xem danh mục lookup (Catalog/CatalogItem) | ✓ | ✓ |
| Tạo/sửa/vô hiệu/xóa mềm CatalogItem | ✓ | – |
| Tạo loại danh mục mới (thêm `Catalog`) | ✓ | – |
| Xem / Tạo / Sửa mẫu biểu thuyết minh¹ | ✓ | – |
| Xem nhật ký thay đổi (audit) | ✓ | ✓ (chỉ đọc) |

¹ Quản lý mẫu biểu thuyết minh phụ thuộc đề xuất bổ sung thực thể `BieuMauThuyetMinh` — xem
`spec.md` §5 và §7. Trước khi thực thể được duyệt, chức năng này coi là chưa khả dụng.

## 3. Danh sách màn hình

Toàn bộ B01 nằm trong một **trang "Danh mục & cấu hình"** với **nav trái** liệt kê các danh mục
(theo [spec §3.1 Sổ danh mục](./spec.md#31-sổ-danh-mục-catalog-registry)). Bấm một mục ở nav trái → panel
phải hiển thị bảng/cây tương ứng. Bố cục khớp ảnh thiết kế (assets):

```
┌──────────────────────────┬─────────────────────────────────────────────┐
│ Loại danh mục            │  [Tên danh mục đang chọn]      [+ Thêm mục]   │
│ ─────────────────────    │  ┌─────────────────────────────────────────┐ │
│ ▸ Địa chỉ (Tỉnh/Huyện/Xã)│  │ Mã   │ Tên           │ Trạng thái │ ⋯    │ │
│   Đơn vị công tác        │  ├─────────────────────────────────────────┤ │
│   Phân loại đề tài NCKH  │  │ ...  │ ...           │ ACTIVE     │ Sửa  │ │
│   Chuyên ngành đề tài    │  └─────────────────────────────────────────┘ │
│   Phân loại thông báo    │                                               │
│   Phân loại đánh giá     │  Bộ lọc: [Trạng thái ▾] [Tìm mã/tên...]       │
│   Chức vụ                │                                               │
│   Vị trí, vai trò ND     │                                               │
│   … (+ Thêm loại danh mục)│                                              │
└──────────────────────────┴─────────────────────────────────────────────┘
```

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| BO-00 | Hub danh mục (nav trái) | Khung trang + nav trái liệt kê mọi danh mục ở spec §3.1; "+ Thêm loại danh mục" tạo `Catalog` mới (BR-12). |
| BO-01 | Cây đơn vị (Unit) | Xem/quản lý cây phân cấp đơn vị. |
| BO-02 | Cây lĩnh vực/chuyên ngành (ResearchField) | Xem/quản lý cây phân cấp lĩnh vực nghiên cứu. |
| BO-03 | Loại sản phẩm (ProductType) | Quản lý danh mục loại sản phẩm theo `category`. |
| BO-04 | Tham số hệ thống (SystemSetting) | Xem/sửa tham số khóa–giá trị vận hành. |
| BO-05 | Bộ tiêu chí đánh giá (CriteriaSet/EvaluationCriterion) | Quản lý bộ tiêu chí PROPOSAL_REVIEW/ACCEPTANCE và các tiêu chí con. |
| BO-06 | Mẫu biểu thuyết minh¹ | Quản lý cấu trúc biểu mẫu thuyết minh cho kỳ nhận đề xuất. |
| BO-07 | Nhật ký thay đổi danh mục | Tra cứu audit các thay đổi danh mục/cấu hình. |
| BO-08 | Danh mục lookup generic (Catalog/CatalogItem) | Một màn hình chung render mọi danh mục lookup (địa chỉ, chức vụ, các "phân loại…", vị trí–vai trò) theo `Catalog.structure`. |

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
  CriteriaSet/Catalog/CatalogItem), khoảng thời gian, người thực hiện. Cột `oldValue` / `newValue`. Chỉ đọc.

### BO-08 Danh mục lookup generic (Catalog/CatalogItem)
- **Render theo cấu trúc:** một màn hình chung phục vụ mọi danh mục lookup ở spec §3.1. Khi `Catalog.structure
  = FLAT` → bảng phẳng (`code`, `name`, `sortOrder`, `recordStatus`); khi `= TREE` (vd Địa chỉ) → cây phân cấp
  theo `parentItemId`, kèm cột `extra` đặc thù (vd `level` Tỉnh/Huyện/Xã).
- **Thao tác:** thêm/sửa mục; với danh mục TREE thêm mục con dưới mục cha, di chuyển mục (chống vòng — BR-03/BR-11);
  vô hiệu hóa (INACTIVE); xóa mềm (DELETED) chỉ khi không còn tham chiếu (BR-02/BR-04). Trùng mã trong cùng
  danh mục bị chặn (BR-01); `extra` validate theo `extraSchema` nếu có (BR-13).
- **Thêm loại danh mục mới:** nút "+ Thêm loại danh mục" ở nav trái mở form tạo `Catalog` (`code`, `name`,
  `structure`); lưu xong loại mới xuất hiện ngay ở nav, không cần deploy (BR-12). Loại `isSystem = true`
  khóa nút đổi `code`/xóa.

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
| BO-07 Nhật ký | AC-01, AC-05, AC-12 (kiểm chứng audit được ghi) |
| BO-08 Danh mục lookup | AC-10 (trùng mã theo danh mục), AC-11 (chống vòng cây), AC-12 (thêm loại mới), AC-13 (extra schema), AC-14 (RESTRICT) |
