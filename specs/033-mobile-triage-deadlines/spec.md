---
id: US-33
feature: B06
epic: E0
channel: mobile
review_id: RV-38
status: Draft
updated: 2026-11-24
---

# Tìm việc quá hạn trên điện thoại

[Backlog INVEST](../../docs/product/mobile-invest.md) · Nguồn nghiệp vụ [B06](../../docs/features/B06-trang-chu/spec.md), BR-01–05, BR-08–09 và AC-03–05, AC-09–11. B06/AC-13 ghi hành vi mobile. Mã BR/AC trong lát này có phạm vi US-33.

## User Scenarios & Testing

### US1 · P1

Là chủ nhiệm, tôi muốn thấy việc quá hạn trong danh sách của mình để mở báo cáo cần xử lý ngay. Phép thử độc lập dùng dữ liệu sau. Phiên Lê Thanh Mai tại Thủy lợi ngày 21/11/2026. Báo cáo kỳ 2 hạn 18/11 và kỳ 3 hạn 28/11 cùng liên kết về đề tài nguồn.

| Ca | Given | When | Then |
|---|---|---|---|
| AC-01 | Hai báo cáo có hạn 18/11 và 28/11 | Chọn Quá hạn ngày 21/11 | Danh sách có kỳ 2 và loại kỳ 3, số đếm khớp. |
| AC-02 | Có việc hạn hôm nay và việc chưa có hạn | So Quá hạn với Tất cả | Cả hai chỉ có trong Tất cả. Khi nhóm quá hạn rỗng có cách trở lại toàn bộ việc. |
| AC-03 | Chủ nhiệm nhìn thấy kỳ 2 của chính mình | Mở thẻ rồi quay lại B06 | F04 mở đúng đề tài. Dữ liệu và audit giữ nguyên. |
| AC-04 | Đổi người hoặc tenant, hoặc cấu hình bỏ widget việc | Mở lại tổng quan | Danh sách và số đếm theo phiên mới. Widget bị tắt thì cả thẻ và tổng tương ứng đều ẩn. |

## Requirements

- **BR-01 / FR-001** — Đếm và lọc trên cùng tập việc thuộc phiên, sau khi áp dụng quyền và cấu hình widget của tenant.
- **BR-02 / FR-002** — Hạn trước ngày nghiệp vụ là quá hạn. Việc thiếu hạn hoặc đến hạn hôm nay vẫn xuất hiện ở Tất cả.
- **BR-03 / FR-003** — Mở việc đi tới hồ sơ ở module sở hữu. Đọc tổng quan và lọc giữ nguyên dữ liệu và audit.

**Key entities.** Mỗi mục có khóa việc, tiêu đề, loại việc, ngày hạn tùy chọn, module và khóa đích. Hai kỳ báo cáo khác khóa việc nhưng có thể cùng khóa đề tài. Lọc theo ngày trên việc và điều hướng theo khóa đích.

## Success Criteria

- **SC-001** — Xác định và mở kỳ 2 từ B06 qua tối đa hai lần chạm.
- **SC-002** — Đối chiếu cả bốn ca ở 360 và 390 CSS px. Số bản ghi ngoài quyền lộ qua nội dung hoặc số đếm bằng 0.

## Assumptions

Giao diện web responsive dùng lại module B06. Định dạng ngày theo quy ước RMS. Lịch tháng cần thêm thao tác tìm đúng ngày. Danh sách theo hạn tận dụng thứ tự hiện có và chấp nhận việc chưa có ngày.

## Clarifications

### Session 2026-11-22

**Việc đến hạn hôm nay và việc thiếu hạn thuộc nhóm nào?** Dùng ngày nghiệp vụ Asia/Ho_Chi_Minh. Hai trường hợp thuộc Tất cả. Nhãn bộ lọc là Quá hạn và Tất cả. [RV-38 trong backlog](../../docs/product/mobile-invest.md).
