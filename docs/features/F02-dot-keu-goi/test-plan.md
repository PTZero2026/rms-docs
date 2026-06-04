---
title: "Đợt kêu gọi đề xuất — Test plan"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-01
---

# Đợt kêu gọi đề xuất — Kế hoạch kiểm thử

> Mỗi test case bám vào một AC trong [`spec.md`](./spec.md). Không có AC tương ứng = thiếu yêu cầu, báo lại BA/PO.

## 1. Phạm vi kiểm thử

- **Mặt test:** BO (tạo/sửa/vận hành đợt), FE (danh sách & chi tiết đợt cho nhà khoa học), API (quyền,
  ràng buộc trạng thái, validate), job đóng đợt tự động.
- **Môi trường:** môi trường staging với SSO giả lập; múi giờ Asia/Ho_Chi_Minh.
- **Dữ liệu mẫu:**
  - Tài khoản: 1 chuyên viên QL KHCN (có `PROPOSAL_CALL.MANAGE`), 1 nhà khoa học, 1 thành viên hội đồng.
  - Danh mục B01 `ACTIVE`: ≥2 `ResearchField`, 1 biểu mẫu thuyết minh, 1 bộ tiêu chí xét duyệt.
  - Đợt mẫu: `KG-2026-01` (`OPEN`, trong hạn, chưa có đề xuất), `KG-2026-02` (`OPEN`, đã có 1 đề tài `SUBMITTED`),
    `KG-2026-03` (`OPEN`, `endDate` = hôm qua), `KG-2026-09` (`DRAFT`, cấu hình đủ).

## 2. Test cases

| ID    | Liên kết AC | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Loại |
|-------|-------------|----------------|----------------|------------------|------|
| TC-01 | AC-01 | Đăng nhập chuyên viên | BO-02: nhập `code=KG-2026-10`, `name`, `startDate≤endDate` hợp lệ → Lưu | Đợt lưu ở `DRAFT`, hiện trong BO-01 | Happy |
| TC-02 | AC-02 | Đợt `KG-2026-09` (`DRAFT`) cấu hình đủ, danh mục `ACTIVE` | BO-03: bấm "Mở đợt" | Đợt chuyển `OPEN`, ghi nhật ký; xuất hiện trên FE-01 | Happy |
| TC-03 | AC-02 / BR-03 | Đợt `DRAFT` thiếu `reviewCriteriaSetId` | BO-03: bấm "Mở đợt" | Bị chặn, thông báo thiếu cấu hình bắt buộc, đợt vẫn `DRAFT` | Biên/Lỗi |
| TC-04 | AC-02 / BR-04 | Đợt `DRAFT` trỏ tới `ResearchField` đã bị đặt `INACTIVE` ở B01 | BO-03: bấm "Mở đợt" | Bị chặn, thông báo danh mục không còn hiệu lực | Biên/Lỗi |
| TC-05 | AC-03 | Nhà khoa học đăng nhập; đợt `KG-2026-01` `OPEN` trong hạn | FE-01 → FE-02 → bấm "Nộp đề xuất" | Điều hướng sang F01 với `proposalCallId` đúng và biểu mẫu nạp sẵn | Happy |
| TC-06 | AC-04 | Đợt `KG-2026-03` `OPEN`, `endDate` = hôm qua | Chạy job đóng đợt (hoặc đóng thủ công) | Đợt chuyển `CLOSED`, biến mất khỏi FE-01, ghi nhật ký | Biên |
| TC-07 | AC-04 / BR-05 | Đợt vừa `CLOSED` ở TC-06 | Gọi API nộp đề xuất (F01) vào đợt này | Bị từ chối, không tạo đề tài mới | Biên/Lỗi |
| TC-08 | AC-05 / BR-01 | Đăng nhập chuyên viên | BO-02: nhập `endDate` < `startDate` → Lưu | Bị từ chối, lỗi inline "Đến ngày phải ≥ Từ ngày", không lưu | Biên/Lỗi |
| TC-09 | AC-05 / BR-02 | Đã tồn tại đợt `code=KG-2026-01` | BO-02: tạo đợt mới `code=KG-2026-01` → Lưu | Bị từ chối, lỗi "Mã đợt đã tồn tại", không lưu | Biên/Lỗi |
| TC-10 | AC-06 / BR-06 | Đợt `KG-2026-02` `OPEN` đã có 1 đề tài `SUBMITTED` | BO-02 (sửa): thử đổi `researchFieldIds`/`proposalTemplateId`/`startDate` | Các trường bị vô hiệu/chặn, không lưu được thay đổi đó | Biên/Lỗi |
| TC-11 | AC-06 / BR-06 | Đợt `KG-2026-02` như trên | BO-03: gia hạn `endDate` về tương lai → Lưu | Cho phép, chỉ `endDate` đổi, ghi nhật ký | Happy |
| TC-12 | AC-07 / BR-07 | Đợt `KG-2026-02` đã có đề tài `SUBMITTED` | BO-03: bấm "Hủy đợt" | Bị chặn, thông báo phải "Đóng" thay vì "Hủy"; trạng thái không đổi | Biên/Lỗi |
| TC-13 | AC-07 / BR-07 | Đợt `KG-2026-01` `OPEN` chưa có đề xuất | BO-03: bấm "Hủy đợt", nhập `reason` | Đợt chuyển `CANCELLED`, ghi nhật ký kèm `reason`, ẩn khỏi FE | Happy |
| TC-14 | AC-08 | Đăng nhập nhà khoa học (không có `PROPOSAL_CALL.MANAGE`) | Gọi API tạo/mở/đóng/hủy đợt | Trả 403, dữ liệu không đổi | Negative/Quyền |
| TC-15 | AC-08 | Đăng nhập thành viên hội đồng | Mở URL màn hình BO-02/BO-03 trực tiếp | Không vào được/ẩn hành động; API từ chối 403 | Negative/Quyền |
| TC-16 | AC-02 / BR-08 | Không có đợt nào `OPEN` hợp lệ | FE-01: tải danh sách | Hiển thị trạng thái rỗng "Chưa có đợt kêu gọi nào đang mở" | Biên |

## 3. Trường hợp biên & negative

- **Dữ liệu rỗng:** FE-01 không có đợt `OPEN` (TC-16); BO-01 chưa có đợt nào.
- **Quá hạn / đua dữ liệu:** đợt hết hạn đúng lúc nhà khoa học bấm "Nộp đề xuất" → nút vô hiệu phía
  FE và backend từ chối (TC-06/TC-07).
- **Trùng:** `code` đợt trùng (TC-09).
- **Khoảng thời gian sai:** `endDate < startDate` (TC-08); `endDate` quá khứ khi mở.
- **Tham chiếu danh mục mất hiệu lực:** `ResearchField`/biểu mẫu/bộ tiêu chí bị `INACTIVE` sau khi cấu hình (TC-04).
- **Khóa cấu hình:** sửa trường bị khóa khi đợt đã có đề xuất (TC-10); hủy đợt đã có đề xuất (TC-12).
- **Sai quyền:** truy cập API/màn hình quản trị không đủ quyền (TC-14, TC-15).
- **Mở lại đợt đã đóng:** `CLOSED → OPEN` chỉ khi gia hạn `endDate` hợp lệ (mở rộng từ TC-11).

## 4. Checklist hồi quy

- **F01 — Đề xuất đề tài:** nộp đề xuất chỉ thành công khi đợt `OPEN` trong hạn; biểu mẫu thuyết minh
  nạp đúng theo đợt; đợt `CLOSED`/`CANCELLED` từ chối nộp.
- **F03 — Xét duyệt:** bộ tiêu chí dùng để chấm khớp `reviewCriteriaSetId` của đợt (không lệch sau gia hạn).
- **B01 — Danh mục:** đặt `INACTIVE` lĩnh vực/biểu mẫu/bộ tiêu chí không phá vỡ đợt đã mở (ràng buộc tham chiếu).
- **B03 — Phân quyền:** thay đổi quyền `PROPOSAL_CALL.MANAGE` phản ánh đúng ở ẩn/hiện hành động BO.
- **Audit:** mọi chuyển trạng thái đợt (mở/đóng/hủy/gia hạn) đều sinh bản ghi `AuditLog`.
- **Job đóng đợt:** chạy đúng theo cuối ngày `endDate` múi giờ Asia/Ho_Chi_Minh, không lệch ngày.
