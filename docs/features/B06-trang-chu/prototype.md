---
title: "Prototype — Trang chủ (Dashboard cá nhân) theo vai trò"
spec: "./spec.md"
ui: "./ui.md"
owner: "BA/Designer"
status: Draft
updated: 2026-06-26
---

# Prototype — Trang chủ (Dashboard cá nhân) theo vai trò

> Bản nháp lo-fi để hình dung bố cục trang chủ **sau đăng nhập** cho từng vai trò, bám theo bộ widget chuẩn
> (VP-HOME) đề xuất ở [`ui.md` §3](./ui.md). Mọi mục là **read-only / điều hướng** (spec BR-02).
>
> **Xem trực quan:** mở [`assets/prototype-fe.html`](./assets/prototype-fe.html) trên trình duyệt — có **nút
> chuyển vai trò** ở góc phải để xem bố cục từng vai trò. Tenant minh hoạ: **ĐH Thủy Lợi** (E4 bật).

## 1. Khung chung (mọi vai trò)

```text
+----------------------------------------------------------------------------------+
| RMS   Hệ thống QLNCKH        [ Chủ nhiệm | Thành viên | Chuyên viên | HĐ | QTHT ] |  ← đổi vai trò
+----------------------------------------------------------------------------------+
| W-CTX  Chào <tên> · Vai trò: <…> · <Trường/Viện> · [phạm vi]      [nhắc hồ sơ?]   |
+----------------------------------------------------------------------------------+
|  …các widget "việc cần làm" + "số liệu nhanh" theo vai trò…                       |
|  W-NOTIF (5 thông báo gần nhất → B04)        W-SHORTCUTS (lối tắt theo quyền)      |
+----------------------------------------------------------------------------------+
```

> Khung trang là **một**; chỉ tập widget & bố cục đổi theo vai trò (BR-01, BR-04, BR-05). Widget chỉ hiện khi
> người dùng có quyền xem feature nguồn và feature đang bật cho tenant.

## 2. Bố cục theo vai trò

### 2.1 Chủ nhiệm / Thư ký đề tài (FE)

```text
W-CTX  (+ nhắc hoàn thiện hồ sơ F08)
W-TODO-PROPOSAL          Đề xuất bị trả lại bổ sung / nháp chưa nộp        → F01
W-TODO-PROGRESS          Báo cáo tiến độ của tôi sắp/quá hạn               → F04
W-TODO-ACCEPTANCE        Đề tài tới hạn / chuẩn bị nghiệm thu              → F06
[ W-KPI-MYPROJECTS · W-KPI-OVERDUE · (W-E4-TEACHING nếu bật) ]
W-NOTIF (5)              W-SHORTCUTS: Nộp đề xuất · Kỳ đang mở · Sản phẩm · Hồ sơ
```

### 2.2 Thành viên đề tài (FE)

```text
W-CTX
[ W-KPI-MYPROJECTS (đề tài tham gia) · W-KPI-OUTPUTS ]
W-NOTIF (5)              W-SHORTCUTS: Đề tài của tôi · Hồ sơ của tôi
```
> Thành viên thường **ít "việc cần làm" bắt buộc** — minh hoạ trạng thái ít việc (gần với BR-09).

### 2.3 Chuyên viên QL KHCN (BO)

```text
W-CTX  (+ phạm vi dữ liệu: đơn vị phụ trách)
W-TODO-INTAKE            Đề xuất chờ tiếp nhận / kiểm tra                  → F01
W-TODO-PROGRESS-REVIEW   Báo cáo tiến độ chờ duyệt                         → F04
W-TODO-OUTPUT-REVIEW     Sản phẩm khoa học chờ duyệt                       → F07
W-TODO-BUDGET            Đối soát kinh phí chênh lệch chờ xử lý            → F05
[ W-KPI-QUEUE · W-KPI-OVERDUE · W-KPI-PORTFOLIO(→B02) ]
W-NOTIF (5)              W-SHORTCUTS: Mở kỳ nhận đề xuất · Báo cáo B02 · DS đề tài
```

### 2.4 Thành viên hội đồng (BO)

```text
W-CTX
W-TODO-REVIEW            Phiếu chấm chờ điền (xét duyệt + nghiệm thu)       → F03/F06
[ W-KPI-ASSIGNMENTS (đợt đánh giá được phân công) ]
W-NOTIF (5)              W-SHORTCUTS: Đợt đánh giá của tôi · Phiên nghiệm thu
```

### 2.5 Quản trị hệ thống (BO)

```text
W-CTX
W-ADMIN                  Lối tắt: Danh mục (B01) · Người dùng (B03) · Cấu hình trang chủ (HOME-11)
W-NOTIF (5)              W-SHORTCUTS: Danh mục · Người dùng & quyền
```
> Bố cục tối giản — admin làm việc chính ở BackOffice cấu hình.

## 3. Lưu ý đọc prototype

- **Read-only:** không có nút tạo/sửa/duyệt trên trang chủ; mỗi dòng/lối tắt **điều hướng** sang feature
  nguồn (spec BR-02, AC-05).
- **Số liệu nhanh ≠ báo cáo:** thẻ KPI chỉ là con số đếm trong phạm vi người dùng, có **mốc cập nhật**
  (BR-10) và link "xem chi tiết" sang **B02** (BR-06).
- **Ẩn theo tenant:** thẻ `W-E4-*` (giờ giảng, đề tài SV…) chỉ hiện khi tenant bật E4 (BR-04, AC-08).
- **Phạm vi dữ liệu:** số liệu/việc của Chuyên viên/Hội đồng đã lọc theo phạm vi, kiểm ở backend (BR-01).
- Dữ liệu trong prototype là **minh hoạ**; con số/định dạng ngày (`dd/MM/yyyy`) chỉ để hình dung.

## 4. Câu hỏi cần chốt tiếp

1. Bộ widget & thứ tự mỗi vai trò ở §2 đã hợp lý chưa? (đầu vào để chốt **VP-HOME** vào `ui.md`).
2. Có tách bố cục **Thư ký đề tài** khác **Chủ nhiệm** không, hay dùng chung như hiện tại?
3. Số thẻ KPI tối đa hiển thị mặc định mỗi vai trò (tránh quá tải) — gợi ý 2–3.
4. Vai trò **Quản trị hệ thống** có cần thêm thẻ "tình trạng hệ thống" (job lỗi, hàng đợi B04) không, hay để
   ở màn riêng của B04/vận hành?
</content>
