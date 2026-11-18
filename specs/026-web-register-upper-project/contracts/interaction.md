---
story: US-26
feature: F09
review_id: RV-26
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-26

**Điểm gọi.** Web RMS theo quyền của người thực hiện. Module `upper-project` sở hữu thao tác “Theo dõi đầu mục nhiệm vụ cấp trên”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/upper-project/register-upper-project.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Cấp nhiệm vụ, cơ quan quản lý, đơn vị thực hiện và tệp căn cứ |
| Kết quả thành công | Đầu mục tra được theo cấp và thông tin chứng cứ cần bổ sung |
| Điều kiện từ chối / kết quả phụ | thiếu tệp bắt buộc ở bước duyệt → chặn và chỉ rõ chứng cứ thiếu |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Đầu mục cấp Bộ có tệp sai loại so với quy tắc DECISION → chuyên viên duyệt → nêu đúng loại quyết định phải bổ sung |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị đầu mục tra được theo cấp và thông tin chứng cứ cần bổ sung; hiển thị riêng tình huống thiếu tệp bắt buộc ở bước duyệt và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
