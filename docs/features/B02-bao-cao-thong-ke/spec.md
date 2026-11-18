---
title: "Báo cáo kỳ — ứng viên nghiệp vụ B02"
id: "B02"
epic: "E3"
version: 0.2
owner: "PO/BA"
status: Review
updated: 2026-11-18
---

# Báo cáo kỳ nhận đề xuất

Bản trình duyệt cho **một** báo cáo. Người duyệt nghiệp vụ là trưởng phòng KHCN và PO/BA. Mã BR/AC dưới đây là ứng viên của B02. [US-13](../../../specs/013-web-call-report/spec.md) · [Phiếu RV-13](../../../specs/review-decisions.md#rv-13)

Trưởng phòng chọn kỳ và phạm vi đơn vị được giao, tạo báo cáo, mở danh sách đối chứng rồi xuất kết quả. B06 cung cấp số liệu lược xem trên trang chủ. Báo cáo liên kỳ, kinh phí và phân tích công bố thuộc các lát sau.

| Quy tắc | Nội dung |
|---|---|
| BR-01 | Tính một lần cho mỗi đề tài đã cấp mã trong kỳ. Hồ sơ bị trả về nháp còn mã vẫn thuộc tập. Nháp chưa từng nộp nằm ngoài tập. |
| BR-02 | Nhóm theo trạng thái chuẩn tại thời điểm trích xuất. Tổng, chi tiết và bản xuất dùng cùng tập bản ghi và cùng thời điểm. |
| BR-03 | Áp quyền theo tenant và đơn vị trước khi đếm. Khi quyền bị thu hẹp sau lúc tạo, yêu cầu tạo lại bản xuất theo quyền mới. |

**Dữ liệu.** Định danh đề tài, mã theo dõi, kỳ, đơn vị, trạng thái chuẩn và thời điểm trích xuất. Đợt pilot xuất bảng gồm các trường này và số lượng theo nhóm. PO xác nhận mẫu đối chứng của trường.

- **AC-01** — Given kỳ có ba mã khác nhau, một mã đã nộp hai lần và một nháp chưa cấp mã. When tổng hợp. Then tổng bằng ba, nhóm khớp ba hồ sơ trong danh sách.
- **AC-02** — Given người dùng chỉ phụ trách khoa A trong kỳ có khoa A và B. When mở tổng, chi tiết và bản xuất. Then cả ba chỉ chứa hồ sơ A, kể cả khi sửa bộ lọc để yêu cầu B.
- **AC-03** — Given một hồ sơ đổi trạng thái sau lúc tạo báo cáo. When mở chi tiết và xuất trong cùng bản chụp, quyền giữ nguyên. Then bảng và tệp cùng số liệu và thời điểm. Tạo mới báo cáo mới thấy trạng thái vừa đổi.
