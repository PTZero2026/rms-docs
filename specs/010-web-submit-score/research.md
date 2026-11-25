---
story: US-10
feature: F03
review_id: RV-10
status: Draft
updated: 2026-11-24
---

# Căn cứ và quyết định · US-10

**Vấn đề.** Nếu phát hiện xung đột sau khi người chấm mở nháp thì sao?

**Quyết định triển khai.** Kiểm lại phân công và quan hệ với đề tài ngay lúc gửi.

**Lý do.** Trong trường hợp người đã mở nháp vừa được bổ sung vào nhóm đề tài, người dùng cần thấy kết quả “phiếu không được tính và người đó mất quyền chấm”. Phương án khác: Chỉ kiểm quyền khi phát phiếu. Dùng TC-03 để phân biệt hai phương án. [RV-10](../review-decisions.md#rv-10)

**Tài liệu đối chiếu.** [F03](../../docs/features/F03-xet-duyet-hoi-dong/spec.md) — AC-02, AC-06, AC-07. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-02 (Happy — chấm & gửi phiếu)** — Given thành viên hội đồng được phân công, không xung đột lợi ích, đợt đang `COLLECTING_SCORES`; When thành viên nhập đủ điểm cho mọi tiêu chí (mỗi điểm trong `[0, maxScore]`) kèm nhận xét rồi gửi phiếu; Then `ScoreSheet` chuyển `DRAFT → SUBMITTED`, hệ thống tính `totalScore` theo trọng số và khóa phiếu không cho sửa.

- **AC-06 (Negative — xung đột lợi ích)** — Given thành viên hội đồng đồng thời là chủ nhiệm/thành viên của đề tài; When thành viên mở hàng chờ chấm; Then đề tài đó không xuất hiện và mọi cố gắng tạo `ScoreSheet` cho đề tài đó bị từ chối (BR-03).

- **AC-07 (Negative — điểm vượt maxScore)** — Given thành viên nhập một `score > maxScore` của tiêu chí; When gửi phiếu; Then hệ thống báo lỗi validate, không cho gửi, phiếu giữ `DRAFT` (BR-05).

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [test-plan.md](../../docs/features/F03-xet-duyet-hoi-dong/test-plan.md) · [ui.md](../../docs/features/F03-xet-duyet-hoi-dong/ui.md)
