---
id: US-34
feature: B04
epic: E0
channel: mobile
review_id: RV-39
status: Draft
updated: 2026-11-24
---

# Đọc lần lượt tin cá nhân chưa đọc

[Backlog INVEST](../../docs/product/mobile-invest.md) · Nguồn nghiệp vụ [B04](../../docs/features/B04-thong-bao/spec.md), BR-09–10 và AC-06. B04/AC-11 ghi hành vi mobile. Mã BR/AC trong lát này có phạm vi US-34.

## User Scenarios & Testing

### US1 · P1

Là người nhận, tôi muốn quay lại danh sách chưa đọc sau khi mở một tin để biết còn tin nào cần xem. Phép thử độc lập dùng dữ liệu sau. Hai tin IN_APP chưa đọc của Mai, một tin từ kỳ nhận và một từ báo cáo. Mở B04 bằng phiên Mai và đối chiếu với hộp thư người nhận khác.

| Ca | Given | When | Then |
|---|---|---|---|
| AC-01 | Mai có hai tin chưa đọc | Chọn Chưa đọc và mở tin thứ nhất | Chi tiết hiển thị nội dung và còn một tin chưa đọc. |
| AC-02 | Đang xem chi tiết từ bộ lọc Chưa đọc | Dùng nút Back của trình duyệt, rồi tải lại | Bộ lọc vẫn được chọn và danh sách chỉ còn tin thứ hai. |
| AC-03 | Chỉ còn một tin trong bộ lọc | Mở tin cuối và quay lại | Gặp trạng thái rỗng, có thể chuyển Tất cả và mở lại tin đã đọc mà số đếm giữ ở 0. |
| AC-04 | Đăng nhập người khác, biết mã tin của Mai | Đi thẳng tới mã tin | Hiện trạng thái ngoài phạm vi, nội dung và trạng thái của tin của Mai được bảo toàn. |

## Requirements

- **BR-01 / FR-001** — Danh sách và số đếm cùng giới hạn theo tenant và người nhận đăng nhập.
- **BR-02 / FR-002** — Mở một tin chưa đọc chuyển riêng tin đó sang đã đọc. Mở lại cùng tin giữ nguyên kết quả.
- **BR-03 / FR-003** — Trở lại danh sách đã lọc giữ lựa chọn Chưa đọc. Khi hết tin hiển thị trạng thái rỗng và lối xem Tất cả.

**Key entities.** IN_APP có id, recipientId, tenant, nội dung, thời gian, liên kết nguồn và trạng thái. SUBMITTED trong spec tương ứng UNREAD trong fixture. READ là trạng thái cuối của thao tác đọc. Bộ lọc thuộc URL danh sách.

## Success Criteria

- **SC-001** — Từ danh sách chưa đọc có hai tin, mở một tin rồi quay lại thấy đúng một tin chưa đọc.
- **SC-002** — Đối chiếu cả bốn ca ở 360 và 390 CSS px. Số bản ghi ngoài quyền lộ qua nội dung hoặc số đếm bằng 0.

## Assumptions

Giao diện web responsive dùng lại module B04. Định dạng ngày theo quy ước RMS. Đọc tất cả giúp dọn hộp thư nhưng mất dấu từng tin. Lọc và mở riêng từng tin cho phép đọc gián đoạn.

## Clarifications

### Session 2026-11-22

**Lúc nào tin rời bộ lọc và khi quay lại thì bộ lọc nào còn hiệu lực?** B04 AC-06 đặt mốc khi mở tin. Lưu lựa chọn Chưa đọc trong URL danh sách để quay lại và tải lại cùng bộ lọc. [RV-39 trong backlog](../../docs/product/mobile-invest.md).
