---
title: "Backlog INVEST cho v0-mobile"
status: Review
updated: 2026-11-24
---

# Ba kết quả cần thử trên điện thoại

Chủ nhiệm dùng điện thoại giữa hai buổi làm việc để quyết định hồ sơ nào cần mở. US-12 đã đặc tả việc đi từ B06 tới hồ sơ nguồn. Ba thẻ sau bổ sung khả năng chọn đúng việc, đọc tin cá nhân và xác định kỳ còn nhận đề xuất. Mỗi thẻ có thể nghiệm thu trực tiếp tại module sở hữu. [US-12](../../specs/012-mobile-open-work-item/spec.md) · [Personas](personas.md) · [Quyết định kênh RV-34](../../specs/review-decisions.md#rv-34)

| Thứ tự / thẻ | User story và giá trị (V) | Độc lập (I) | Thương lượng (N) | Ước lượng (E) và giới hạn (S) | Kiểm chứng độc lập (T) |
|---|---|---|---|---|---|
| 1 · [US-33](../../specs/033-mobile-triage-deadlines/spec.md) · P1 | Là chủ nhiệm, tôi muốn lọc việc quá hạn trên tổng quan để mở đúng báo cáo cần xử lý trước. | B06 dùng danh sách việc và đích có sẵn của US-12. | Tên bộ lọc, cách đặt ngày trên thẻ. | 2 điểm tương đối, một widget chỉ đọc. | Trong phiên 21/11, lọc việc hạn 18/11, loại việc hạn 28/11, chạm mở đúng F04. |
| 2 · [US-34](../../specs/034-mobile-read-inbox/spec.md) · P1 | Là người nhận, tôi muốn mở tin chưa đọc bằng một tay và trở lại phần còn lại để tránh đọc lặp. | Vào trực tiếp B04 với hai tin của cùng người. | Vị trí bộ lọc và cách trình bày số chưa đọc. | 3 điểm, một hộp thư và trạng thái đọc của từng tin. | Mở một trong hai tin, quay lại bộ lọc, còn đúng một tin sau khi tải lại. |
| 3 · [US-35](../../specs/035-mobile-find-open-call/spec.md) · P2 | Là nhà khoa học, tôi muốn tra mã kỳ và hạn ngay trên điện thoại để biết kỳ nào còn nhận hồ sơ. | F02 dùng danh mục và cửa sổ nhận sẵn có. | Mức nổi bật của mã kỳ, cách trình bày khoảng nhận. | 2 điểm, một danh sách tra cứu và liên kết chi tiết có sẵn. | Tìm KG-2027-01, đọc hạn 30/11/2026, mở đúng điều kiện và biểu mẫu. |

Ước lượng dùng để xếp cỡ tương đối giữa ba thẻ với giả định có sẵn dữ liệu nguồn. PO/BA và đội phát triển rà lại khi có hợp đồng máy chủ. Hai lát P1 ưu tiên sự kiện đã đến với người dùng. US-35 phục vụ nhu cầu chủ động trước khi lập đề xuất. [Phương pháp INVEST của Agile Alliance](https://agilealliance.org/glossary/invest/)

## Quyết định BA/PO ngày 24/11/2026

| Mã | Tình huống | Hành vi triển khai | Vai trò duyệt | Trạng thái |
|---|---|---|---|---|
| RV-38 | Việc đến hạn hôm nay hoặc thiếu ngày | Chỉ coi là quá hạn từ ngày kế tiếp ở Asia/Ho_Chi_Minh. Giữ việc chưa có hạn trong Tất cả. | PO/BA, chủ nhiệm | Chốt triển khai |
| RV-39 | Đọc một tin từ danh sách đã lọc | Mở tin đánh dấu đúng một bản ghi đã đọc. Khi quay lại giữ bộ lọc trên URL. | PO/BA, phụ trách B04 | Chốt triển khai, theo B04 AC-06 |
| RV-40 | Chuyên viên vừa tra kỳ đang nhận vừa cần vào danh sách quản lý | Mặc định xem kỳ đang nhận trên điện thoại, có thể chuyển sang toàn bộ kỳ trong phạm vi. | PO/BA, chuyên viên QLKH | Chốt triển khai |

Hồ sơ nghiên cứu, cách chạy bản mẫu và kết quả kiểm chứng nằm trong [báo cáo v0-mobile](../reviews/rms-v0-mobile.md).
