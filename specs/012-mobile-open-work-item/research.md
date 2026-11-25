---
story: US-12
feature: B06
review_id: RV-12
status: Draft
updated: 2026-11-24
---

# Căn cứ và quyết định · US-12

**Vấn đề.** Nếu mất quyền sau khi đã thấy thẻ trên điện thoại thì sao?

**Quyết định triển khai.** Kiểm quyền khi mở liên kết, hướng người dùng về danh sách đã làm mới.

**Lý do.** Trong trường hợp điện thoại rộng 360 px đã hiện thẻ rồi tài khoản bị thu quyền, người dùng cần thấy kết quả “không lộ hồ sơ và có đường về trang chủ”. Phương án khác: Dùng quyền tại lần tải trang chủ gần nhất. Dùng TC-03 để phân biệt hai phương án. [RV-12](../review-decisions.md#rv-12)

**Tài liệu đối chiếu.** [B06](../../docs/features/B06-trang-chu/spec.md) — AC-03, AC-04, AC-05. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-03** (phạm vi dữ liệu — kiểm ở máy chủ) — Given chuyên viên C chỉ phụ trách đơn vị X, When C mở trang chủ, Then số liệu và việc cần làm chỉ tính trên **đề tài/hồ sơ thuộc phạm vi của C**, và yêu cầu vượt phạm vi bị **từ chối ở máy chủ** dù giao diện có hiển thị widget (BR-01).

- **AC-04** (việc cần làm theo trạng thái chuẩn hoá) — Given U là chủ nhiệm có 1 đề xuất **bị trả lại bổ sung** và 1 báo cáo tiến độ **quá hạn**, When U mở trang chủ, Then khối "việc cần làm của tôi" liệt kê đúng 2 đề mục đó, gom theo **trạng thái chuẩn hoá** (không phụ thuộc tên bước của tenant), mỗi đề mục có link tới feature nguồn (BR-02, BR-03).

- **AC-05** (chỉ đọc & điều hướng) — Given U thấy một đề mục "việc cần làm" trên trang chủ, When U bấm vào, Then hệ thống **điều hướng** tới đúng màn hình của feature nguồn (F01–F08) để U thao tác ở đó; trang chủ **không** sửa dữ liệu nghiệp vụ trực tiếp (BR-02).

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [test-plan.md](../../docs/features/B06-trang-chu/test-plan.md) · [ui.md](../../docs/features/B06-trang-chu/ui.md)
