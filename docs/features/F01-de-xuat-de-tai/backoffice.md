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

- **Chuyên viên QL KHCN:** vai trò chính ở F01 — tiếp nhận, kiểm tra hồ sơ đề xuất theo đợt; trả
  lại bổ sung kèm lý do; chốt danh sách đề xuất hợp lệ để chuyển sang xét duyệt (F03). Phạm vi dữ
  liệu theo đơn vị/đợt được phân công (overview §4.1).
- **Quản trị hệ thống:** chỉ tham chiếu để cấu hình quyền (B03); không thao tác nghiệp vụ F01.

## 2. Phân quyền (Permission matrix)

Quyền nguyên tử dạng `MODULE.HANH_DONG` (data-model §4.1). FE/BO chỉ ẩn/hiện theo quyền; backend
là lớp bảo vệ thật (overview §4.1).

| Hành động | Quyền | Chuyên viên QL KHCN | Quản trị hệ thống | Chủ nhiệm (FE) |
|-----------|-------|:-------------------:|:-----------------:|:-------------:|
| Xem danh sách/chi tiết đề xuất (theo phạm vi) | `DE_TAI.XEM` | ✓ | ✓ | chỉ của mình |
| Tiếp nhận/đánh dấu đã kiểm tra | `DE_TAI.TIEP_NHAN` | ✓ | – | – |
| Trả lại bổ sung (`DA_NOP`→`NHAP`) | `DE_TAI.TRA_LAI` | ✓ | – | – |
| Chốt danh sách sang xét duyệt | `DE_TAI.CHOT` | ✓ | – | – |
| Hủy đề xuất (trước xét duyệt) | `DE_TAI.HUY` | ✓ | – | của mình |
| Tạo/sửa nội dung hồ sơ | — | – | – | ✓ (khi `NHAP`) |

> Việc chuyển `DA_NOP` → `DANG_XET_DUYET` và gán hội đồng thuộc **F03** (`DE_TAI.DUYET` /
> module `review`), không nằm trong F01.

## 3. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| BO-01 | Danh sách đề xuất theo đợt | Lọc/tìm đề xuất của một đợt; theo dõi trạng thái. |
| BO-02 | Chi tiết hồ sơ đề xuất | Xem đầy đủ hồ sơ, thành viên, dự toán, tài liệu, lịch sử. |
| BO-03 | Tiếp nhận & kiểm tra | Đánh dấu đã kiểm tra; checklist hồ sơ. |
| BO-04 | Trả lại bổ sung | Trả về `NHAP` kèm `lyDo` khi còn hạn. |
| BO-05 | Chốt danh sách xét duyệt | Chọn các đề xuất hợp lệ, chốt để chuyển F03. |

## 4. Mô tả màn hình & thao tác

### BO-01 — Danh sách đề xuất theo đợt
- **Bộ lọc:** đợt kêu gọi (mặc định đợt đang chọn), trạng thái (`NHAP`/`DA_NOP`/`HUY`), lĩnh vực,
  đơn vị chủ trì, khoảng `ngayNop`, từ khóa (`maDeTai`/tên/chủ nhiệm).
- **Bảng:** `maDeTai`, tên, chủ nhiệm, lĩnh vực, đơn vị, trạng thái, `ngayNop`, số tài liệu. Phân
  trang server-side (overview §4.5). Sắp xếp theo `ngayNop`.
- **Phạm vi dữ liệu:** chỉ hiển thị đề xuất trong phạm vi đơn vị/đợt của chuyên viên (AC-06).
- **Trạng thái rỗng/tải/lỗi:** thông báo "Đợt chưa có đề xuất nào"; skeleton; banner lỗi + thử lại.

### BO-02 — Chi tiết hồ sơ đề xuất
- Hiển thị toàn bộ: thông tin chung, `thuyetMinh` (render theo biểu mẫu đợt), `ThanhVienDeTai`,
  `kinhPhiDeXuat`/`thoiGianThucHien`, `TaiLieuDinhKem` (xem/tải), và **lịch sử trạng thái** từ
  `NhatKyHeThong` (nộp/trả lại/hủy kèm `lyDo`, ai, khi nào).
- Nút hành động theo trạng thái & quyền: Tiếp nhận, Trả lại bổ sung, Hủy.

### BO-03 — Tiếp nhận & kiểm tra
- Chuyên viên xem hồ sơ `DA_NOP`, đối chiếu checklist (đủ trường biểu mẫu, lĩnh vực hợp lệ, tài
  liệu kèm theo). Đánh dấu **đã kiểm tra** (ghi nhận nội bộ, không đổi `trangThai`). Kết quả dẫn
  tới một trong hai hành động: trả lại (BO-04) hoặc đưa vào danh sách chốt (BO-05).

### BO-04 — Trả lại bổ sung
- Áp dụng cho đề xuất `DA_NOP` khi **đợt còn hạn** (BR-06). Nhập `lyDo` (bắt buộc) → xác nhận →
  `DA_NOP` → `NHAP`, mở khóa cho chủ nhiệm sửa, gửi thông báo (B04), ghi `NhatKyHeThong` → AC-07.
- Nếu đợt **đã hết hạn**: nút trả lại bị vô hiệu hóa, tooltip "Đợt đã hết hạn nộp, không thể trả
  lại bổ sung" (AC-08).

### BO-05 — Chốt danh sách xét duyệt
- Chọn nhiều đề xuất `DA_NOP` hợp lệ trong một đợt → **Chốt danh sách**. Đánh dấu sẵn sàng đưa vào
  xét duyệt; bàn giao sang **F03** (việc chuyển `DA_NOP` → `DANG_XET_DUYET` & gán hội đồng do F03
  thực hiện) → AC-10. Cảnh báo nếu trong tập chọn có đề xuất chưa kiểm tra/đang còn vấn đề.

## 5. Audit & nhật ký

Ghi `NhatKyHeThong` (append-only, data-model §4.7) cho mọi hành động đổi trạng thái/quan trọng:

| Hành động | `hanhDong` | Ghi nhận |
|-----------|-----------|----------|
| Nộp đề xuất | `DE_TAI.NOP` | `giaTriCu/Moi` trạng thái, `maDeTai`, `ngayNop`, người nộp |
| Trả lại bổ sung | `DE_TAI.TRA_LAI` | `lyDo`, trạng thái `DA_NOP`→`NHAP`, người thực hiện |
| Chốt danh sách | `DE_TAI.CHOT` | danh sách `deTaiId`, đợt, người chốt |
| Hủy đề xuất | `DE_TAI.HUY` | `lyDo`, trạng thái, người thực hiện |

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
