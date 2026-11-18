---
story: US-17
feature: F04
review_id: RV-17
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-17

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị kỳ chờ nộp của đề tài đang làm và đề tài tạm dừng. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | đang thực hiện, kỳ quá hạn | nộp | ghi nhận thời điểm, thể hiện trễ, chuyển chờ duyệt |
| TC-02 / AC-02 | đề tài tạm dừng | nộp cùng loại báo cáo | chặn và giữ trạng thái kỳ |
| TC-03 / AC-03 | Báo cáo đến đúng hạn trong khi đề tài đang thực hiện | chủ nhiệm nộp đủ tệp | ghi nhận đúng hạn và chuyển chờ duyệt |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-03, AC-08, AC-09 trong [F04](../../docs/features/F04-quan-ly-tien-do/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Thử ngay tại hạn và sau hạn một giây trên đề tài đang làm, sau đó thử cùng dữ liệu khi SUSPENDED.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Chủ nhiệm và chuyên viên tiến độ. [RV-17](../review-decisions.md#rv-17).
