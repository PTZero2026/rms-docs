---
story: US-24
feature: F05
review_id: RV-24
status: Draft
updated: 2026-11-21
---

# Hợp đồng hành vi · US-24

**Điểm gọi.** Dịch vụ dùng chung và điểm gọi của module sở hữu. Module `budget` sở hữu thao tác “Quyết toán và đóng hồ sơ”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/budget/close-project.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Hồ sơ PASSED, người quyết toán, chế độ đối soát của đơn vị, kết quả rà thủ công hoặc trạng thái đối soát của từng khoản |
| Kết quả thành công | Hồ sơ COMPLETED, sổ bị khóa, nhật ký quyết toán |
| Điều kiện từ chối / kết quả phụ | chủ nhiệm → từ chối, đề tài giữ nguyên |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Điều kiện khóa sổ theo RV-24 | Pilot chưa bật đối soát dùng kết quả rà thủ công. Khi đã bật, mọi khoản phải `MATCHED`. Nếu còn `UNRECONCILED` hoặc `MISMATCHED`, giữ `PASSED` và liệt kê từng khoản vướng. |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị hồ sơ COMPLETED, sổ bị khóa, nhật ký quyết toán; hiển thị riêng tình huống chủ nhiệm và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
