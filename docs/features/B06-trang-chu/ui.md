---
title: "Trang chủ (Dashboard cá nhân) — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "BA/Designer"
status: Draft
updated: 2026-06-26
---

# Trang chủ (Dashboard cá nhân) — Giao diện

> Một web app duy nhất; màn hình & widget hiển thị **theo phân quyền (RBAC)** — xem
> [ADR-0009](../../architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md). Chỉ mô tả phần **đặc thù
> giao diện**. Luật nghiệp vụ → xem [`./spec.md`](./spec.md).

## 1. Đối tượng & phân quyền

**Mọi người dùng đã đăng nhập** đều có trang chủ — đây là màn hình đích sau đăng nhập (landing). Nội dung
(widget, việc cần làm, lối tắt) khác nhau theo **vai trò** và **phạm vi dữ liệu**, nhưng khung trang là một.
Khách **chưa đăng nhập** không thuộc B06 (xem Cổng công khai — `epics/README.md`).

### Ma trận phân quyền (Permission matrix)

Quyền nguyên tử dạng `MODULE.ACTION` (data-model §4.1). B06 **chỉ đọc & điều hướng** — không có hành động
tạo/sửa/duyệt (spec BR-02). Mỗi widget chỉ hiển thị khi người dùng có quyền **xem** ở feature nguồn tương ứng.

| Hành động | Quyền | Người dùng đã đăng nhập | Quản trị tenant |
|-----------|-------|:-----------------------:|:---------------:|
| Xem trang chủ của mình | `HOME.VIEW` | ✓ | ✓ |
| Hiển thị từng widget | quyền **xem** của feature nguồn (vd `PROGRESS.VIEW`, `REVIEW.VIEW`…) | theo quyền | theo quyền |
| Cấu hình tập widget & bố cục theo vai trò (per-tenant) | `HOME.CONFIG` | – | ✓ |

> Widget không chỉ ẩn theo quyền mà còn **lọc theo phạm vi dữ liệu** (data scoping) và theo **feature đang
> bật cho tenant** (VP-FEAT) — spec BR-01, BR-04. UI ẩn/hiện **không** thay cho kiểm tra ở backend.

## 2. Danh sách màn hình

### 2.1 Nhóm người dùng cuối (mọi vai trò sau đăng nhập)

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| HOME-01 | Trang chủ (Dashboard cá nhân) | Màn hình đích sau đăng nhập: ngữ cảnh + việc cần làm + số liệu nhanh + thông báo + lối tắt |
| HOME-02 | Trạng thái rỗng | Hiển thị khi không có việc/số liệu: thông điệp + lối tắt khởi đầu theo vai trò (spec BR-09) |

### 2.2 Nhóm quản trị

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| HOME-11 | Cấu hình trang chủ theo vai trò (per-tenant) | Quản trị tenant chọn **tập widget** và **bố cục mặc định** cho từng vai trò (VP-HOME, spec BR-05) |

## 3. Mô tả màn hình & thao tác

### HOME-01 — Trang chủ (Dashboard cá nhân)

Bố cục dạng **lưới widget** (cards), thứ tự & tập thẻ theo vai trò + cấu hình tenant. Các khối:

1. **Khối ngữ cảnh (header cá nhân):** lời chào + họ tên, **vai trò hiện hành**, **trường/viện** (tenant).
   Nếu hồ sơ (F08) thiếu trường bắt buộc → dải nhắc nhẹ "Hoàn thiện hồ sơ" + link tới F08.
2. **Khối "Việc cần làm của tôi":** danh sách đề mục hành động, mỗi dòng gồm nhãn việc, đối tượng (mã đề
   tài/đề xuất…), **mốc hạn** (nếu có, định dạng `dd/MM/yyyy`), và **chỉ báo trễ hạn**. Mỗi dòng là một
   **deep-link** sang feature nguồn. Sắp xếp ưu tiên việc trễ hạn/sắp hạn lên đầu.
3. **Khối số liệu nhanh (counters):** các thẻ đếm theo phạm vi người dùng; mỗi thẻ có **mốc cập nhật** (khi
   lấy từ cache — spec BR-10) và link "xem chi tiết" → **B02** (không phân tích tại chỗ — spec BR-06).
4. **Khối thông báo gần đây:** **5** thông báo IN_APP mới nhất của chính người dùng (N=5 — đã chốt), mỗi
   dòng có deep-link; nút "Xem tất cả" → trung tâm thông báo **B04** (spec BR-07).
5. **Khối lối tắt:** nút đi nhanh tới tác vụ thường dùng của vai trò; chỉ hiện nút mà người dùng có quyền.

**Tập widget gợi ý theo vai trò** (đầu vào cho VP-HOME — danh sách chuẩn chờ PO/BA chốt, spec §7):

| Vai trò | Việc cần làm tiêu biểu | Số liệu nhanh | Lối tắt |
|---|---|---|---|
| Chủ nhiệm / Thư ký đề tài | Đề xuất bị trả lại bổ sung; báo cáo tiến độ sắp/quá hạn; chuẩn bị nghiệm thu | Đề tài của tôi đang thực hiện; báo cáo quá hạn | Nộp đề xuất (F01); xem kỳ đang mở (F02) |
| Thành viên đề tài | Đề tài mới được mời tham gia | Đề tài tôi tham gia | Xem đề tài (F01/F04) |
| Chuyên viên QL KHCN | Đề xuất chờ tiếp nhận; báo cáo chờ duyệt; điều phối nghiệm thu | Hồ sơ chờ xử lý theo phạm vi; đề tài quá hạn | Mở kỳ nhận đề xuất (F02); xem báo cáo (B02) |
| Thành viên hội đồng | Phiếu chấm chờ điền (xét duyệt/nghiệm thu) | Đợt đánh giá được phân công | Vào đợt đánh giá (F03/F06) |
| Quản trị hệ thống | (cấu hình) | — | Quản lý danh mục (B01); người dùng (B03) |

> Tenant **tắt E4** → ẩn các widget liên quan (giờ giảng P03, đề tài sinh viên F10…) — spec BR-04, AC-08.

**Trạng thái khối:**
- *Đang tải:* mỗi widget tải bất đồng bộ, hiển thị skeleton riêng (trang không chờ widget chậm nhất).
- *Rỗng:* xem HOME-02.
- *Lỗi một widget:* hiển thị lỗi cục bộ trong thẻ đó, **không** làm hỏng cả trang.

### HOME-02 — Trạng thái rỗng

Khi không có việc/số liệu: thông điệp thân thiện + **lối tắt khởi đầu theo vai trò** (vd chủ nhiệm → "Xem kỳ
nhận đề xuất đang mở"; chuyên viên → "Mở kỳ nhận đề xuất"). Không hiển thị màn hình trống (spec BR-09, AC-10).

### HOME-11 — Cấu hình trang chủ theo vai trò (per-tenant)

Dành cho **Quản trị tenant** (`HOME.CONFIG`). Chọn, với từng **vai trò**: **widget nào hiển thị** (từ bộ
widget chuẩn) và **thứ tự/bố cục mặc định**. Không tạo widget tuỳ biến mới (spec BR-05, VP-HOME). Lưu cấu
hình áp cho mọi người dùng vai trò đó trong tenant.

## 4. Thông báo & trạng thái

- B06 không có thông báo "lưu thành công" cho người dùng cuối (không sửa nghiệp vụ).
- HOME-11: lưu cấu hình widget hiển thị toast "Đã lưu cấu hình trang chủ".
- Widget lỗi tải: "Không tải được mục này, thử lại" (lỗi cục bộ trong thẻ).

## 5. Audit & nhật ký

- Mở/tải trang chủ (HOME-01/02) là hành động **chỉ-đọc**, **không** ghi `AuditLog` nghiệp vụ (spec BR-08, AC-11).
- **HOME-11 — cấu hình trang chủ theo vai trò** (đổi cấu hình tenant) **ghi `AuditLog`**: ai, khi nào, vai
  trò nào, trước/sau. Chỉ Quản trị tenant trong phạm vi xem được.

## 6. Liên kết AC

| Màn hình / Khối | AC liên quan (`spec.md`) |
|---|---|
| HOME-01 — landing sau đăng nhập | AC-01 |
| HOME-01 — cá nhân hoá theo vai trò | AC-02 |
| HOME-01 — lọc theo phạm vi dữ liệu | AC-03 |
| HOME-01 — khối việc cần làm (statusSemantic) | AC-04 |
| HOME-01 — bấm đề mục → điều hướng (chỉ đọc) | AC-05 |
| HOME-01 — số liệu nhanh → B02 | AC-06 |
| HOME-01 — khối thông báo → B04 | AC-07 |
| HOME-01 — ẩn widget feature tắt của tenant | AC-08 |
| HOME-11 — bố cục per-tenant theo vai trò | AC-09 |
| HOME-02 — trạng thái rỗng | AC-10 |
| HOME-01 — không ghi audit khi mở | AC-11 |
| HOME-01 — số liệu cache nêu mốc | AC-12 |
</content>
