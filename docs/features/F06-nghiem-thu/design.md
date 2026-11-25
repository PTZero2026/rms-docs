---
title: "Thiết kế F06 · acceptance"
owner: "SA / BE"
status: Review
updated: 2026-11-24
---

# Nghiệm thu · thiết kế triển khai

| Business rules | Tiêu chí | Cách hiện thực |
|---|---|---|
| BR-01, BR-02 | AC-01, AC-02, AC-07 | Kiểm kỳ cuối, số sản phẩm APPROVED theo từng loại và đúng đề tài. Gọi P01 khi đủ. Mở vòng với committee, criteria và meeting loại ACCEPTANCE. |
| BR-12 | AC-12 | Chuyên viên ghi lý do và phiên bản để mở lại vòng nghiệm thu. Chụp quyết định cũ trước khi gọi P01 trên cạnh của mẫu đã ghim. Khi hồ sơ đã qua bước kế tiếp hoặc mẫu thiếu cạnh, lưu yêu cầu đính chính và gửi B04 đến chủ quy trình. |
| BR-03, BR-04, BR-05, BR-06, BR-07, BR-11, BR-12 | AC-03, AC-06, AC-08, AC-09, AC-11, AC-12 | Dùng chung kiểu phiếu với F03. Unique thành viên/vòng. Kiểm scope, xung đột, điểm tối đa và trạng thái ngay khi gửi. Chỉ tính SUBMITTED của chính vòng nghiệm thu đang mở. |
| BR-08, BR-09, BR-10 | AC-04, AC-05, AC-10 | Chốt theo ngưỡng qua P01. Nếu FAILED, lần làm lại cần lý do, hạn và lượt còn lại. Nếu PASSED, chuyển việc cho F05/US-24. Chặn thiếu phiếu hoặc tài chính giữ nguyên trạng thái và audit cũ. |

Module `acceptance` kiểm tenant và phạm vi ở máy chủ. Hợp đồng API thuộc `packages/api-contracts/acceptance/`. N01 tạo workspace, T002 của từng lát định nghĩa operation và sinh type. [Đặc tả](spec.md) · [Ca kiểm](test-plan.md)

Các phiếu giao việc gồm [US-22](../../../specs/022-web-request-acceptance/tasks.md), [US-23](../../../specs/023-shared-acceptance-result/tasks.md).
