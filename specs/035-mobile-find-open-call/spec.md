---
id: US-35
feature: F02
epic: E1
channel: mobile
review_id: RV-40
status: Draft
updated: 2026-11-24
---

# Tra kỳ đang nhận theo mã trên điện thoại

[Backlog INVEST](../../docs/product/mobile-invest.md) · Nguồn nghiệp vụ [F02](../../docs/features/F02-dot-keu-goi/spec.md), BR-01, BR-04–05 và AC-03–04, AC-08. F02/AC-09 ghi hành vi mobile. Mã BR/AC trong lát này có phạm vi US-35.

## User Scenarios & Testing

### US1 · P2

Là nhà khoa học, tôi muốn tìm kỳ đang nhận theo tên hoặc mã và xem ngay ngày hết hạn để quyết định có chuẩn bị hồ sơ. Phép thử độc lập dùng dữ liệu sau. Kỳ KG-2027-01 mở từ 01/11 đến 30/11/2026, kỳ thu đã đóng và một kỳ nháp. Đối chiếu tài khoản chủ nhiệm và chuyên viên.

| Ca | Given | When | Then |
|---|---|---|---|
| AC-01 | Có kỳ đang nhận, kỳ đã đóng và bản nháp | Mở F02 trên điện thoại | Nhóm đang nhận chỉ hiển thị kỳ đang trong cửa sổ nhận. |
| AC-02 | Kỳ KG-2027-01 kết thúc 30/11/2026 | Tìm kg-2027-01 rồi mở thẻ | Thẻ hiện hạn 30/11/2026. Chi tiết hiện mã kỳ, biểu mẫu và hành động F01 phù hợp quyền. |
| AC-03 | Từ khóa không khớp | Tìm rồi xóa từ khóa | Có thông điệp rỗng và danh sách được phục hồi. |
| AC-04 | Một chuyên viên được quản lý kỳ nháp, một chủ nhiệm chỉ tra kỳ mở | Mỗi người chọn Tất cả | Kỳ nháp chỉ xuất hiện cho chuyên viên có quyền. Kỳ OPEN tương lai hoặc hết hạn bị loại khỏi Đang nhận. |

## Requirements

- **BR-01 / FR-001** — Danh sách đang nhận chỉ gồm kỳ nhìn thấy với trạng thái OPEN và ngày nghiệp vụ trong khoảng nhận, gồm cả hai đầu mút.
- **BR-02 / FR-002** — Tìm theo tên hoặc mã trong tập đang chọn. Mỗi kết quả có mã và hạn dạng dd/MM/yyyy.
- **BR-03 / FR-003** — Chạm kết quả mở đúng điều kiện, biểu mẫu tại F02. Danh sách toàn bộ giữ nguyên phạm vi của từng vai trò.

**Key entities.** ProposalCall có id bất biến, code, title, status, start, due và tham chiếu biểu mẫu. Phần tra cứu chỉ chiếu thông tin. Điều kiện tiếp nhận dùng cùng ngày nghiệp vụ với F01.

## Success Criteria

- **SC-001** — Tìm một kỳ theo mã và đọc đúng hạn trên màn hình 320 px mà không cuộn ngang.
- **SC-002** — Đối chiếu cả bốn ca ở 360 và 390 CSS px. Số bản ghi ngoài quyền lộ qua nội dung hoặc số đếm bằng 0.

## Assumptions

Giao diện web responsive dùng lại module F02. Định dạng ngày theo quy ước RMS. Thu gọn cột mã sẽ làm mất cách tra từ công văn. Gộp mã và hạn vào một thẻ giúp nhìn được hai thông tin khi nhập mã.

## Clarifications

### Session 2026-11-22

**Mặc định thu gọn theo trạng thái OPEN hay theo cả cửa sổ nhận?** Dùng cả ngày bắt đầu và hạn cuối như F01. Cho phép chuyển Tất cả để chuyên viên tìm lại các kỳ trong phạm vi. Mặc định chọn Đang nhận khi vào từ điện thoại. [RV-40 trong backlog](../../docs/product/mobile-invest.md).
