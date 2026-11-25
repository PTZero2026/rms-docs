---
title: "Nghiệm thu — kế hoạch kiểm thử"
spec: "./spec.md"
owner: "QA nghiệp vụ"
status: Review
updated: 2026-11-24
---

# Nghiệm thu cuối kỳ

Dựng một đề tài đang thực hiện, kỳ cuối, sản phẩm đã duyệt, một hội đồng nghiệm thu có người xung đột, và một chuyên viên. Chạy từng ca với bộ dữ liệu riêng để kết luận trước không khóa phiếu của ca sau.

| Ca | AC | Given | When | Then |
|---|---|---|---|---|
| TC-01 | AC-01 | đề tài `IN_PROGRESS` có kỳ báo cáo cuối `PASSED` và đủ sản phẩm cam kết `APPROVED` | chủ nhiệm đăng ký nghiệm thu và nộp hồ sơ cuối | `ResearchProject` chuyển `PENDING_ACCEPTANCE`, chuyên viên nhận thông báo, ghi audit. |
| TC-02 | AC-02 | đề tài `PENDING_ACCEPTANCE` và đã có hội đồng `ACCEPTANCE` ≥ 1 thành viên | chuyên viên tạo `EvaluationRound` type `ACCEPTANCE` | đợt `COLLECTING_SCORES`, `ResearchProject` chuyển `UNDER_ACCEPTANCE`, chủ nhiệm nhận thông báo lịch. |
| TC-03 | AC-03 | thành viên không xung đột lợi ích, đợt `COLLECTING_SCORES` | nhập đủ điểm mọi tiêu chí (trong `[0, maxScore]`) và gửi | `ScoreSheet` `DRAFT → SUBMITTED`, tính `totalScore`, khóa phiếu. |
| TC-04 | AC-04 | đủ phiếu, `aggregateScore ≥ PASSING_SCORE` | chuyên viên ra kết luận, rồi F05 xác nhận quyết toán xong | `conclusion=PASSED`, `ResearchProject` `PASSED`, sau quyết toán chuyển `COMPLETED`, thông báo chủ nhiệm. |
| TC-05 | AC-05 | đủ phiếu, `aggregateScore < PASSING_SCORE` | chuyên viên ra kết luận `FAILED` rồi cho làm lại kèm lý do & thời hạn | `ResearchProject` `FAILED → IN_PROGRESS`, tăng số lần làm lại, ghi audit (BR-10). |
| TC-06 | AC-06 | số phiếu `SUBMITTED` < `MIN_SUBMITTED_SCORE_SHEETS` | chuyên viên cố ra kết luận | chặn, báo số phiếu thiếu, không đổi trạng thái (BR-07). |
| TC-07 | AC-07 | đề tài `IN_PROGRESS` chưa có kỳ cuối `PASSED` hoặc thiếu sản phẩm cam kết | chủ nhiệm đăng ký nghiệm thu | chặn, nêu điều kiện thiếu, giữ `IN_PROGRESS` (BR-01). |
| TC-08 | AC-08 | thành viên hội đồng là chủ nhiệm/thành viên đề tài | mở hàng chờ chấm | đề tài đó bị ẩn và chặn tạo `ScoreSheet` (BR-03). |
| TC-09 | AC-09 | thành viên nhập `score > maxScore` | gửi phiếu | lỗi validate, phiếu giữ `DRAFT` (BR-05). |
| TC-10 | AC-10 | đề tài `PASSED`, đã bật đối soát. Thử riêng `UNRECONCILED`, `MISMATCHED` và cả hai | chuyên viên cố đóng đề tài | giữ `PASSED`, nêu từng khoản vướng cùng trạng thái, sổ chưa khóa (BR-09, F05 BR-07). |
| TC-11 | AC-11 | người dùng là Thành viên hội đồng (không phải chuyên viên) | gọi hành động ra kết luận/lập hội đồng/cho làm lại | 403, không thực hiện (BR-11). |
| TC-12 | AC-12 | `EvaluationRound=CONCLUDED` | thành viên cố gửi/sửa phiếu | bị từ chối (BR-12). |

Với TC-04, thử cả pilot đã rà thủ công và đơn vị bật đối soát có mọi khoản `MATCHED`. TC-10 đối chiếu từng khoản chặn với TC-03 của [US-24](../../../specs/024-shared-close-project/quickstart.md). QA lưu số phiếu, trạng thái trước/sau và sự kiện audit cho từng ca. [Nguồn AC](spec.md)

## Ca biên theo quyết định triển khai

| Ca | AC nguồn | Điều kiện | Thao tác | Kết quả |
|---|---|---|---|---|
| TC-13 · [US-22/TC-03](../../../specs/022-web-request-acceptance/quickstart.md) | AC-07 | Cam kết một bài và một sáng chế, đã duyệt hai bài | đăng ký nghiệm thu | nêu thiếu sáng chế và giữ IN_PROGRESS |
| TC-14 · [US-23/TC-03](../../../specs/023-shared-acceptance-result/quickstart.md) | AC-06 | Đợt nghiệm thu thiếu một phiếu, đề tài có một phiếu xét duyệt đầu vào | chốt kết luận | vẫn thiếu một phiếu, chưa chuyển PASSED |

### Ngoại lệ sau kết luận · BR-12

Chuyên viên gửi hai lệnh mở lại cùng phiên bản. Kiểm một dòng lịch sử, một lần mở lại, lý do và đúng điểm/ngưỡng ban đầu. Chốt lại bằng màn hình cũ nhận 409. Tải lại vòng rồi chốt theo phiên bản mới. Khi hồ sơ đã đi tiếp, kiểm người nhận đính chính trong B04 và trạng thái đề tài. [Ca dữ liệu F06](../../../apps/backend/test/db/acceptance.test.mjs) · [Luồng chuyên viên trên trình duyệt](../../../e2e/acceptance/request-acceptance/acceptance.ts)
