---
story: US-13
feature: B02
review_id: RV-13
status: Draft
updated: 2026-11-21
---

# Kiểm tra đầu cuối · US-13

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị kỳ K có ba mã A1, A2 (khoa A) và B1 (khoa B). A1 đã nộp hai lần, A2 còn mã và đang ở Nháp sau khi bị trả. A3 là nhãn dữ liệu thử cho nháp chưa từng nộp, chưa có mã. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | 3 mã trong quyền, 1 mã đã nộp lại | tổng hợp theo trạng thái hiện tại | tổng bằng 3, từng nhóm khớp danh sách chốt |
| TC-02 / AC-02 | chỉ có quyền một đơn vị | xuất báo cáo | cả dòng chi tiết và tổng loại hồ sơ ngoài quyền |
| TC-03 / AC-03 | Trưởng phòng thấy cả hai khoa, A1 đã nộp lại, A2 bị trả về Nháp còn mã, A3 chưa cấp mã | Tạo báo cáo, sau đó nộp lại A2. Mở chi tiết và xuất từ bản chụp ban đầu rồi tạo báo cáo mới, quyền giữ nguyên | Bản đầu và tệp cùng tổng 3, mỗi mã A1, A2, B1 một dòng, A2 ở nhóm Nháp, vắng A3. Báo cáo mới vẫn tổng 3, A2 sang nhóm Đã nộp |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Khi nghiệm thu pilot, trưởng phòng KHCN ký danh sách đối chứng của trường theo [kế hoạch kiểm thử B02](../../docs/features/B02-bao-cao-thong-ke/test-plan.md).

**Đối chiếu nghiệp vụ.** Đối chiếu mã, nhóm, tổng và thời điểm trích xuất trên màn hình và trong tệp của TC-03.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Trưởng phòng KHCN và PO/BA. [RV-13](../review-decisions.md#rv-13).
