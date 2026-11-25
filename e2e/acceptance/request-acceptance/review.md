# F06 · Đăng ký, chấm và kết luận

Ngày 24/11/2026. [PostgreSQL](../../../apps/backend/test/db/acceptance.test.mjs) · [Kịch bản trình duyệt trên cùng đề tài](acceptance.ts).

| Lát | Kết quả đã kiểm |
|---|---|
| US-22 | Kỳ cuối chưa đạt bị chặn. Cam kết một bài và một sáng chế, đã có hai bài vẫn báo thiếu một PATENT. Thêm sáng chế và tệp hồ sơ cuối thì chuyển PENDING_ACCEPTANCE. Người trường khác không thể truy cập hoặc nộp hộ. |
| US-23 | Hệ thống ghim tiêu chí ACCEPTANCE khi mở đợt. Phiếu F03 đã nộp không làm giảm số thiếu của F06. Chủ nhiệm có ghế hội đồng vẫn không được ghi phiếu cho đề tài mình. Thành viên hợp lệ gửi đủ điểm, người chốt so ngưỡng của trường và chuyển PASSED. Chốt lại giữ kết quả, sửa phiếu đã khóa bị chặn. |
| Bàn giao F05 | Trong cùng phiên Chromium, từ F03 đã duyệt, qua F04 giao và duyệt kỳ, F07 duyệt sản phẩm, F06 nhận hồ sơ/chấm phiếu, F05 khóa sổ theo chế độ rà thủ công. F05 có kịch bản riêng cho chế độ đối soát, số chênh lệch và khóa sổ. |

Bộ trình duyệt dùng bốn tài khoản thử qua Keycloak. [Hướng dẫn và ảnh](../../../docs/guides/nguoi-dung/san-pham-va-nghiem-thu.md).

Ở đường B06, chuyên viên chọn **Điều phối nghiệm thu** và thư ký mở phiếu nháp từ **Chấm nghiệm thu**. Khi thư ký vừa phát sinh xung đột, lần lưu tiếp theo trả 404 và màn hình gỡ cả phiếu. Sau khi khôi phục tư cách chấm, điểm vẫn là 8 như lần lưu hợp lệ cuối. Khi gửi thành công, thẻ biến mất khỏi trang chủ. [Ca liên thông](acceptance.ts) · [Ảnh thẻ cá nhân](../../../docs/reviews/screenshots/acceptance/thanh-vien-viec-nghiem-thu.png)
