---
story: US-11
feature: F03
review_id: RV-11
status: Draft
updated: 2026-11-21
---

# Kiểm tra đầu cuối · US-11

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị ba bộ phiếu dựng sẵn ở trên, dưới và bằng ngưỡng. Mở dịch vụ dùng chung và điểm gọi của module sở hữu với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | đủ phiếu, điểm bằng ngưỡng đạt, quy chế không yêu cầu đạo đức hoặc đã có kết quả đạt | kết luận | đề tài APPROVED và ghi audit |
| TC-02 / AC-02 | chưa đủ phiếu | kết luận | hiển thị số phiếu thiếu, đợt giữ nguyên |
| TC-03 / AC-03 | Đủ phiếu khoa học, điểm vừa đạt nhưng hồ sơ bắt buộc thẩm định đạo đức đang chờ | chuyên viên chốt khoa học | lưu kết luận khoa học PASSED, đề tài UNDER_REVIEW, chủ nhiệm thấy bước đang chờ và chưa nhận thông báo duyệt |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-03, AC-04, AC-05 trong [F03](../../docs/features/F03-xet-duyet-hoi-dong/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Với TC-01, chạy riêng hồ sơ không bắt buộc đạo đức và hồ sơ có đạo đức thông qua trước khoa học. Với TC-03, cho hội đồng yêu cầu bổ sung và kiểm nội dung chủ nhiệm thấy khi đề tài vẫn UNDER_REVIEW. Từ đó chạy hai kết quả độc lập. Khi đạo đức thông qua, gửi lại cùng kết quả và kiểm đúng một lần chuyển APPROVED, một thông báo duyệt. Khi đạo đức từ chối cuối cùng, kiểm REJECTED và thông báo từ chối. Cả hai giữ nguyên PASSED của khoa học. Kiểm audit từng lần chuyển và chạy lại ca khoa học dưới ngưỡng.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho PO, thư ký hội đồng khoa học và đạo đức. [RV-11](../review-decisions.md#rv-11).
