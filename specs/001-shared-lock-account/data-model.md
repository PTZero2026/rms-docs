---
story: US-01
feature: B03
review_id: RV-01
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-01

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `User.isActive` | Giá trị false vô hiệu hóa quyền nghiệp vụ của người dùng trong tenant. | [B03](../../docs/features/B03-quan-ly-nguoi-dung/spec.md) |

User gắn với vai trò tại tenant và các phiên còn hoạt động. Khóa tài khoản giữ nguyên lịch sử làm việc, tư cách tác giả và phiếu đã nộp.

Đối tượng nguồn và liên kết nghiệp vụ: Tài khoản đích và xác nhận khóa. Khung nhìn hoặc kết quả ghi: Trạng thái truy cập và sự kiện ACCOUNT_LOCKED. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi gửi lệnh với dữ liệu hợp lệ: tài khoản chuyển sang bị khóa và ghi audit. Nhánh người chỉ có quyền xem: backend từ chối, tài khoản giữ nguyên. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-01](../review-decisions.md#rv-01) điều chỉnh phép kiểm liên quan đến `User.isActive`.
