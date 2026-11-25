# RV-10 · 24/11/2026

| Ca | Kết quả |
|---|---|
| TC-01 | Lưu nháp có một điểm. Chrome gửi thiếu bị chặn, gửi đủ điểm 10 và 2,5 được 7,00. Gửi lại sau khóa trả 409. Điểm 11/10 bị từ chối; bản nháp còn nguyên. |
| TC-02 | Chủ nhiệm kiêm ghế hội đồng không thấy việc và không gửi được phiếu. |
| TC-03 | Người phản biện lưu nháp rồi được thêm vào nhóm đề tài. Gửi lại trả 404, mất việc trong hàng chờ, phiếu không tham gia quyết định. |
| TC-04 | PUT phiếu cùng ID từ trường B trả 404. |

Chạy cùng lượt 15 ca DB, 12 ca Chrome của [RV-09](../open-review/review.md). [Ca DB](../../../apps/backend/test/db/review.test.mjs) · [Ca Chrome](../open-review/acceptance.spec.ts)
