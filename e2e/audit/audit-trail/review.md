# US-04 · Quyền hiện tại và bằng chứng tại thời điểm chuyển bước

| Ca | Kết quả |
|---|---|
| TC-01 | Chuyên viên U chuyển bước bằng kernel P01. Mở liên kết của đề tài thấy lý do đã lưu, khoa và người thực hiện. |
| TC-02 | U mất phạm vi khoa, mở cùng URL nhận trạng thái hồ sơ không khả dụng. Màn hình không chứa tên hồ sơ. |
| TC-03 | V còn phạm vi khoa cũ. Cùng liên kết trả đúng sự kiện của U và tên khoa gốc. |
| TC-04 | Chuyên viên tenant B mở ID A trong tenant B. Phản hồi không có dữ liệu. |

Cụm PostgreSQL tạm chạy bằng role runtime. Sau một lệnh bị rollback số sự kiện giữ nguyên. UPDATE và DELETE nhật ký bị DB từ chối. Cửa sổ thời gian ngoài dữ liệu trả tổng 0. [Ca trình duyệt và liên kết cũ](acceptance.spec.ts) · [Ca DB](../../../apps/backend/test/db/audit-trail.test.mjs) · [Transaction P01](../../../apps/backend/test/db/workflow.test.mjs) · [Ảnh theo quyền](../../../docs/guides/nguoi-dung/chuyen-vien-tra-lich-su.md)
