---
title: "Thiết kế F03 · review"
owner: "SA / BE"
status: Review
updated: 2026-11-24
---

# Xét duyệt hội đồng · thiết kế triển khai

| Business rules | Tiêu chí | Cách hiện thực |
|---|---|---|
| BR-01, BR-02 | AC-01 | Khóa hồ sơ, giữ một vòng mở theo đề tài, loại và lần xét. Ghi committee, CriteriaSet đã ghim và chuyển qua P01 trong cùng giao dịch. Biên bản gắn meeting của đúng hội đồng. |
| BR-10 | AC-10 | Chuyên viên ghi lý do và phiên bản để mở lại vòng xét duyệt. Chụp quyết định cũ trước khi gọi P01 trên cạnh của mẫu đã ghim. Khi hồ sơ đã qua bước kế tiếp hoặc mẫu thiếu cạnh, lưu yêu cầu đính chính và gửi B04 đến chủ quy trình. |
| BR-03, BR-04, BR-05, BR-06 | AC-02, AC-06, AC-07, AC-08 | Unique thành viên/vòng. Kiểm lại phân công và xung đột với ProjectMember khi gửi phiếu. Validate điểm từng tiêu chí rồi tính tổng trọng số tại server. |
| BR-07, BR-08, BR-09, BR-10, BR-11 | AC-03, AC-04, AC-05, AC-09, AC-10, AC-11 | Chỉ chuyên viên có scope chốt vòng. Tính trung bình phiếu hợp lệ, lưu ngưỡng, kết luận khoa học và quyết định đạo đức riêng. Áp RV-11 trước hiệu ứng phê duyệt. Khóa phiếu sau chốt. Bản xem nhận xét cho chủ nhiệm lọc theo PUBLIC_COMMENTS và ẩn người chấm. |

Module `review` kiểm tenant và phạm vi ở máy chủ. Hợp đồng API thuộc `packages/api-contracts/review/`. N01 tạo workspace, T002 của từng lát định nghĩa operation và sinh type. [Đặc tả](spec.md) · [Ca kiểm](test-plan.md)

Các phiếu giao việc gồm [US-09](../../../specs/009-web-open-review/tasks.md), [US-10](../../../specs/010-web-submit-score/tasks.md), [US-11](../../../specs/011-shared-review-decision/tasks.md).

| Truy vết | Cách hiện thực |
|---|---|
| AC-12 | Gắn Meeting vào hội đồng và hồ sơ của vòng, gắn biên bản có version qua Attachment. Kiểm phân công thư ký và scope trên cả thao tác ghi và cấp quyền tải. |
