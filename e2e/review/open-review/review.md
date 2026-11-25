# RV-09 · 24/11/2026

Chạy `bash apps/backend/test/db/run.sh --oidc` với Keycloak, Mailpit, Redis, S3 và Chrome local. Bộ PostgreSQL đạt 15/15, vòng Chrome đạt 12/12. Fixture trình duyệt đăng nhập bằng email OTP ở hai realm, nhập mã riêng theo trường và gọi service F01 để nộp hồ sơ.

| Ca | Kết quả |
|---|---|
| TC-01 | Chuyên viên chốt đề xuất của kỳ đã đóng, chọn hội đồng và mở đợt. API lấy bộ tiêu chí từ snapshot của kỳ. Chủ nhiệm kiêm thành viên hội đồng bị loại khỏi danh sách được chấm. |
| TC-02 | Người chỉ có ghế chấm gọi lệnh mở/lập hội đồng bị từ chối. Kỳ đang mở hoặc đề tài chưa chốt bị chặn. |
| TC-03 | Hai chuyên viên khác tài khoản mở đồng thời, cùng nhận một round ID. Mỗi đề tài chỉ có một sự kiện UNDER_REVIEW. |
| TC-04 | Tài khoản trường B không mở được vòng của trường A. |

[Ca PostgreSQL](../../../apps/backend/test/db/review.test.mjs) · [Luồng Chrome](acceptance.spec.ts) · [Hướng dẫn và ảnh](../../../docs/guides/nguoi-dung/xet-duyet-hoi-dong.md)
