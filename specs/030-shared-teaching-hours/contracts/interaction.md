---
story: US-30
feature: P03
review_id: RV-30
status: Draft
updated: 2026-11-21
---

# Hợp đồng hành vi · US-30

**Điểm gọi.** Dịch vụ dùng chung và điểm gọi của module sở hữu. Module `teaching-hour` sở hữu thao tác “Ghi giờ giảng từ một sự kiện hợp lệ”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/teaching-hour/teaching-hours.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Sự kiện hợp lệ, ngày nguồn, công thức hiệu lực và phân bổ |
| Kết quả thành công | Dòng giờ theo giảng viên/kỳ và căn cứ tính |
| Điều kiện từ chối / kết quả phụ | cùng sự kiện → không phát sinh dòng giờ trùng |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Quyết định RV-30 | Dùng định mức có hiệu lực vào ngày nghiệp vụ của hoạt động nguồn. Khi nhận lại cùng sự kiện đã ghi, giữ nguyên số giờ, kỳ và phân bổ ban đầu. Người có quyền sửa sai bằng bản ghi điều chỉnh có lý do và ghi nhật ký. |

Dùng khóa sự kiện để nhận lại an toàn, chỉ xác nhận xử lý sau khi lưu kết quả. Theo dõi đầu ra từ điểm đọc của sổ giờ P03 và lý lịch F08. [Spec và nguồn](../spec.md).
