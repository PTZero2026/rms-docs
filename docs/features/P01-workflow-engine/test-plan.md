---
title: "Kiểm thử workflow theo tenant"
spec: "./spec.md"
owner: "QA nền tảng / SA"
status: Review
updated: 2026-11-21
---

# P01 · Workflow đề tài

Chạy bằng API và PostgreSQL thật với hai graph v1/v2, admin A, người đủ quyền, người chỉ xem và runtime role. Ghi step, version, statusSemantic, history, audit và outbox trước/sau mỗi lệnh. [Tiêu chí nguồn](spec.md)

| Ca | AC | Thao tác trên fixture | Kết quả phải đối chiếu |
|---|---|---|---|
| TC-01 | AC-01 | Gửi trường trạng thái trong thao tác sửa đề tài rồi đọc lại | Bị từ chối, bước và version giữ nguyên. Chuyển bằng domain service với transition hợp lệ thành công |
| TC-02 | AC-02 | Lắp bước duyệt nhanh từ catalog ở A, chạy đề tài qua từng cạnh. B dùng graph gốc | A chạy đúng thứ tự, mỗi bước ứng với semantic chuẩn. B giữ graph riêng |
| TC-03 | AC-03 | Để X chờ duyệt ở v1, kích hoạt v2 với bước kế tiếp khác rồi tạo Y. Cho hai hồ sơ chuyển qua bước duyệt và đi tới kết thúc | X đi theo nhánh v1, Y theo nhánh v2. Đối chiếu bước thực tế và phiên bản gắn với từng hồ sơ đến khi hoàn tất |
| TC-04 | AC-04 | Người chỉ xem gọi transition yêu cầu quyền duyệt | Bị chặn tại backend, bước, audit chuyển bước và outbox giữ nguyên |
| TC-05 | AC-05 | Lần lượt kích hoạt graph thiếu semantic và graph có cạnh tới step vắng | Mỗi lần trả lỗi chỉ vị trí, active version trước đó còn hiệu lực |
| TC-06 | AC-06 | Gửi hai lần chuyển cùng version. Dùng runtime role yêu cầu sửa/xóa history và audit | Một lần đổi, đúng một history và một audit cùng actor. Các yêu cầu sửa/xóa bị từ chối |
| TC-07 | AC-07 | Chọn cạnh yêu cầu lý do, gửi lần đầu bỏ trống rồi gửi kèm lý do | Lần đầu chặn. Lần hai thành công và lý do truy vết được |
| TC-08 | AC-08 | Nộp thiếu trường khiến guard fail, sau đó bổ sung đầy đủ rồi nộp lại | Lần đầu giữ bước và chưa phát effect. Lần hai effect xuất hiện sau commit và chỉ gắn với lệnh thành công |

Kiểm thêm lỗi ghi ở giữa transaction bằng [ca tích hợp INT-11](../integration-test-plan.md). Dùng [US-03](../../../specs/003-shared-workflow-version/quickstart.md) để xác minh hành vi nhìn từ phía người dùng.
