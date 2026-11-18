---
story: US-02
feature: B01
review_id: RV-02
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-02

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `SysConfiguration.tenantId` | Giá trị thuộc tenant ghi đè khóa chung cùng tên, khóa chung tiếp tục phục vụ tenant khác. | [B01](../../docs/features/B01-danh-muc-cau-hinh/spec.md) |

SysConfiguration xác định bởi tenant và key. Bản dùng chung có tenantId rỗng. Bản riêng che bản chung khi đọc tại cùng tenant.

Đối tượng nguồn và liên kết nghiệp vụ: Khóa cấu hình, nội dung mới, trường đang quản trị. Khung nhìn hoặc kết quả ghi: Giá trị đọc hiệu lực tại A và giá trị chung tại B. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi lưu giá trị riêng với dữ liệu hợp lệ: đọc tại A nhận giá trị mới. Nhánh tenant B chỉ có giá trị chung: nhận đúng giá trị chung. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-02](../review-decisions.md#rv-02) điều chỉnh phép kiểm liên quan đến `SysConfiguration.tenantId`.
