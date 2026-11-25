# US-06, US-07, US-08 · Một hồ sơ qua hai lần nộp

| Lát | Chứng cứ nghiệm thu |
|---|---|
| US-06 | Chủ nhiệm từ kỳ đã mở lưu riêng tên đề xuất, thiếu phương pháp. API trả một chủ nhiệm và mã rỗng. Mở lại từ URL trên phiên xác thực, nội dung đã nhập còn nguyên. Chủ nhiệm khác và người tenant B không đọc được ID. |
| US-07 | Nộp thiếu phương pháp hiển thị trường còn thiếu. Nộp đủ ở mili giây cuối ngày Việt Nam được nhận, qua ngày mới bị chặn. Hai lệnh cùng revision trả cùng mã. Hai nháp khác nộp song song được hai mã riêng. Sau nộp, sửa bị từ chối và form khóa. |
| US-08 | Trả bằng lý do trống hoặc sau hạn bị từ chối. Chuyên viên nhập lý do, chủ nhiệm thấy đúng nội dung, sửa rồi nộp lại. Mã giữ nguyên, hệ thống ghi lại thời điểm và ba lần chuyển trạng thái cho nộp–trả–nộp. |

Các phép thử dùng cùng hợp đồng giữa web và Nest. Ca DB đặt thời điểm tại cổng lệnh nghiệp vụ; ca Chrome lấy thời gian máy chủ. [Ca DB và cạnh tranh cấp số](../../../apps/backend/test/db/proposals.test.mjs) · [Luồng Chrome](acceptance.spec.ts) · [Ảnh và hướng dẫn](../../../docs/guides/nguoi-dung/chu-nhiem-de-xuat.md)

## F01/BR-10 · Hủy đề xuất

Sau khi nộp thành công, chủ nhiệm và chuyên viên cùng mở hồ sơ trên hai phiên Chrome. Chủ nhiệm xác nhận hủy có lý do. Chuyên viên gửi từ phiên cũ nhận 409 rồi thấy lý do của chủ nhiệm. Chủ nhiệm mở lại đường dẫn cũ, đọc đúng mã đề tài và lý do. Các ô nội dung đã khóa. Tại PostgreSQL, chuyên viên cùng khoa cũng đã hủy được hồ sơ đã nộp sau hạn. Hồ sơ nháp giữ mã rỗng khi hủy. [Thao tác hai phiên](../../proposal/cancel-proposal/acceptance.ts) · [Ảnh kết quả](../../../docs/reviews/screenshots/calls/chu-nhiem-huy-de-xuat.png)
