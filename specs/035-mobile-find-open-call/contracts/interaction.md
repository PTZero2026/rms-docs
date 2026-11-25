---
id: US-35
feature: F02
epic: E1
channel: mobile
review_id: RV-40
status: Draft
updated: 2026-11-22
---

# Giao tiếp của call

Truy vấn các kỳ trong phạm vi phiên, lọc theo thời gian hiệu lực rồi theo từ khóa. Mở chi tiết bằng id, kiểm quyền tại nguồn và kiểm lại điều kiện tiếp nhận trước khi lập đề xuất.

**Dữ liệu và điều kiện biên.** ProposalCall có id bất biến, code, title, status, start, due và tham chiếu biểu mẫu. Phần tra cứu chỉ chiếu thông tin. Điều kiện tiếp nhận dùng cùng ngày nghiệp vụ với F01.

**Đầu ra quan sát được.** Tìm một kỳ theo mã và đọc đúng hạn trên màn hình 320 px mà không cuộn ngang.

Khi có backend, dùng hợp đồng của module `call` tại `packages/api-contracts` và sinh kiểu cho client. Bản v0 thực hành giao tiếp này trên dữ liệu mẫu. [Ca đối chứng](../quickstart.md).
