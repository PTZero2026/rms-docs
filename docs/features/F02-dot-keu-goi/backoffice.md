---
title: "Kỳ nhận đề xuất — BackOffice (quản trị)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-01
---

# Kỳ nhận đề xuất — Mặt quản trị

> Chỉ mô tả phần **đặc thù quản trị**. Luật nghiệp vụ → xem [`spec.md`](./spec.md).

## 1. Vai trò sử dụng

- **Chuyên viên QL KHCN** — vai trò chính: tạo, cấu hình, mở/đóng/hủy kỳ, theo dõi số đề xuất.
- **Quản trị hệ thống** — gián tiếp: cấp quyền `PROPOSAL_CALL.MANAGE` và quản lý danh mục nền (B01/B03).
- **Thành viên hội đồng** — không thao tác F02 (chỉ tiêu thụ bộ tiêu chí của kỳ qua F03).

Xem chi tiết persona ở `../../product/personas.md`.

## 2. Phân quyền (Permission matrix)

Quyền nguyên tử theo quy ước `MODULE.ACTION` (data-model §4.1). Backend kiểm tra mọi API;
BO chỉ ẩn/hiện theo quyền (overview §4.1).

| Hành động | Chuyên viên QL KHCN | Quản trị hệ thống | Thành viên hội đồng |
|-----------|:-------------------:|:-----------------:|:-------------------:|
| Xem danh sách / chi tiết kỳ | ✓ | ✓ | – |
| Tạo / sửa kỳ (`DRAFT`) | ✓ | – | – |
| Cấu hình lĩnh vực + biểu mẫu + bộ tiêu chí | ✓ | – | – |
| Mở kỳ (`DRAFT → OPEN`) | ✓ | – | – |
| Đóng kỳ (`OPEN → CLOSED`) | ✓ | – | – |
| Hủy kỳ (`→ CANCELLED`) | ✓ | – | – |
| Gia hạn `endDate` | ✓ | – | – |
| Theo dõi số đề xuất | ✓ | ✓ | – |

> Quyền vận hành kỳ gắn với `PROPOSAL_CALL.MANAGE`. Người không có quyền bị từ chối 403 (AC-08).

## 3. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| BO-01 | Danh sách kỳ nhận đề xuất | Liệt kê mọi kỳ theo trạng thái, lọc/tìm, vào tạo mới |
| BO-02 | Tạo / sửa kỳ | Nhập tên/mã, thời gian, cấu hình lĩnh vực + biểu mẫu + bộ tiêu chí |
| BO-03 | Chi tiết kỳ & vận hành | Mở/đóng/hủy/gia hạn, theo dõi số đề xuất đã nộp |

## 4. Mô tả màn hình & thao tác

### BO-01 — Danh sách kỳ nhận đề xuất

- **Bộ lọc:** theo `status` (`DRAFT`/`OPEN`/`CLOSED`/`CANCELLED`), theo lĩnh vực, theo khoảng thời gian;
  tìm theo `name`/`code`. Phân trang server-side.
- **Cột bảng:** `code`, `name`, `startDate`–`endDate`, trạng thái (badge), số đề xuất, người tạo, cập nhật.
- **Thao tác:** "Tạo kỳ mới" → BO-02; bấm dòng → BO-03.
- **Trạng thái:** đang tải (skeleton bảng); rỗng ("Chưa có kỳ nhận đề xuất nào — Tạo kỳ mới"); lỗi + "Thử lại".

### BO-02 — Tạo / sửa kỳ

- **Trường nhập:** `code` (unique — BR-02), `name`, `startDate`, `endDate`, chọn nhiều `ResearchField`
  (`researchFieldIds`, nguồn B01), chọn biểu mẫu thuyết minh (`proposalTemplateId`), chọn bộ tiêu chí
  xét duyệt (`reviewCriteriaSetId`). Chỉ hiện danh mục B01 đang `ACTIVE` (BR-04).
- **Validate khi Lưu:** `endDate ≥ startDate` (BR-01); `code` chưa tồn tại (BR-02). Lỗi inline tại trường.
- **Khóa cấu hình (chế độ sửa):** nếu kỳ đã `OPEN` và đã có ≥1 đề tài `SUBMITTED`, vô hiệu hóa
  `startDate`/`researchFieldIds`/`proposalTemplateId`/`reviewCriteriaSetId`; chỉ cho sửa `endDate` (gia hạn) — BR-06.
- **Lưu:** tạo/cập nhật kỳ ở `DRAFT` (kỳ mới); chuyển BO-03 sau khi lưu.

### BO-03 — Chi tiết kỳ & vận hành

- **Khối thông tin:** toàn bộ cấu hình + trạng thái hiện tại + **số đề xuất** (đếm `ResearchProject` theo kỳ,
  tách theo trạng thái: nháp / đã nộp / đang xét duyệt…).
- **Hành động vận hành (hiện theo trạng thái & quyền):**
  - "Mở kỳ" (`DRAFT → OPEN`): kiểm BR-03 (đủ trường) + BR-04 (danh mục hiệu lực); xác nhận trước khi mở.
  - "Đóng kỳ" (`OPEN → CLOSED`): xác nhận; sau khi đóng, F01 ngừng nhận đề xuất mới (BR-05).
  - "Gia hạn" (`OPEN` hoặc mở lại `CLOSED → OPEN`): nhập `endDate` mới về tương lai (BR-06/BR-01).
  - "Hủy kỳ" (`→ CANCELLED`): chỉ bật khi kỳ **chưa có** đề tài `SUBMITTED`; nếu có → chặn với thông báo
    phải "Đóng" thay vì "Hủy" (BR-07). Yêu cầu nhập `reason`.
- **Liên kết:** từ số đề xuất có thể điều hướng sang danh sách đề tài của kỳ (F01) — ngoài phạm vi F02.

## 5. Audit & nhật ký

Ghi `AuditLog` (append-only, data-model §4.7) cho các hành động đổi trạng thái/cấu hình quan trọng:

| Hành động | Ghi log | Giá trị lưu |
|---|---|---|
| Tạo kỳ | ✓ | `newValue` = cấu hình kỳ |
| Sửa cấu hình / gia hạn | ✓ | `oldValue` → `newValue` các trường thay đổi |
| Mở / Đóng kỳ | ✓ | chuyển `status`, người + thời điểm |
| Hủy kỳ | ✓ | `status = CANCELLED`, kèm `reason` |

Người xem nhật ký: chuyên viên QL KHCN và quản trị hệ thống (theo quyền xem audit ở B03).

## 6. Liên kết AC

| Màn hình | AC liên quan (xem `spec.md` §6) |
|----------|----------------------------------|
| BO-01 | AC-01 (kỳ mới xuất hiện danh sách), AC-08 (chặn truy cập trái quyền) |
| BO-02 | AC-01 (tạo `DRAFT`), AC-05 (validate thời gian/mã), AC-06 (khóa cấu hình) |
| BO-03 | AC-02 (mở kỳ), AC-04 (đóng kỳ), AC-06 (gia hạn), AC-07 (chặn hủy), AC-08 (quyền) |
