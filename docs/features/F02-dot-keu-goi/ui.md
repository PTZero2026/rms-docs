---
title: "Kỳ nhận đề xuất — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-09
---

# Kỳ nhận đề xuất — Giao diện

> Một web app duy nhất; màn hình & hành động hiển thị **theo phân quyền (RBAC)** — xem
> [ADR-0009](../../architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md). Chỉ mô tả phần
> **đặc thù giao diện**. Luật nghiệp vụ → xem `./spec.md`.

## 1. Đối tượng & phân quyền

- **Nhà khoa học** (chủ yếu là **Chủ nhiệm đề tài**, ngoài ra thành viên đề tài cũng có thể tham
  khảo — xem `../../product/personas.md`): xem các kỳ đang mở, mở chi tiết kỳ rồi chuyển sang luồng
  nộp đề xuất (**F01**). Vào từ trang chủ → mục "Kỳ nhận đề xuất". Đây là điểm bắt đầu để khởi tạo
  một đề xuất: nhà khoa học chọn kỳ đang mở rồi chuyển sang luồng nộp đề xuất.
- **Chuyên viên QL KHCN** — vai trò chính: tạo, cấu hình, mở/đóng/hủy kỳ, gia hạn, theo dõi số đề xuất.
- **Quản trị hệ thống** — gián tiếp: cấp quyền `PROPOSAL_CALL.MANAGE` và quản lý danh mục nền
  (B01/B03); xem danh sách/chi tiết kỳ và theo dõi số đề xuất.
- **Thành viên hội đồng** — không thao tác F02 (chỉ tiêu thụ bộ tiêu chí của kỳ qua F03).

Đăng nhập qua SSO. Cùng một web app — mỗi vai trò thấy đúng tập màn hình/hành động theo quyền;
backend là lớp bảo vệ thật.

**Nguyên tắc hiển thị cho nhà khoa học:** chỉ thấy kỳ `status = OPEN` còn trong hạn
(`endDate` ≥ hôm nay) — xem BR-08. Kỳ `DRAFT/CLOSED/CANCELLED` không xuất hiện với nhà khoa học.

### Ma trận phân quyền (Permission matrix)

Quyền nguyên tử theo quy ước `MODULE.ACTION` (data-model §4.1). Backend kiểm tra mọi API;
UI chỉ ẩn/hiện theo quyền (overview §4.1).

| Hành động | Chuyên viên QL KHCN | Quản trị hệ thống | Thành viên hội đồng | Nhà khoa học |
|-----------|:-------------------:|:-----------------:|:-------------------:|:------------:|
| Xem kỳ đang mở (lọc theo BR-08) → nộp đề xuất | – | – | – | ✓ |
| Xem danh sách / chi tiết kỳ (toàn bộ) | ✓ | ✓ | – | – |
| Tạo / sửa kỳ (`DRAFT`) | ✓ | – | – | – |
| Cấu hình lĩnh vực + biểu mẫu + bộ tiêu chí | ✓ | – | – | – |
| Mở kỳ (`DRAFT → OPEN`) | ✓ | – | – | – |
| Đóng kỳ (`OPEN → CLOSED`) | ✓ | – | – | – |
| Hủy kỳ (`→ CANCELLED`) | ✓ | – | – | – |
| Gia hạn `endDate` | ✓ | – | – | – |
| Theo dõi số đề xuất | ✓ | ✓ | – | – |

> Quyền vận hành kỳ gắn với `PROPOSAL_CALL.MANAGE`. Người không có quyền bị từ chối 403 (AC-08).

## 2. Danh sách màn hình

Phân theo nhóm quyền; tất cả nằm trong cùng một web app.

### 2.1 Nhóm người dùng cuối

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| FE-01 | Danh sách kỳ đang mở | Liệt kê các kỳ `OPEN` còn trong hạn để nhà khoa học chọn |
| FE-02 | Chi tiết kỳ nhận đề xuất | Xem thông tin kỳ + nút "Nộp đề xuất" dẫn sang F01 |

### 2.2 Nhóm quản trị

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| BO-01 | Danh sách kỳ nhận đề xuất | Liệt kê mọi kỳ theo trạng thái, lọc/tìm, vào tạo mới |
| BO-02 | Tạo / sửa kỳ | Nhập tên/mã, thời gian, cấu hình lĩnh vực + biểu mẫu + bộ tiêu chí |
| BO-03 | Chi tiết kỳ & vận hành | Mở/đóng/hủy/gia hạn, theo dõi số đề xuất đã nộp |

## 3. Mô tả màn hình & thao tác

Wireframe đặt trong `./assets/` (bổ sung khi có), link Figma nếu có.

### FE-01 — Danh sách kỳ đang mở

- **Bố cục:** danh sách thẻ (card) hoặc bảng, mỗi mục hiển thị `name`, `code`, khoảng `startDate`–`endDate`,
  các `ResearchField` nhận, và nhãn "Còn N ngày" tính từ `endDate`.
- **Bộ lọc (tùy chọn):** theo lĩnh vực; tìm theo tên/mã. Phân trang server-side (overview §4.5).
- **Thao tác:** bấm một mục → mở **FE-02**.
- **Trạng thái:**
  - *Đang tải:* skeleton/placeholder cho danh sách.
  - *Rỗng:* "Hiện chưa có kỳ nhận đề xuất nào đang mở. Vui lòng quay lại sau." (không có kỳ `OPEN` hợp lệ).
  - *Lỗi:* "Không tải được danh sách kỳ nhận đề xuất" + nút "Thử lại".

### FE-02 — Chi tiết kỳ nhận đề xuất

- **Bố cục:** tiêu đề kỳ; khối thông tin gồm `code`, khoảng thời gian nhận, lĩnh vực nhận, mô tả mẫu
  thuyết minh áp dụng; chú thích hạn nộp ("Hạn nộp: dd/MM/yyyy").
- **Thao tác chính — nút "Nộp đề xuất":**
  - Chỉ hiển thị/cho bấm khi kỳ còn `OPEN` và trong hạn.
  - Bấm → điều hướng sang luồng **F01** với `proposalCallId` của kỳ và biểu mẫu thuyết minh được nạp sẵn.
- **Validate phía người dùng:** nếu người dùng mở chi tiết đúng lúc kỳ vừa đóng/hết hạn (đua dữ liệu),
  nút "Nộp đề xuất" bị vô hiệu và hiển thị thông báo "Kỳ đã đóng" (chốt chặn thực sự ở backend — BR-05).
- **Trạng thái:**
  - *Đang tải:* placeholder khối thông tin.
  - *Lỗi/không tồn tại:* "Kỳ nhận đề xuất không tồn tại hoặc đã đóng" + liên kết quay lại FE-01.

> Định dạng ngày `dd/MM/yyyy`, múi giờ Asia/Ho_Chi_Minh (overview §4.4).

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

## 4. Thông báo & trạng thái

| Tình huống | Thông báo |
|---|---|
| Danh sách rỗng (nhà khoa học) | "Hiện chưa có kỳ nhận đề xuất nào đang mở." |
| Lỗi tải danh sách/chi tiết | "Không tải được dữ liệu. Vui lòng thử lại." |
| Kỳ đã đóng khi bấm nộp | "Kỳ nhận đề xuất đã đóng, không thể nộp đề xuất mới." |
| Điều hướng nộp thành công | Chuyển sang màn nộp đề xuất của F01 (thông báo do F01 đảm nhiệm) |

- **Trạng thái rỗng:** danh sách kỳ đang mở trống (FE), chưa có kỳ nào (BO) — đều có thông báo/hướng dẫn.
- **Đang tải:** skeleton/placeholder cho danh sách, khối thông tin, form.
- **Lỗi:** lỗi mạng/máy chủ → banner + "Thử lại"; lỗi nhập liệu → inline cạnh trường.

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
| FE-01 | AC-02 (kỳ `OPEN` hiện với nhà khoa học), AC-04 (kỳ `CLOSED` biến mất khỏi danh sách nhà khoa học) |
| FE-02 | AC-03 (nút "Nộp đề xuất" → F01), AC-04 (kỳ hết hạn không nộp được) |
| BO-01 | AC-01 (kỳ mới xuất hiện danh sách), AC-08 (chặn truy cập trái quyền) |
| BO-02 | AC-01 (tạo `DRAFT`), AC-05 (validate thời gian/mã), AC-06 (khóa cấu hình) |
| BO-03 | AC-02 (mở kỳ), AC-04 (đóng kỳ), AC-06 (gia hạn), AC-07 (chặn hủy), AC-08 (quyền) |
