---
id: US-35
feature: F02
epic: E1
channel: mobile
review_id: RV-40
status: Draft
updated: 2026-11-24
---

# Mô hình đọc của US-35

ProposalCall có id bất biến, code, title, status, start, due và tham chiếu biểu mẫu. Phần tra cứu chỉ chiếu thông tin. Điều kiện tiếp nhận dùng cùng ngày nghiệp vụ với F01.

Truy vấn các kỳ trong phạm vi phiên, lọc theo thời gian hiệu lực rồi theo từ khóa. Mở chi tiết bằng id, kiểm quyền tại nguồn và kiểm lại điều kiện tiếp nhận trước khi lập đề xuất.

Phân vùng theo tenant của phiên. So sánh thời điểm theo giờ Việt Nam và lưu timestamp UTC. [Mô hình RMS](../../docs/architecture/data-model.md) · [F02](../../docs/features/F02-dot-keu-goi/spec.md).

ProposalCall.id là khóa đích bất biến. ProposalCall.startDate và ProposalCall.endDate là ngày nghiệp vụ, bao gồm hai đầu. ProposalCall.status phải là OPEN trong Đang nhận.
