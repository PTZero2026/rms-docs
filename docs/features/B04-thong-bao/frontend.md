---
title: "Thông báo — Frontend (người dùng)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-01
---

# Thông báo — Mặt người dùng cuối

> Chỉ mô tả phần **đặc thù giao diện người dùng**. Luật nghiệp vụ → xem [`spec.md`](./spec.md).

## 1. Đối tượng & ngữ cảnh

**Mọi người dùng FE** (chủ nhiệm đề tài, thành viên đề tài) — xem `../../product/personas.md`. Thông báo
cũng hiển thị cho người dùng BO (chuyên viên, hội đồng) qua cùng thành phần in-app, nhưng phần quản trị
mẫu/nhật ký nằm ở [`backoffice.md`](./backoffice.md).

Điểm vào:

- **Chuông thông báo** ở thanh điều hướng (mọi trang) — hiển thị số chưa đọc (badge), bấm mở dropdown nhanh.
- **Trung tâm thông báo** (trang đầy đủ) — vào từ dropdown ("Xem tất cả") hoặc menu tài khoản.
- **Tùy chọn nhận thông báo** — trong trang Cài đặt cá nhân.
- **Deep-link**: bấm một thông báo điều hướng tới đối tượng nguồn qua `ThongBao.lienKet` (đề tài, báo cáo…).

## 2. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| FE-01 | Chuông & dropdown thông báo | Xem nhanh thông báo mới, số chưa đọc, mở nhanh đối tượng nguồn |
| FE-02 | Trung tâm thông báo | Danh sách đầy đủ, lọc, phân trang, đánh dấu đã đọc (đơn lẻ/tất cả) |
| FE-03 | Chi tiết / điều hướng từ thông báo | Mở nội dung và điều hướng tới đối tượng nguồn; tự đánh dấu đã đọc |
| FE-04 | Tùy chọn nhận thông báo | Bật/tắt EMAIL/SMS theo nhóm sự kiện (trong giới hạn luật) |

## 3. Mô tả màn hình & thao tác

> Wireframe/ảnh (nếu có) đặt trong [`assets/`](./assets/); link Figma khi sẵn sàng.

### FE-01 — Chuông & dropdown thông báo

- **Vị trí:** icon chuông trên thanh điều hướng, có **badge số chưa đọc** (IN_APP, `trangThai != DA_DOC`).
  Badge hiển thị tối đa "99+".
- **Dropdown:** danh sách rút gọn 5–10 thông báo mới nhất, mỗi dòng gồm: icon theo `loaiSuKien`, tiêu đề,
  thời gian tương đối ("2 giờ trước"), chấm đậm nếu chưa đọc.
- **Thao tác:** bấm một dòng → điều hướng theo `lienKet` và đánh dấu dòng đó `DA_DOC`; link "Xem tất cả" → FE-02;
  nút "Đánh dấu tất cả đã đọc" (xác nhận nhẹ).
- **Trạng thái:**
  - *Tải:* skeleton 3–5 dòng.
  - *Rỗng:* "Bạn chưa có thông báo nào." kèm icon.
  - *Lỗi tải:* "Không tải được thông báo." + nút "Thử lại" (không chặn các phần khác của trang).

### FE-02 — Trung tâm thông báo

- **Danh sách:** phân trang server-side (NFR < 2s, xem `overview.md` §4.5), mỗi mục: tiêu đề, trích nội dung,
  `loaiSuKien` (nhãn dễ đọc), thời gian, trạng thái đọc.
- **Bộ lọc:** theo **trạng thái đọc** (Tất cả / Chưa đọc / Đã đọc), theo **nhóm sự kiện** (đề xuất, xét duyệt,
  tiến độ, kinh phí, nghiệm thu, sản phẩm), theo **khoảng thời gian**. Lọc giữ trên URL để chia sẻ/refresh.
- **Thao tác:** mở một mục (→ FE-03, đánh dấu đã đọc), **đánh dấu đã đọc đơn lẻ**, **đánh dấu tất cả đã đọc**.
  Lưu ý: chỉ tác động bản ghi IN_APP của chính người dùng (BR-09, BR-10 trong spec).
- **Trạng thái:**
  - *Tải:* skeleton danh sách.
  - *Rỗng (không có dữ liệu):* "Chưa có thông báo."
  - *Rỗng do lọc:* "Không có thông báo khớp bộ lọc." + nút "Xóa bộ lọc".
  - *Lỗi:* thông báo lỗi inline + "Thử lại"; giữ bộ lọc hiện tại.

### FE-03 — Chi tiết / điều hướng từ thông báo

- Mở từ FE-01/FE-02. Hiển thị tiêu đề + nội dung đầy đủ (đã render từ mẫu), thời gian, nút điều hướng tới
  đối tượng nguồn (`lienKet`).
- **Tự động đánh dấu `DA_DOC`** khi mở (nếu đang chưa đọc).
- **Trạng thái lỗi:** nếu `lienKet` trỏ tới đối tượng người dùng không còn quyền xem → hiển thị nội dung
  thông báo nhưng nút điều hướng báo "Bạn không còn quyền truy cập mục này." (không lỗi cứng).

### FE-04 — Tùy chọn nhận thông báo

- **Bố cục:** bảng theo **nhóm sự kiện** × **kênh** (EMAIL, SMS), mỗi ô là công tắc bật/tắt. IN_APP **luôn bật**,
  hiển thị mờ/khóa (BR-01).
- **Ràng buộc UI (theo spec):**
  - Nhóm sự kiện **bắt buộc** (BR-08): công tắc EMAIL bị khóa ở trạng thái bật, có chú thích "Bắt buộc nhận".
  - Kênh SMS chỉ hiện công tắc cho nhóm có sự kiện **ưu tiên cao** (BR-03); nhóm còn lại hiển thị "—".
  - Người chưa có `soDienThoai` (B03): công tắc SMS hiển thị gợi ý "Cập nhật số điện thoại để nhận SMS".
- **Thao tác:** đổi công tắc → lưu (tự lưu hoặc nút "Lưu thay đổi"), hiển thị toast xác nhận.
- **Trạng thái:** *Tải* skeleton; *Lỗi lưu* giữ nguyên giá trị cũ + toast lỗi + cho thử lại.

## 4. Thông báo & trạng thái

| Tình huống | Hiển thị cho người dùng |
|---|---|
| Đánh dấu đã đọc thành công | Cập nhật badge/đếm tức thì (optimistic), không cần toast. |
| Đánh dấu tất cả đã đọc | Toast "Đã đánh dấu tất cả là đã đọc." |
| Lưu tùy chọn thành công | Toast "Đã lưu tùy chọn nhận thông báo." |
| Lỗi tải danh sách/đếm | Inline "Không tải được thông báo." + "Thử lại". |
| Lỗi lưu tùy chọn | Toast lỗi + rollback giá trị công tắc. |
| Cố tắt nhóm bắt buộc | Tooltip "Nhóm thông báo này bắt buộc nhận, không thể tắt." |

## 5. Liên kết AC

| Màn hình | AC liên quan (xem [`spec.md`](./spec.md) §6) |
|---|---|
| FE-01 Chuông & dropdown | AC-01 (hiển thị IN_APP), AC-06 (đếm/đã đọc) |
| FE-02 Trung tâm thông báo | AC-01, AC-06 (lọc, đánh dấu tất cả đã đọc) |
| FE-03 Chi tiết / điều hướng | AC-01 (deep-link), AC-06 (tự đánh dấu đã đọc) |
| FE-04 Tùy chọn nhận | AC-02 (tôn trọng tắt EMAIL), AC-03 (SMS chỉ sự kiện cao), AC-09 (không tắt nhóm bắt buộc) |
