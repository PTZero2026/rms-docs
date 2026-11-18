---
title: "Báo cáo kỳ — kiểm thử"
spec: "./spec.md"
owner: "QA nghiệp vụ"
status: Review
updated: 2026-11-18
---

# Nghiệm thu báo cáo kỳ

Dựng kỳ K với A1, A2 ở khoa A và B1 ở khoa B. A1 từng nộp lại, A3 là nháp chưa cấp mã. Trưởng phòng thấy cả hai khoa, chuyên viên chỉ thấy A.

| Ca | AC | Thao tác | Đối chứng |
|---|---|---|---|
| TC-01 | AC-01 | Trưởng phòng chọn K, mở từng nhóm và cộng số dòng. | Tổng 3, A1 đúng một lần, vắng A3. A1 bị trả về nháp vẫn thuộc nhóm trạng thái tương ứng. |
| TC-02 | AC-02 | Chuyên viên lọc cả B, thử truy cập trực tiếp bản xuất. | Chỉ A1, A2, tổng 2. Nếu thu quyền A ngay trước tải, tệp cũ không được cấp. |
| TC-03 | AC-03 | Tạo bản báo cáo, chuyển bước A2, mở lại chi tiết và xuất, sau đó tạo bản mới. | Chi tiết và tệp đầu giữ nhóm cũ. Chỉ bản mới hiển thị A2 ở nhóm mới. |

Trưởng phòng ký danh sách đối chứng, QA lưu thời điểm và phạm vi ở mỗi ca. [Quy tắc đề xuất](spec.md)
