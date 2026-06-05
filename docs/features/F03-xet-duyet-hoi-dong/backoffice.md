---
title: "Xét duyệt hội đồng — BackOffice (quản trị)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
version: 0.1
updated: 2026-06-01
---

# Xét duyệt hội đồng — Mặt quản trị

> Chỉ mô tả phần **đặc thù quản trị**. Luật nghiệp vụ → xem [`spec.md`](./spec.md).

## 1. Vai trò sử dụng

Hai vai trò ([personas](../../product/personas.md)):

- **Chuyên viên QL KHCN** — tổ chức xét duyệt: lập `EvaluationCommittee` (type `PROPOSAL_REVIEW`), phân công
  `CommitteeMember`, tạo `EvaluationRound` cho từng đề tài, theo dõi tiến độ chấm, xem bảng tổng hợp
  điểm và ra kết luận `APPROVED`/`REJECTED` theo ngưỡng.
- **Thành viên hội đồng** — chuyên gia chấm điểm: xem hồ sơ đề tài được phân công, điền `ScoreSheet`
  theo `EvaluationCriterion`, gửi phiếu. **Không** lập hội đồng, **không** ra kết luận (BR-09).

## 2. Phân quyền (Permission matrix)

Quyền nguyên tử RBAC ở backend (overview §4.1). FE/BO chỉ ẩn/hiện theo quyền.

| Hành động | Chuyên viên QL KHCN | Thành viên hội đồng |
|-----------|:-------------------:|:-------------------:|
| Xem danh sách hội đồng & đợt đánh giá | ✓ | – |
| Lập / sửa hội đồng (`EvaluationCommittee` PROPOSAL_REVIEW) | ✓ | – |
| Phân công thành viên (`CommitteeMember`) | ✓ | – |
| Tạo `EvaluationRound` (mở xét duyệt → đề tài `UNDER_REVIEW`) | ✓ | – |
| Xem hồ sơ đề tài được phân công chấm | ✓ | ✓ (chỉ đề tài được giao, trừ xung đột lợi ích — BR-03) |
| Tạo/sửa `ScoreSheet` của chính mình (DRAFT) | – | ✓ |
| Gửi phiếu (`DRAFT → SUBMITTED`) | – | ✓ |
| Xem bảng tổng hợp điểm (`aggregateScore`) | ✓ | – |
| Ra kết luận `APPROVED`/`REJECTED` | ✓ | – |
| Mở lại đợt đã kết luận (có `reason`) | ✓ | – |

> Quyền tham chiếu B03: vd `EVALUATION_COMMITTEE.MANAGE`, `EVALUATION_ROUND.CREATE`, `SCORE_SHEET.SCORE`,
> `EVALUATION_ROUND.CONCLUDE`. Tên quyền cụ thể chốt cùng B03.

## 3. Danh sách màn hình

| Mã MH | Tên màn hình | Vai trò | Mục đích |
|-------|--------------|---------|----------|
| BO-01 | Quản lý hội đồng xét duyệt | Chuyên viên | Lập/sửa `EvaluationCommittee` PROPOSAL_REVIEW, phân công thành viên & chức danh |
| BO-02 | Mở & theo dõi đợt đánh giá | Chuyên viên | Tạo `EvaluationRound` cho đề tài, theo dõi tiến độ thu phiếu |
| BO-03 | Bảng tổng hợp điểm & kết luận | Chuyên viên | Xem `aggregateScore`, kiểm tra đủ phiếu, ra kết luận APPROVED/REJECTED |
| BO-04 | Hàng chờ chấm của tôi | Thành viên HĐ | Danh sách đề tài cần chấm (đã loại trừ xung đột lợi ích) |
| BO-05 | Màn hình chấm điểm (ScoreSheet) | Thành viên HĐ | Đọc hồ sơ, nhập điểm từng tiêu chí + nhận xét, gửi phiếu |

## 4. Mô tả màn hình & thao tác

### BO-01 — Quản lý hội đồng xét duyệt (Chuyên viên)
- Danh sách `EvaluationCommittee` type `PROPOSAL_REVIEW` với bộ lọc theo trạng thái/kỳ nhận đề xuất.
- Form lập/sửa hội đồng: mã, tên, trường `type` cố định `PROPOSAL_REVIEW`.
- Phân công thành viên: chọn `User` + `committeeRole` (`CHAIR`/`REVIEWER`/`MEMBER`/`SECRETARY`);
  chặn trùng người (unique cặp khóa, data-model §5).
- Trạng thái: rỗng ("chưa có hội đồng"), đang tải, lỗi.

### BO-02 — Mở & theo dõi đợt đánh giá (Chuyên viên)
- Chọn các đề tài `SUBMITTED` (đã chốt danh sách F01) gắn vào hội đồng → tạo `EvaluationRound` cho từng đề tài.
- Khi tạo: hệ thống lấy `CriteriaSet` từ kỳ nhận đề xuất của đề tài (BR-02), chặn nếu chưa gán bộ tiêu chí;
  chuyển `ResearchProject` sang `UNDER_REVIEW` (BR-01) và gửi thông báo chủ nhiệm.
- Bảng theo dõi tiến độ: mỗi đề tài hiển thị số phiếu `SUBMITTED` / tổng thành viên hợp lệ (đã trừ xung đột
  lợi ích), cảnh báo nếu chưa đủ `MIN_SUBMITTED_SCORE_SHEETS`.
- Hành động hàng loạt: tạo đợt đánh giá cho nhiều đề tài cùng lúc.

### BO-03 — Bảng tổng hợp điểm & kết luận (Chuyên viên)
- Hiển thị từng đề tài: danh sách phiếu `SUBMITTED` (ẩn/hiện danh tính theo cấu hình), `totalScore` từng phiếu,
  `aggregateScore` (BR-06), so với `PASSING_SCORE`.
- Nút "Ra kết luận": chỉ bật khi đủ phiếu (BR-07); kết luận tự gợi ý PASSED/FAILED theo ngưỡng (BR-08),
  chuyên viên xác nhận. Sau xác nhận: `EvaluationRound=CONCLUDED`, `ResearchProject=APPROVED|REJECTED`, thông báo chủ nhiệm.
- Nếu thiếu phiếu: nút bị khóa + thông báo số phiếu còn thiếu (AC-05).
- "Mở lại đợt": yêu cầu nhập `reason`, ghi audit (BR-10).

### BO-04 — Hàng chờ chấm của tôi (Thành viên hội đồng)
- Danh sách `EvaluationRound` mà thành viên được phân công và đang `COLLECTING_SCORES`; **không** hiển thị đề tài
  xung đột lợi ích (BR-03) và đề tài đã `CONCLUDED`.
- Mỗi dòng: tên đề tài, kỳ nhận đề xuất, trạng thái phiếu của tôi (`Chưa chấm`/`Nháp`/`Đã gửi`).

### BO-05 — Màn hình chấm điểm (Thành viên hội đồng)
- Trái: hồ sơ đề tài (thuyết minh, tài liệu đính kèm — chỉ đọc). Phải: form `ScoreSheet`.
- Form: mỗi `EvaluationCriterion` một dòng nhập `score` (gợi ý khoảng `[0, maxScore]`), ô `comment` chung.
- Validate phía người dùng: số trong khoảng, không bỏ trống tiêu chí; backend kiểm tra lại (BR-05).
- Lưu nháp (`DRAFT`, sửa được) → Gửi (`SUBMITTED`, khóa). Sau khi gửi, form chuyển chỉ đọc (BR-10).
- Chặn tạo phiếu thứ hai cho cùng đợt (BR-04); chặn nếu đợt đã `CONCLUDED` (AC-10).

## 5. Audit & nhật ký

Ghi `AuditLog` (append-only, overview §4.2) cho các hành động:

| Hành động | Người thực hiện | Đối tượng |
|---|---|---|
| Lập / sửa hội đồng, phân công thành viên | Chuyên viên | `EvaluationCommittee`, `CommitteeMember` |
| Tạo đợt đánh giá (đề tài vào `UNDER_REVIEW`) | Chuyên viên | `EvaluationRound`, `ResearchProject` |
| Gửi phiếu chấm (`DRAFT → SUBMITTED`) | Thành viên HĐ | `ScoreSheet` |
| Ra kết luận (`APPROVED`/`REJECTED`) | Chuyên viên | `EvaluationRound`, `ResearchProject` |
| Mở lại đợt đã kết luận (kèm `reason`) | Chuyên viên | `EvaluationRound` |

Ai xem được nhật ký: chuyên viên (trong phạm vi đơn vị/kỳ) và admin (B03). Thành viên hội đồng không
xem nhật ký xét duyệt của người khác.

## 6. Liên kết AC

| Màn hình | AC liên quan (xem [spec §6](./spec.md#6-acceptance-criteria)) |
|----------|----------------------------------------------------------------|
| BO-01 | AC-01 (tiền đề: có hội đồng + thành viên), AC-09 (sai quyền lập HĐ) |
| BO-02 | AC-01 (tạo đợt → `UNDER_REVIEW`), AC-06 (loại trừ xung đột lợi ích khỏi tiến độ) |
| BO-03 | AC-03 (kết luận APPROVED), AC-04 (kết luận REJECTED), AC-05 (thiếu phiếu), AC-09 (sai quyền kết luận), AC-10 (khóa sau kết luận) |
| BO-04 | AC-06 (ẩn đề tài xung đột lợi ích) |
| BO-05 | AC-02 (chấm & gửi phiếu), AC-07 (điểm vượt maxScore), AC-08 (một thành viên một phiếu), AC-10 (đợt đã kết luận) |
