# RV-17 · Nộp báo cáo

PostgreSQL nhận ở 23:59:59.999 giờ Việt Nam đúng ngày hạn; gửi sau một giây được ghi trễ. Thử khi SUSPENDED bị chặn. Khi chuyên viên yêu cầu sửa với nhận xét, chủ nhiệm được gửi phiên bản tiếp theo và hệ thống giữ nội dung lần nộp trước. Kỳ PASSED khóa sửa; lệnh mở lại yêu cầu lý do. Ca sai trường nhận 404. Chrome tải file báo cáo mới vào S3, nộp trễ, xem giờ nhận, chuyên viên duyệt đạt. [Ca DB](../../../apps/backend/test/db/progress.test.mjs) · [Hướng dẫn kèm ảnh](../../../docs/guides/nguoi-dung/giao-de-tai-va-bao-cao-tien-do.md)
