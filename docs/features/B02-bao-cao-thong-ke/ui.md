---
title: "Báo cáo kỳ — giao diện"
spec: "./spec.md"
owner: "BA/UX"
status: Review
updated: 2026-11-25
---

# Xem và đối chiếu số liệu một kỳ

| Màn hình | Người thao tác | Hành vi và tiêu chí |
|---|---|---|
| B02-01 · Chọn kỳ, đơn vị | Trưởng phòng, chuyên viên có quyền báo cáo | Gợi ý đơn vị trong quyền. Kỳ rỗng hiện 0 cùng thời điểm trích xuất. AC-01, AC-02 |
| B02-02 · Tổng và danh sách | Người có quyền xem | Bấm một trạng thái để xem các mã đã đếm tại cùng thời điểm, giữ bộ lọc khi quay về. AC-01, AC-03 |
| B02-03 · Xuất đối chứng | Người có quyền xuất trong phạm vi kỳ | Ghi thời điểm và phạm vi trên tệp. Khi mất quyền, dừng và yêu cầu tạo lại. AC-02, AC-03 |

Phòng KHCN chọn tên cột và định dạng sau khi thử với mẫu thực. Nhấn một dòng điều hướng tới feature sở hữu để đọc hồ sơ theo quyền tại thời điểm mở. [Nguồn nghiệp vụ](spec.md)

**B02-02.** Người dùng có thể sao chép liên kết ở **Mã bản chụp**. Khi quay lại từ một đề tài hoặc tải lại liên kết, màn hình đọc lại bản chụp, kỳ và nhóm tại thời điểm trích xuất. Người tạo báo cáo thấy dữ liệu khi còn đủ quyền. [Hướng dẫn đối chiếu](../../guides/nguoi-dung/truong-phong-bao-cao-ky.md)
