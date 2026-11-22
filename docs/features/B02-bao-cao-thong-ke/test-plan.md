---
title: "Báo cáo kỳ — kiểm thử"
spec: "./spec.md"
owner: "QA nghiệp vụ"
status: Review
updated: 2026-11-21
---

# Nghiệm thu báo cáo kỳ

Dựng kỳ K có ba mã A1, A2 (khoa A) và B1 (khoa B). A1 đã nộp hai lần, A2 còn mã và đang ở Nháp sau khi bị trả. A3 là nhãn dữ liệu thử cho nháp chưa từng nộp, chưa có mã. Trưởng phòng thấy cả hai khoa, chuyên viên chỉ thấy A.

| Ca | AC | Thao tác | Đối chứng |
|---|---|---|---|
| TC-01 | AC-01 | Trưởng phòng chọn K, mở từng nhóm và cộng số dòng. | Tổng 3. A1, A2, B1 mỗi mã đúng một dòng, A2 thuộc nhóm Nháp, vắng A3. |
| TC-02 | AC-02 | Chuyên viên lọc cả B, thử truy cập trực tiếp bản xuất. | Chỉ A1, A2, tổng 2. Nếu thu quyền A ngay trước tải, tệp cũ không được cấp. |
| TC-03 | AC-03 | Tạo báo cáo, sau đó nộp lại A2. Mở chi tiết, xuất tệp từ bản chụp ban đầu rồi tạo báo cáo mới. Giữ nguyên quyền. | Bản đầu và tệp cùng tổng 3, mỗi mã A1, A2, B1 một dòng, A2 ở nhóm Nháp, vắng A3. Báo cáo mới vẫn tổng 3, A2 sang nhóm Đã nộp. Chi tiết và tệp đầu ghi cùng thời điểm trích xuất. |

Trưởng phòng ký danh sách đối chứng, QA lưu thời điểm và phạm vi ở mỗi ca. [Quy tắc đếm đã chốt](spec.md)
