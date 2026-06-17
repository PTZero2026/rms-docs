---
title: "Quản lý kinh phí — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-17
---

# Quản lý kinh phí — Giao diện

> Một web app duy nhất; màn hình & hành động hiển thị **theo phân quyền (RBAC)** — xem
> [ADR-0009](../../architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md). Chỉ mô tả phần
> **đặc thù giao diện**. Luật nghiệp vụ → xem `./spec.md`.
>
> Bản đơn giản (giai đoạn này): **cấu hình phí quản lý cấp tổ chức**, xác nhận **tổng kinh phí được cấp**
> (tách **phí quản lý** & **kinh phí thực hiện**), **tạo khoản chi + chứng từ**, **xem khoản chi**,
> **quyết toán & đóng đề tài**. Khoản mục/dự toán, nhiều đợt cấp và đối soát thuộc giai đoạn sau
> (xem `./spec.md` §2).

## 1. Đối tượng & phân quyền

- **Chủ nhiệm đề tài** (nhà khoa học): xem kinh phí được cấp của **đề tài mình** (tổng cấp – đã chi –
  còn lại), **tạo/sửa/xóa khoản chi** và **đính kèm chứng từ**. **Không** xác nhận cấp kinh phí, **không**
  quyết toán (BR-04). Vào từ "Đề tài của tôi" → đề tài `IN_PROGRESS`/`SUSPENDED`/`PASSED` → tab **Kinh phí**.
- **Chuyên viên QL KHCN:** **xác nhận tổng kinh phí được cấp** cho đề tài, **xem danh sách khoản chi +
  chứng từ** của các đề tài, **quyết toán & đóng đề tài**. Không tạo khoản chi thay chủ nhiệm.
- **Quản trị hệ thống:** xem; **cấu hình phí quản lý cấp tổ chức** (tỷ lệ phẳng + trần tùy chọn, BR-10).
  Các tham số kinh phí khác qua B01 (giai đoạn sau).

Đăng nhập qua SSO. Cùng một web app — mỗi vai trò thấy đúng tập màn hình/hành động theo quyền; backend
là lớp bảo vệ thật.

### Ma trận phân quyền (Permission matrix)

Quyền nguyên tử dạng `MODULE.ACTION`. UI chỉ ẩn/hiện theo quyền.

| Hành động | Quyền | Chuyên viên QL KHCN | Quản trị hệ thống | Chủ nhiệm |
|-----------|-------|:-------------------:|:-----------------:|:---------:|
| Xem kinh phí đề tài | `BUDGET.VIEW` | ✓ | ✓ | chỉ của mình |
| Xác nhận cấp kinh phí (kèm override phí quản lý) | `BUDGET.ALLOCATE` | ✓ | – | – |
| Tạo/sửa/xóa khoản chi + đính chứng từ | `BUDGET.EXPENSE` | – | – | ✓ (đề tài của mình) |
| Quyết toán & đóng đề tài | `BUDGET.SETTLE` | ✓ | – | – |
| Cấu hình phí quản lý cấp tổ chức | `BUDGET.CONFIG` | – | ✓ | – |

## 2. Danh sách màn hình

Phân theo nhóm quyền; tất cả nằm trong cùng một web app.

### 2.1 Nhóm người dùng cuối (Chủ nhiệm)

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| FE-01 | Tổng quan kinh phí đề tài | Tổng được cấp – tổng đã chi – còn lại; cảnh báo khi vượt |
| FE-02 | Khoản chi & chứng từ | Danh sách khoản chi của đề tài; tạo/sửa/xóa khoản chi, đính chứng từ |

### 2.2 Nhóm quản trị (Chuyên viên)

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| BO-01 | Xác nhận cấp kinh phí | Xác nhận tổng kinh phí được cấp; tách phí quản lý & kinh phí thực hiện, cho override |
| BO-02 | Danh sách khoản chi | Xem khoản chi + chứng từ của các đề tài; lọc theo đề tài/kỳ |
| BO-03 | Quyết toán & đóng đề tài | Rà soát, quyết toán, chuyển `PASSED → COMPLETED` |

### 2.3 Nhóm cấu hình (Quản trị hệ thống)

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| SY-01 | Cấu hình phí quản lý | Đặt tỷ lệ phẳng (%) + trần tùy chọn (VND) cấp tổ chức (BR-10) |

## 3. Mô tả màn hình & thao tác

Wireframe đặt trong `./assets/` (bổ sung khi có), link Figma nếu có.

### FE-01 — Tổng quan kinh phí đề tài
- Thẻ tổng: **kinh phí được cấp**, **phí quản lý (trường giữ)**, **kinh phí thực hiện** (= cấp − phí quản lý),
  **tổng đã chi**, **còn lại** (định dạng VND).
- Khi chưa xác nhận cấp: hiển thị "Chưa xác nhận cấp kinh phí" và tham chiếu `approvedBudget` từ F04 (chỉ đọc).
- Khi tổng đã chi vượt **kinh phí thực hiện**: hiển thị **cảnh báo vượt kinh phí** rõ ràng (BR-03), vẫn cho ghi.
- Chỉ đọc; mọi số liệu lấy từ backend (không tự tính ở frontend để tránh lệch).
- **Trạng thái rỗng:** chưa có khoản chi → "Chưa có khoản chi nào." **Đang tải:** skeleton. **Lỗi:** thử lại.

### FE-02 — Khoản chi & chứng từ
- Bảng `BudgetTransaction` (khoản chi): `date`, `description`, `amount`, số chứng từ đính kèm.
- Hành động (chỉ đề tài của mình, khi đề tài `IN_PROGRESS`): **Thêm khoản chi**, **Sửa**, **Xóa**.
- Form khoản chi: `amount` (validate số nguyên VND > 0, BR-02), `description`, `date`, vùng **đính chứng từ**
  (kéo-thả/chọn file, một hoặc nhiều `Attachment`, BR-05).
- Giao dịch thuộc đề tài `COMPLETED` ở chế độ **khóa, chỉ đọc** (BR-06).

### BO-01 — Xác nhận cấp kinh phí
- Chỉ thao tác khi đề tài `IN_PROGRESS` (BR-01); hiển thị `ProjectAssignment.approvedBudget` từ F04.
- Nhập/giữ tổng kinh phí được cấp (mặc định = `approvedBudget`, validate số nguyên VND > 0 và **không vượt**
  `approvedBudget`, BR-08).
- **Phí quản lý:** hệ thống tự tính `managementFeeAmount = min(floor(cấp × tỷ lệ), trần)` theo cấu hình tổ chức
  (SY-01) và hiển thị **kinh phí thực hiện** = cấp − phí quản lý. Cho phép chuyên viên **override** số phí quản lý
  (validate `0 ≤ phí quản lý ≤ tổng cấp`, BR-10); nếu override khác mặc định, ghi audit.
- Nút **Xác nhận cấp kinh phí** → ghi nhận tổng cấp + phí quản lý, thông báo chủ nhiệm (B04), ghi audit.
- Sau khi xác nhận, hiển thị người xác nhận & thời điểm; điều chỉnh (nếu cho phép) phải ghi audit.

### BO-02 — Danh sách khoản chi
- Bảng khoản chi toàn bộ đề tài trong phạm vi: `đề tài`, `date`, `description`, `amount`, chứng từ ([Xem file]).
- Bộ lọc: đề tài, kỳ/ngày, có/không chứng từ.
- Thẻ tổng theo đề tài: tổng được cấp – phí quản lý – kinh phí thực hiện – tổng đã chi – còn lại. Chỉ đọc
  (chuyên viên không sửa khoản chi).

### BO-03 — Quyết toán & đóng đề tài
- Chỉ bật khi đề tài `PASSED` (BR-07). Hiển thị tổng được cấp – phí quản lý – kinh phí thực hiện – tổng đã chi –
  còn lại và danh sách khoản chi để chuyên viên **rà soát thủ công** (bản đơn giản không có điều kiện chặn tự động).
- Nút **Quyết toán & đóng đề tài** → chuyển `PASSED → COMPLETED` (domain service, phối hợp F06), khóa kinh phí,
  thông báo chủ nhiệm (B04), ghi audit.

### SY-01 — Cấu hình phí quản lý
- Chỉ **Quản trị hệ thống** (`BUDGET.CONFIG`). Đặt **tỷ lệ phẳng** `managementFeeRate` (%, ≥ 0) và **trần tùy
  chọn** `managementFeeCap` (số nguyên VND, để trống = không giới hạn), áp dụng chung toàn tổ chức (BR-10).
- Hiển thị người sửa & thời điểm gần nhất; lưu thay đổi ghi audit.
- **Không hồi tố:** đổi cấu hình chỉ áp cho lần xác nhận cấp kinh phí **sau đó**; đề tài đã xác nhận giữ nguyên.

## 4. Thông báo & trạng thái

| Tình huống | Thông báo |
|---|---|
| Đã xác nhận cấp kinh phí | "Đã xác nhận cấp kinh phí cho đề tài." (B04) |
| Lưu khoản chi / đính chứng từ thành công | "Đã lưu khoản chi và chứng từ." |
| Khoản chi làm vượt kinh phí thực hiện | "Cảnh báo: tổng chi đã vượt kinh phí thực hiện (sau phí quản lý)." (vẫn lưu) |
| Đề tài được quyết toán & đóng | "Đề tài đã được quyết toán và hoàn thành." |
| Lưu cấu hình phí quản lý thành công | "Đã cập nhật cấu hình phí quản lý." |
| Chủ nhiệm cố xác nhận cấp/quyết toán | (Ẩn nút) — không khả dụng với chủ nhiệm |

## 5. Audit & nhật ký

Ghi `AuditLog` cho: xác nhận/điều chỉnh cấp kinh phí, **override phí quản lý theo đề tài**, **thay đổi cấu
hình phí quản lý cấp tổ chức**, tạo/sửa/xóa khoản chi, đính/gỡ chứng từ, quyết toán & đóng đề tài (BR-09).
Append-only, xem được theo phạm vi dữ liệu.

## 6. Liên kết AC

| Màn hình | AC liên quan (spec) |
|---|---|
| FE-01 | AC-03 (xem tổng quan kinh phí), AC-04 (cảnh báo vượt kinh phí thực hiện), AC-08 (chỉ thấy đề tài của mình) |
| FE-02 | AC-02 (tạo khoản chi + chứng từ), AC-06 (số tiền không hợp lệ), AC-09 (chặn khi chưa/không còn thực hiện) |
| BO-01 | AC-01 (xác nhận cấp + tách phí quản lý), AC-06 (số tiền không hợp lệ), AC-10 (override phí quản lý), AC-11 (phí quản lý ngoài khoảng) |
| BO-02 | AC-03 (xem khoản chi + chứng từ) |
| BO-03 | AC-05 (quyết toán & đóng đề tài) |
| SY-01 | AC-12 (chỉ quản trị sửa cấu hình phí quản lý) |
| (RBAC chung) | AC-07 (chủ nhiệm không xác nhận cấp/quyết toán), AC-08 (sai phạm vi dữ liệu) |
