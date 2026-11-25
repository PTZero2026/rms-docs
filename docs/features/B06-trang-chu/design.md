---
title: "Thiết kế B06 · home"
owner: "SA / BE"
status: Review
updated: 2026-11-25
---

# Trang chủ (Dashboard cá nhân) · thiết kế triển khai

| Business rules | Tiêu chí | Cách hiện thực |
|---|---|---|
| BR-01, BR-04, BR-05 | AC-01, AC-02, AC-03, AC-08, AC-09 | Ghép cấu hình VP-HOME theo tenant và vai trò, intersect với feature đang bật và scope nguồn trước khi truy vấn hàng hoặc đếm. |
| BR-02, BR-03, BR-06, BR-08 | AC-04, AC-05, AC-06, AC-11 | Tạo thẻ theo semantic, khóa công việc và khóa đối tượng. Một đề tài có thể có nhiều kỳ. Tính quá hạn theo ngày Việt Nam trên cùng tập nhìn thấy. Link chuyển tới module sở hữu để kiểm lại quyền. Việc xem chỉ đọc. |
| BR-07, BR-09, BR-10 | AC-07, AC-10, AC-12 | B04 cấp năm thông báo mới nhất theo người. Kết quả trống có lối quay về danh sách. Cache phân vùng theo phiên, quyền và tenant, trả thời điểm dữ liệu, làm mới khi đổi scope. |

Module `home` kiểm tenant và phạm vi ở máy chủ. Hợp đồng API thuộc `packages/api-contracts/home/`. N01 tạo workspace, T002 của từng lát định nghĩa operation và sinh type. [Đặc tả](spec.md) · [Ca kiểm](test-plan.md)

Với AC-06, liên kết từ thẻ số liệu dẫn sang B02 trong cùng trường. Khi mở trang đích, B03 cấp đơn vị và quyền hiện hành, B02 cấp danh sách bộ lọc được xem. Chuyên viên bắt đầu ở khoa của mình, quản trị bắt đầu ở toàn trường. Nếu khoa trống hoặc đã ra khỏi danh sách được phép, người xem cần chọn phạm vi trước khi tạo bản chụp. Mở mục báo cáo trực tiếp từ menu vẫn bắt đầu với các đơn vị trong quyền.

Các phiếu giao việc gồm [US-12](../../../specs/012-mobile-open-work-item/tasks.md), [US-33](../../../specs/033-mobile-triage-deadlines/tasks.md).

## Lọc việc quá hạn

| Truy vết | Hành vi |
|---|---|
| BR-11, AC-13 | So ngày hạn của từng việc trước khi nhóm, giữ khóa việc riêng với khóa đích. |

## Việc của hội đồng nghiệm thu

Với AC-03–05, thẻ cá nhân mang mã vòng và mở phiếu F06 của người đăng nhập. Danh sách và lần mở lại cùng đọc quyền hiện hành qua `eligible_reviewer`, loại phiếu đã gửi và vòng đã chốt. Một bản nháp vẫn cần chấm. Chuyên viên phụ trách có thẻ mang mã đề tài để điều phối từ lúc nhận hồ sơ đến khi có kết luận, kể cả khi vòng được mở lại. Hai đích dùng `targetType` trong hợp đồng để phân biệt hồ sơ và phiếu. Hạn trên thẻ lấy từ nghiệp vụ nguồn. [Hợp đồng](../../../packages/api-contracts/home/open-work-item.yaml) · [Ca F06](../../../apps/backend/test/db/acceptance.test.mjs)

## Tải từng phần của trang chủ

Với AC-01/AC-02 và TC-18, web đọc bố cục, thứ tự thẻ và lối tắt từ `GET /home/layout`. Sau đó từng thẻ đọc nguồn bằng yêu cầu riêng. `/home/work` nhận bộ lọc và trang hiện hành. `/home/widgets/{widget}` đọc lý lịch, số liệu đề tài, thông báo hoặc giờ giảng. Mỗi đường đọc mở giao dịch theo người dùng và trường. Phần nhắc bổ sung lý lịch đọc cấu hình F08 riêng. Nguồn số liệu ghi thời điểm sau khi tính xong. Máy chủ kiểm bố cục và quyền hiện hành khi đọc dữ liệu, gồm cả E4 và P03 cho giờ giảng. Client cũ vẫn có thể gọi `/home/overview`. [Hợp đồng dữ liệu](../../../packages/api-contracts/home/overview.yaml)

Một thẻ có thể tải chậm, báo lỗi và được thử lại trong khi người dùng thao tác ở thẻ khác. Khi đổi bộ lọc hoặc rời trang, web hủy yêu cầu cũ. Nếu máy chủ cho biết thẻ đã ra khỏi bố cục, web gỡ thẻ. Lỗi kỹ thuật khi lấy bố cục ban đầu có nút tải lại trang chủ. Khi một yêu cầu của B06 nhận 401 hoặc 403, giao diện gỡ dữ liệu phiên khỏi màn hình tài khoản và yêu cầu đăng nhập lại.

## Cấu hình bố cục theo vai trò

Với BR-05 và AC-09, HOME-11 dùng cùng bốn khóa `HOME.*` của B01 mà B06 đọc khi mở trang chủ. Biểu mẫu gọi GET/PUT trên `/api/tenants/{slug}/catalog/configurations/home-layouts/{role}`. IAM xác định quyền `catalog.manage` và phạm vi trường cho mỗi yêu cầu. Dịch vụ trả danh sách thẻ theo thứ tự, nguồn hiệu lực và phiên bản. Khi lưu, dịch vụ tuần tự hóa các lệnh ghi cùng mã vai trò trong giao dịch, so phiên bản hiệu lực rồi ghi bản riêng của trường. Nếu phiên bản đã đổi, trả 409 để quản trị đọc lại. [Hợp đồng](../../../packages/api-contracts/catalog/home-layout.yaml)

Cả biểu mẫu HOME-11 và thao tác tạo, sửa, xóa ở B01 đều ghi thứ tự hiệu lực trước và sau trong cùng giao dịch với cấu hình. PostgreSQL giới hạn lịch sử theo trường và bốn khóa vai trò. API đọc từng trang 10 dòng. Dấu thời gian và tài khoản có từ nhật ký gốc. Hai cột giá trị bổ sung có thể trống trên dữ liệu đã lưu trước migration 002. [Migration](../../../apps/sys-config-service/db/002_home_layout_history.sql) · [Ca PostgreSQL](../../../apps/sys-config-service/test/store.test.mjs)
