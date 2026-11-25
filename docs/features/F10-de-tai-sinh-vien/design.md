---
title: "Thiết kế F10 · student-project"
owner: "SA / BE"
status: Review
updated: 2026-11-25
---

# Đề tài sinh viên · thiết kế triển khai

| Business rules | Tiêu chí | Cách hiện thực |
|---|---|---|
| BR-01, BR-02, BR-03, BR-04, BR-05 | AC-01, AC-02, AC-03, AC-04, AC-05 | Lấy SV/GV theo định danh đồng bộ trong tenant, kiểm hạn và số lượng trước ghi. Confirmation gắn registrationId và mentorId, từ chối phải có lý do. Kiểm lại xác nhận tại lần nộp. |
| BR-06, BR-07, BR-08, BR-09, BR-13, BR-14 | AC-06, AC-07, AC-08, AC-09, AC-12, AC-13 | Module quản lý trạng thái hồ sơ SV theo graph của tenant và semantic hợp lệ. Đổi thành viên hoặc GVHD cần quyền, lý do và audit. Ở bước kết quả, áp quy tắc file và xác nhận GVHD nếu bật. |
| BR-10, BR-11, BR-12 | AC-10, AC-11 | Gửi event đã commit cho P03 khi kết quả đủ điều kiện, gắn tenant, nguồn, eventKey và ngày nghiệp vụ. Replay cùng sự kiện giữ một phân bổ. |

Module `student-project` kiểm tenant và phạm vi ở máy chủ. Hợp đồng API thuộc `packages/api-contracts/student-project/`. N01 tạo workspace, T002 của từng lát định nghĩa operation và sinh type. [Đặc tả](spec.md) · [Ca kiểm](test-plan.md)

Các phiếu giao việc gồm [US-27](../../../specs/027-web-confirm-mentor/tasks.md).

**AC-06/12.** Lúc trưởng nhóm nộp, dịch vụ ghi mốc sau phê duyệt từ `F10.CALLS[].onApproval` vào hồ sơ. Mặc định khoa duyệt sang `APPROVED`, sau đó chủ thể có quyền chọn bắt đầu thực hiện. Với `IN_PROGRESS`, quyết định duyệt đưa hồ sơ thẳng vào thực hiện. Hồ sơ đã nộp trước migration dùng mốc mặc định. Người thẩm định phải có vai trò quản trị hoặc chuyên viên của khoa và độc lập với nhóm, GVHD. Khi duyệt, dịch vụ kiểm lại tài khoản và danh mục đồng bộ. Trả về nháp cần lý do, yêu cầu xác nhận GVHD cho bản sửa. Cả ba lệnh duyệt, trả, bắt đầu đều kiểm phiên bản và ghi audit. [Dịch vụ](../../../apps/backend/src/modules/student-project/confirm-mentor/service.ts)

Phiếu phản hồi GVHD trên web mang phiên bản lời mời. Sau khi khoa trả, backend yêu cầu phiên bản của lời mời mới. Lời mời đầu trên hồ sơ cũ vẫn dùng được từ client chưa gửi trường phiên bản. [Ca lời mời cũ](../../../apps/backend/test/db/student.test.mjs)

**BR-07 / AC-07 và AC-12.** Khoa được điều chỉnh tên, mục tiêu, sản phẩm dự kiến, thành viên và GVHD ở mốc đã duyệt hoặc đang thực hiện. Dịch vụ giữ trưởng nhóm và đợt gốc, tra danh bạ của khoa sở hữu hồ sơ, kiểm người duyệt độc lập với cả nhóm cũ và nhóm đề nghị, yêu cầu lý do và phiên bản. Giới hạn số thành viên được chụp khi nộp. Với hồ sơ cũ, lần điều chỉnh dùng giới hạn của đợt gốc nếu còn cấu hình. Nếu thiếu giới hạn, chỉ được sửa khi giữ nguyên danh sách thành viên.

Mỗi lần điều chỉnh ghi cả nội dung trước/sau vào P02. Khi chờ, chỉ GVHD hiện hành được phản hồi trên đúng phiên bản. Chấp nhận đưa hồ sơ về mốc trước khi điều chỉnh. Khi từ chối hoặc yêu cầu sửa, khoa thấy lý do và có thể lập bản mới. Dịch vụ kết quả chỉ cho nộp từ **Đang thực hiện**. Thành viên bị loại mất quyền theo nhóm ngay khi khoa ghi thay đổi. Quyền quản trị hoặc chuyên viên theo khoa tiếp tục được xét theo B03. Màn hình lấy danh bạ của đúng đơn vị sau khi người thẩm định mở biểu mẫu. [Dịch vụ](../../../apps/backend/src/modules/student-project/amendments.ts) · [Ràng buộc DB](../../../apps/backend/prisma/migrations/0045_student_project_amendment/migration.sql)

### Hồ sơ cuối kỳ trong luồng rút gọn

Khi trưởng nhóm nộp đăng ký chính thức, F10 lưu bản chụp ba thuộc tính trong mỗi mục của `F10.CALLS`. `finalEvidence` chứa các cặp mã và nhãn bắt buộc. Mảng rỗng cho phép chỉ nộp tóm tắt. `requireMentorFinal` điều khiển bước xác nhận. `hourCategory` chọn nhóm công thức P03. Đợt cũ và hồ sơ đã triển khai trước migration 0041 dùng báo cáo tổng kết, yêu cầu GVHD xác nhận và mã `STUDENT_PROJECT`. Cấu hình đợt mới có thể thay các mặc định này.

Đợt có thể đặt `requireProgress` để yêu cầu ít nhất một ghi nhận tiến độ và `finalDue` để đặt hạn nộp kết quả. Cả hai được ghim lúc nộp chính thức. Hồ sơ cũ cho phép nộp kết quả theo quy tắc trước đó. Trong giai đoạn thực hiện, trưởng nhóm hoặc GVHD thuộc danh bạ hiện hành có thể ghi nội dung tiến độ. Khoa và các thành viên đọc được nội dung mới nhất, người ghi và thời điểm. Mỗi lần ghi kiểm phiên bản và lưu nội dung trước/sau trong audit. Hạn nộp áp dụng hết ngày theo giờ Việt Nam. Khi khoa cho làm lại sau kết quả không đạt, hạn mới của khoa được dùng cho lượt tiếp theo. [Dịch vụ tiến độ](../../../apps/backend/src/modules/student-project/progress.ts) · [Kiểm điều kiện nộp](../../../apps/backend/test/db/student-results.test.mjs)

| Điều kiện | Hiện thực |
|---|---|
| AC-08, AC-09 | Trưởng nhóm tải qua kho riêng, xác nhận tệp trước khi nộp. Mã đề tài và lượt nộp gắn vào từng tệp. GVHD xác nhận đúng phiên bản. Khoa kiểm điều kiện trước khi ghi nhận đạt hoặc không đạt. |
| AC-10, AC-11 | Đóng đề tài đạt và ghi yêu cầu P03 trong cùng giao dịch nếu P03 bật. Ngày hiệu lực công thức là ngày khoa kết luận đạt, theo Asia/Ho_Chi_Minh. Một GVHD nhận 100% định mức vai trò MENTOR. Khóa duy nhất trên nguồn, phiên bản, người và vai trò bảo vệ khi phát lại. |
| AC-12 | Ghi actor, trước/sau, lý do, phiên bản, lượt và ID minh chứng. Khi khoa cho làm lại sau kết quả không đạt, tạo lượt mới có hạn, đặt lại xác nhận và giữ bằng chứng lượt trước trong kho/audit. |

Khi P03 tắt lúc đóng, F10 lưu quyết định đóng cùng trạng thái chưa yêu cầu quy đổi. Việc truy lĩnh cho hồ sơ cũ cần quyết định nghiệp vụ của trường. [Migration](../../../apps/backend/prisma/migrations/0041_student_project_results/migration.sql) · [Ca PostgreSQL](../../../apps/backend/test/db/student-results.test.mjs)
