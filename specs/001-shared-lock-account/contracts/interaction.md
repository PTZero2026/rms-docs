---
story: US-01
feature: B03
review_id: RV-01
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-01

**Điểm gọi.** Dịch vụ dùng chung và điểm gọi của module sở hữu. Module `iam` sở hữu thao tác “Khóa tài khoản của người rời đơn vị”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/iam/lock-account.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Tài khoản đích và xác nhận khóa |
| Kết quả thành công | Trạng thái truy cập và sự kiện ACCOUNT_LOCKED |
| Điều kiện từ chối / kết quả phụ | người chỉ có quyền xem → backend từ chối, tài khoản giữ nguyên |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Người vừa bị khóa còn một phiên mở → tải lại hồ sơ → bị từ chối, dữ liệu lịch sử còn nguyên |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị trạng thái truy cập và sự kiện ACCOUNT_LOCKED; hiển thị riêng tình huống người chỉ có quyền xem và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
