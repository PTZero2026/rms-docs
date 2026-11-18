---
story: US-15
feature: F04
review_id: RV-15
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-15

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị một đề tài đang thực hiện và một mã kỳ. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | chưa có kỳ | tạo kỳ và hạn | xuất hiện đúng một báo cáo chờ nộp |
| TC-02 / AC-02 | đã có cùng kỳ trên đề tài | tạo lại | từ chối bản trùng |
| TC-03 / AC-03 | Hai đề tài đang thực hiện cùng chưa có kỳ 1 | tạo kỳ 1 cho từng đề tài | mỗi đề tài có một báo cáo chờ riêng |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-02, AC-13 trong [F04](../../docs/features/F04-quan-ly-tien-do/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Hai lần tạo cùng kỳ cùng đề tài trả về tối đa một dòng; cùng mã kỳ ở hai đề tài khác nhau có hai dòng.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Chuyên viên tiến độ và BA. [RV-15](../review-decisions.md#rv-15).
