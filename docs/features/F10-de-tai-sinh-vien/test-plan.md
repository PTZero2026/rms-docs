---
title: "Đề tài sinh viên — Test plan"
spec: "./spec.md"
owner: "QA"
status: Review
updated: 2026-11-25
---

# Đề tài sinh viên — Kế hoạch kiểm thử

> Mỗi test case bám một AC trong `spec.md`; chi tiết dữ liệu test sẽ bổ sung khi `design.md` chốt mô hình.

## 2. Test cases
| ID | Liên kết AC | Bước thực hiện | Kết quả mong đợi | Loại |
|---|---|---|---|---|
| TC-01 | AC-01 | SV nộp đề tài vào đợt đã đóng | Bị từ chối, không tạo hồ sơ nộp chính thức | Negative |
| TC-02 | AC-02 | Thêm SV vào nhóm đề tài | Chọn từ danh sách đồng bộ, không nhập tay hồ sơ SV | Happy |
| TC-03 | AC-03 | Thêm thành viên vượt giới hạn cấu hình của đợt | Bị chặn lưu/nộp và báo vượt giới hạn | Negative |
| TC-04 | AC-04 | SV nộp chính thức khi GVHD chưa xác nhận | Bị chặn và yêu cầu GVHD xác nhận | Negative |
| TC-05 | AC-05 | GVHD từ chối hướng dẫn kèm lý do | Đề tài quay về nháp; lịch sử ghi nhận lý do và người thao tác | Happy |
| TC-06 | AC-06 | Khoa/bộ môn phê duyệt đề tài đã nộp hợp lệ | Trạng thái chuyển theo workflow cấu hình; có audit | Happy |
| TC-07 | AC-07 | Đổi GVHD/thành viên khi đề tài đang thực hiện nhưng thiếu quyền/lý do | Backend từ chối | Permission/Negative |
| TC-08 | AC-08 | SV nộp kết quả cuối thiếu minh chứng bắt buộc | Bị chặn nộp kết quả cuối | Negative |
| TC-09 | AC-09 | Gửi nghiệm thu khi thiếu xác nhận GVHD và tenant bắt buộc xác nhận | Bị chặn gửi nghiệm thu/ghi nhận | Negative |
| TC-10 | AC-10 | Đóng đề tài đã nghiệm thu/ghi nhận đạt | F10 phát yêu cầu P03; GVHD được tính giờ theo công thức hiệu lực | Integration |
| TC-11 | AC-11 | Xử lý lại sự kiện đóng đề tài đã được quy đổi | Không tạo bản ghi giờ giảng trùng | Idempotency |
| TC-12 | AC-12 | Thực hiện một chuyển trạng thái thành công | `AuditLog` ghi actor, thời điểm, trạng thái trước/sau, ghi chú nếu có | Audit |
| TC-13 | AC-13 | Kích hoạt workflow tenant có thêm bước hội đồng nghiệm thu | Tất cả step có `statusSemantic` hợp lệ; báo cáo đọc theo semantic chuẩn | Config |

## Ca biên theo quyết định triển khai

| Ca | AC nguồn | Điều kiện | Thao tác | Kết quả |
|---|---|---|---|---|
| TC-14 · [US-27/TC-03](../../../specs/027-web-confirm-mentor/quickstart.md) | AC-04 | Giảng viên đã xác nhận cho hồ sơ A, sinh viên gửi hồ sơ B | nộp B | yêu cầu xác nhận riêng cho B |

**Đối chứng TC-06.** Gửi lại đăng ký sau khi khoa trả, kiểm cần xác nhận mới của GVHD. Thử lệnh duyệt từ màn hình cũ rồi gửi hai lệnh cùng phiên bản. Kết quả có một quyết định duyệt trong audit. Kiểm riêng hai cấu hình chuyển sang Đã phê duyệt hoặc Đang thực hiện. [Ca PostgreSQL](../../../apps/backend/test/db/student.test.mjs) · [Ca bốn phiên Chrome](../../../e2e/student-project/confirm-mentor/acceptance.spec.ts)

**TC-08 đến TC-12, chế độ rút gọn.** Ca PostgreSQL kiểm nộp thiếu một loại, chuẩn bị lại bộ tệp ở lượt mới, hai chính sách xác nhận GVHD, lý do không đạt, hạn làm lại, hai yêu cầu đóng đồng thời và worker xử lý lại. Ca trình duyệt dùng hai tệp PDF và đối chiếu kết quả với sổ giờ giảng viên. [Ca DB](../../../apps/backend/test/db/student-results.test.mjs) · [Kịch bản Chrome](../../../e2e/student-project/confirm-mentor/acceptance.spec.ts)

**TC-07/12.** Kiểm sinh viên gửi lệnh điều chỉnh, khoa bỏ trống lý do, đề nghị nhóm thiếu trưởng nhóm, dùng bản sửa cũ, truy cập sau khi bị thay thế và nộp kết quả khi chờ GVHD. Cho GVHD mới từ chối rồi khoa mời lại. Kiểm trạng thái tiếp tục, số phiên bản, thành viên trước/sau, lý do và định danh người được mời trong audit. [Kiểm quyền và lịch sử](../../../apps/backend/test/db/student.test.mjs)

**Tiến độ và hạn của đợt.** Kiểm bản chụp yêu cầu tiến độ và hạn nộp, đợt tương thích cũ, khoa định ghi thay, trưởng nhóm ghi nội dung, GVHD dùng phiên bản cũ rồi tải lại và ghi tiếp. Nộp kết quả ở đợt bắt buộc khi đủ tệp nhưng thiếu tiến độ phải nhận lỗi. Sau nộp, các cập nhật tiến độ bị chặn. [Ca tích hợp](../../../apps/backend/test/db/student-results.test.mjs)
