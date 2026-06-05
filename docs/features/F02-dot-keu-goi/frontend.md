---
title: "Kỳ nhận đề xuất — Frontend (người dùng)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-01
---

# Kỳ nhận đề xuất — Mặt người dùng cuối

> Chỉ mô tả phần **đặc thù giao diện người dùng**. Luật nghiệp vụ → xem [`spec.md`](./spec.md).

## 1. Đối tượng & ngữ cảnh

- **Đối tượng:** Nhà khoa học — chủ yếu là **Chủ nhiệm đề tài**, ngoài ra thành viên đề tài cũng có
  thể tham khảo (xem `../../product/personas.md`).
- **Ngữ cảnh:** Vào từ trang chủ Portal (FE) → mục "Kỳ nhận đề xuất". Đây là điểm bắt đầu để khởi tạo
  một đề xuất: nhà khoa học chọn kỳ đang mở rồi chuyển sang luồng nộp đề xuất (**F01**).
- **Nguyên tắc hiển thị:** FE chỉ thấy kỳ `status = OPEN` còn trong hạn (`endDate` ≥ hôm nay) —
  xem BR-08. Kỳ `DRAFT/CLOSED/CANCELLED` không xuất hiện trên FE.

## 2. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| FE-01 | Danh sách kỳ đang mở | Liệt kê các kỳ `OPEN` còn trong hạn để nhà khoa học chọn |
| FE-02 | Chi tiết kỳ nhận đề xuất | Xem thông tin kỳ + nút "Nộp đề xuất" dẫn sang F01 |

## 3. Mô tả màn hình & thao tác

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

## 4. Thông báo & trạng thái

| Tình huống | Thông báo cho người dùng |
|---|---|
| Danh sách rỗng | "Hiện chưa có kỳ nhận đề xuất nào đang mở." |
| Lỗi tải danh sách/chi tiết | "Không tải được dữ liệu. Vui lòng thử lại." |
| Kỳ đã đóng khi bấm nộp | "Kỳ nhận đề xuất đã đóng, không thể nộp đề xuất mới." |
| Điều hướng nộp thành công | Chuyển sang màn nộp đề xuất của F01 (thông báo do F01 đảm nhiệm) |

## 5. Liên kết AC

| Màn hình | AC liên quan (xem `spec.md` §6) |
|----------|----------------------------------|
| FE-01 | AC-02 (kỳ `OPEN` hiện trên FE), AC-04 (kỳ `CLOSED` biến mất khỏi FE) |
| FE-02 | AC-03 (nút "Nộp đề xuất" → F01), AC-04 (kỳ hết hạn không nộp được) |
