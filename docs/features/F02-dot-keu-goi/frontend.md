---
title: "Đợt kêu gọi đề xuất — Frontend (người dùng)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-01
---

# Đợt kêu gọi đề xuất — Mặt người dùng cuối

> Chỉ mô tả phần **đặc thù giao diện người dùng**. Luật nghiệp vụ → xem [`spec.md`](./spec.md).

## 1. Đối tượng & ngữ cảnh

- **Đối tượng:** Nhà khoa học — chủ yếu là **Chủ nhiệm đề tài**, ngoài ra thành viên đề tài cũng có
  thể tham khảo (xem `../../product/personas.md`).
- **Ngữ cảnh:** Vào từ trang chủ Portal (FE) → mục "Đợt kêu gọi". Đây là điểm bắt đầu để khởi tạo
  một đề xuất: nhà khoa học chọn đợt đang mở rồi chuyển sang luồng nộp đề xuất (**F01**).
- **Nguyên tắc hiển thị:** FE chỉ thấy đợt `status = OPEN` còn trong hạn (`endDate` ≥ hôm nay) —
  xem BR-08. Đợt `DRAFT/CLOSED/CANCELLED` không xuất hiện trên FE.

## 2. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| FE-01 | Danh sách đợt đang mở | Liệt kê các đợt `OPEN` còn trong hạn để nhà khoa học chọn |
| FE-02 | Chi tiết đợt kêu gọi | Xem thông tin đợt + nút "Nộp đề xuất" dẫn sang F01 |

## 3. Mô tả màn hình & thao tác

### FE-01 — Danh sách đợt đang mở

- **Bố cục:** danh sách thẻ (card) hoặc bảng, mỗi mục hiển thị `name`, `code`, khoảng `startDate`–`endDate`,
  các `ResearchField` nhận, và nhãn "Còn N ngày" tính từ `endDate`.
- **Bộ lọc (tùy chọn):** theo lĩnh vực; tìm theo tên/mã. Phân trang server-side (overview §4.5).
- **Thao tác:** bấm một mục → mở **FE-02**.
- **Trạng thái:**
  - *Đang tải:* skeleton/placeholder cho danh sách.
  - *Rỗng:* "Hiện chưa có đợt kêu gọi nào đang mở. Vui lòng quay lại sau." (không có đợt `OPEN` hợp lệ).
  - *Lỗi:* "Không tải được danh sách đợt kêu gọi" + nút "Thử lại".

### FE-02 — Chi tiết đợt kêu gọi

- **Bố cục:** tiêu đề đợt; khối thông tin gồm `code`, khoảng thời gian nhận, lĩnh vực nhận, mô tả mẫu
  thuyết minh áp dụng; chú thích hạn nộp ("Hạn nộp: dd/MM/yyyy").
- **Thao tác chính — nút "Nộp đề xuất":**
  - Chỉ hiển thị/cho bấm khi đợt còn `OPEN` và trong hạn.
  - Bấm → điều hướng sang luồng **F01** với `proposalCallId` của đợt và biểu mẫu thuyết minh được nạp sẵn.
- **Validate phía người dùng:** nếu người dùng mở chi tiết đúng lúc đợt vừa đóng/hết hạn (đua dữ liệu),
  nút "Nộp đề xuất" bị vô hiệu và hiển thị thông báo "Đợt đã đóng" (chốt chặn thực sự ở backend — BR-05).
- **Trạng thái:**
  - *Đang tải:* placeholder khối thông tin.
  - *Lỗi/không tồn tại:* "Đợt kêu gọi không tồn tại hoặc đã đóng" + liên kết quay lại FE-01.

> Định dạng ngày `dd/MM/yyyy`, múi giờ Asia/Ho_Chi_Minh (overview §4.4).

## 4. Thông báo & trạng thái

| Tình huống | Thông báo cho người dùng |
|---|---|
| Danh sách rỗng | "Hiện chưa có đợt kêu gọi nào đang mở." |
| Lỗi tải danh sách/chi tiết | "Không tải được dữ liệu. Vui lòng thử lại." |
| Đợt đã đóng khi bấm nộp | "Đợt kêu gọi đã đóng, không thể nộp đề xuất mới." |
| Điều hướng nộp thành công | Chuyển sang màn nộp đề xuất của F01 (thông báo do F01 đảm nhiệm) |

## 5. Liên kết AC

| Màn hình | AC liên quan (xem `spec.md` §6) |
|----------|----------------------------------|
| FE-01 | AC-02 (đợt `OPEN` hiện trên FE), AC-04 (đợt `CLOSED` biến mất khỏi FE) |
| FE-02 | AC-03 (nút "Nộp đề xuất" → F01), AC-04 (đợt hết hạn không nộp được) |
