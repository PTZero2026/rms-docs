# US-03 · Hồ sơ cũ và mới sau khi kích hoạt mẫu

| Ca | Chứng cứ |
|---|---|
| TC-01 / TC-03 | Cơ sở dữ liệu thật. X tới bước duyet ở v1 trước khi kích hoạt v2. Y tạo sau đó tới duyet ở v2. Cùng lệnh chapnhan đưa X tới duyetcu, Y tới duyetmoi. Ở bước cuối dong, X vẫn v1, Y vẫn v2 và cả hai hết cạnh tiếp. |
| TC-02 | Xóa semantic của duyet làm validator trả 400 kèm mã bước. Cạnh có đích thiếu làm lệnh kích hoạt bị từ chối. Chrome sửa và kích hoạt v2, sau đó xóa bước đang có cạnh và thử v3. Mẫu đang dùng vẫn là v2. |
| TC-04 | Admin trường 2 gọi đường dẫn mẫu của trường 1 nhận 401. Các lượt đọc instance dùng cùng kiểm quyền hồ sơ với P02, gồm nhánh sai tenant trả 404. |

[Ca phiên bản trên DB](../../../apps/backend/test/db/workflow.test.mjs) · [Ca UI và API](acceptance.spec.ts) · [Hướng dẫn chủ quy trình](../../../docs/guides/nguoi-dung/chu-quy-trinh.md)
