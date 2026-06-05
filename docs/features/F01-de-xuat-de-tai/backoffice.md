---
title: "Đề xuất đề tài — BackOffice (quản trị)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-01
---

# Đề xuất đề tài — Mặt quản trị

> Chỉ mô tả phần **đặc thù quản trị**. Luật nghiệp vụ → xem `./spec.md`.

## 1. Vai trò sử dụng

- **Chuyên viên QL KHCN:** vai trò chính ở F01 — tiếp nhận, kiểm tra hồ sơ đề xuất theo kỳ; trả
  lại bổ sung kèm lý do; chốt danh sách đề xuất hợp lệ để chuyển sang xét duyệt (F03). Phạm vi dữ
  liệu theo đơn vị/kỳ được phân công (overview §4.1).
- **Quản trị hệ thống:** chỉ tham chiếu để cấu hình quyền (B03); không thao tác nghiệp vụ F01.

## 2. Phân quyền (Permission matrix)

Quyền nguyên tử dạng `MODULE.ACTION` (data-model §4.1). FE/BO chỉ ẩn/hiện theo quyền; backend
là lớp bảo vệ thật (overview §4.1).

| Hành động | Quyền | Chuyên viên QL KHCN | Quản trị hệ thống | Chủ nhiệm (FE) |
|-----------|-------|:-------------------:|:-----------------:|:-------------:|
| Xem danh sách/chi tiết đề xuất (theo phạm vi) | `RESEARCH_PROJECT.VIEW` | ✓ | ✓ | chỉ của mình |
| Tiếp nhận/đánh dấu đã kiểm tra | `RESEARCH_PROJECT.RECEIVE` | ✓ | – | – |
| Trả lại bổ sung (`SUBMITTED`→`DRAFT`) | `RESEARCH_PROJECT.RETURN_FOR_REVISION` | ✓ | – | – |
| Chốt danh sách sang xét duyệt | `RESEARCH_PROJECT.FINALIZE` | ✓ | – | – |
| Hủy đề xuất (trước xét duyệt) | `RESEARCH_PROJECT.CANCEL` | ✓ | – | của mình |
| Tạo/sửa nội dung hồ sơ | — | – | – | ✓ (khi `DRAFT`) |

> Việc chuyển `SUBMITTED` → `UNDER_REVIEW` và gán hội đồng thuộc **F03** (`RESEARCH_PROJECT.APPROVE` /
> module `review`), không nằm trong F01.

## 3. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| BO-01 | Danh sách đề xuất theo kỳ | Lọc/tìm đề xuất của một kỳ; theo dõi trạng thái. |
| BO-02 | Chi tiết hồ sơ đề xuất | Xem đầy đủ hồ sơ, thành viên, dự toán, tài liệu, lịch sử. |
| BO-03 | Tiếp nhận & kiểm tra | Đánh dấu đã kiểm tra; checklist hồ sơ. |
| BO-04 | Trả lại bổ sung | Trả về `DRAFT` kèm `reason` khi còn hạn. |
| BO-05 | Chốt danh sách xét duyệt | Chọn các đề xuất hợp lệ, chốt để chuyển F03. |

## 4. Mô tả màn hình & thao tác

### BO-01 — Danh sách đề xuất theo kỳ
- **Bộ lọc:** kỳ nhận đề xuất (mặc định kỳ đang chọn), trạng thái (`DRAFT`/`SUBMITTED`/`CANCELLED`), lĩnh vực,
  đơn vị chủ trì, khoảng `submittedAt`, từ khóa (`projectCode`/tên/chủ nhiệm).
- **Bảng:** `projectCode`, tên, chủ nhiệm, lĩnh vực, đơn vị, trạng thái, `submittedAt`, số tài liệu. Phân
  trang server-side (overview §4.5). Sắp xếp theo `submittedAt`.
- **Phạm vi dữ liệu:** chỉ hiển thị đề xuất trong phạm vi đơn vị/kỳ của chuyên viên (AC-06).
- **Trạng thái rỗng/tải/lỗi:** thông báo "Kỳ chưa có đề xuất nào"; skeleton; banner lỗi + thử lại.

### BO-02 — Chi tiết hồ sơ đề xuất
- Hiển thị toàn bộ: thông tin chung, `proposalDocument` (render theo biểu mẫu kỳ), `ProjectMember`,
  `requestedBudget`/`durationMonths`, `Attachment` (xem/tải), và **lịch sử trạng thái** từ
  `AuditLog` (nộp/trả lại/hủy kèm `reason`, ai, khi nào).
- Nút hành động theo trạng thái & quyền: Tiếp nhận, Trả lại bổ sung, Hủy.

### BO-03 — Tiếp nhận & kiểm tra
- Chuyên viên xem hồ sơ `SUBMITTED`, đối chiếu checklist (đủ trường biểu mẫu, lĩnh vực hợp lệ, tài
  liệu kèm theo). Đánh dấu **đã kiểm tra** (ghi nhận nội bộ, không đổi `status`). Kết quả dẫn
  tới một trong hai hành động: trả lại (BO-04) hoặc đưa vào danh sách chốt (BO-05).

### BO-04 — Trả lại bổ sung
- Áp dụng cho đề xuất `SUBMITTED` khi **kỳ còn hạn** (BR-06). Nhập `reason` (bắt buộc) → xác nhận →
  `SUBMITTED` → `DRAFT`, mở khóa cho chủ nhiệm sửa, gửi thông báo (B04), ghi `AuditLog` → AC-07.
- Nếu kỳ **đã hết hạn**: nút trả lại bị vô hiệu hóa, tooltip "Kỳ đã hết hạn nộp, không thể trả
  lại bổ sung" (AC-08).

### BO-05 — Chốt danh sách xét duyệt
- Chọn nhiều đề xuất `SUBMITTED` hợp lệ trong một kỳ → **Chốt danh sách**. Đánh dấu sẵn sàng đưa vào
  xét duyệt; bàn giao sang **F03** (việc chuyển `SUBMITTED` → `UNDER_REVIEW` & gán hội đồng do F03
  thực hiện) → AC-10. Cảnh báo nếu trong tập chọn có đề xuất chưa kiểm tra/đang còn vấn đề.

## 5. Audit & nhật ký

Ghi `AuditLog` (append-only, data-model §4.7) cho mọi hành động đổi trạng thái/quan trọng:

| Hành động | `action` | Ghi nhận |
|-----------|-----------|----------|
| Nộp đề xuất | `RESEARCH_PROJECT.SUBMIT` | `oldValue/newValue` trạng thái, `projectCode`, `submittedAt`, người nộp |
| Trả lại bổ sung | `RESEARCH_PROJECT.RETURN_FOR_REVISION` | `reason`, trạng thái `SUBMITTED`→`DRAFT`, người thực hiện |
| Chốt danh sách | `RESEARCH_PROJECT.FINALIZE` | danh sách `researchProjectId`, kỳ, người chốt |
| Hủy đề xuất | `RESEARCH_PROJECT.CANCEL` | `reason`, trạng thái, người thực hiện |

- Lịch sử hiển thị tại BO-02. Quyền xem nhật ký: chuyên viên (phạm vi của mình) và quản trị.
- Mọi chuyển trạng thái đi qua domain service `proposal`, không update enum trực tiếp (spec BR-11).

## 6. Liên kết AC

| Màn hình | AC liên quan |
|----------|--------------|
| BO-01 | AC-06 |
| BO-02 | AC-02, AC-07, AC-11 |
| BO-03 | AC-02 |
| BO-04 | AC-07, AC-08 |
| BO-05 | AC-10 |
