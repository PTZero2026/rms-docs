---
title: "Xét duyệt hội đồng — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-09
---

# Xét duyệt hội đồng — Giao diện

> Một web app duy nhất; màn hình & hành động hiển thị **theo phân quyền (RBAC)** — xem
> [ADR-0009](../../architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md). Chỉ mô tả phần
> **đặc thù giao diện**. Luật nghiệp vụ → xem `./spec.md`.

## 1. Đối tượng & phân quyền

- **Chủ nhiệm đề tài** (nhà khoa học) — xem [personas](../../product/personas.md#chủ-nhiệm-đề-tài).
  **Không** tham gia chấm điểm; chỉ **theo dõi tiến trình và kết quả** xét duyệt đề tài của mình:
  - Xem trạng thái đề tài đang `UNDER_REVIEW` / `APPROVED` / `REJECTED`.
  - Nhận thông báo khi đề tài vào xét duyệt và khi có kết luận.
  - Xem nhận xét của hội đồng **nếu được công khai** (BR-11), với danh tính người chấm ẩn.
  - **Lối vào:** từ danh sách đề tài của tôi (F01) → chi tiết đề tài → tab "Xét duyệt"; hoặc từ chuông
    thông báo (B04) bấm vào liên kết kết quả.
- **Chuyên viên QL KHCN** — tổ chức xét duyệt: lập `EvaluationCommittee` (type `PROPOSAL_REVIEW`), phân công
  `CommitteeMember`, tạo `EvaluationRound` cho từng đề tài, theo dõi tiến độ chấm, xem bảng tổng hợp
  điểm và ra kết luận `APPROVED`/`REJECTED` theo ngưỡng.
- **Thành viên hội đồng** — chuyên gia chấm điểm: xem hồ sơ đề tài được phân công, điền `ScoreSheet`
  theo `EvaluationCriterion`, gửi phiếu. **Không** lập hội đồng, **không** ra kết luận (BR-09).

Đăng nhập qua SSO. Cùng một web app — mỗi vai trò thấy đúng tập màn hình/hành động theo quyền; backend
là lớp bảo vệ thật.

### Ma trận phân quyền (Permission matrix)

Quyền nguyên tử RBAC ở backend (overview §4.1). Web app/UI chỉ ẩn/hiện theo quyền.

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

## 2. Danh sách màn hình

Phân theo nhóm quyền; tất cả nằm trong cùng một web app.

### 2.1 Nhóm người dùng cuối / thành viên hội đồng

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| FE-01 | Tiến trình xét duyệt (trong chi tiết đề tài) | Hiển thị trạng thái xét duyệt hiện tại và mốc thời gian |
| FE-02 | Kết quả xét duyệt | Xem kết luận APPROVED/REJECTED, điểm tổng hợp (nếu công khai) và nhận xét hội đồng (nếu công khai) |
| FE-03 | Thông báo kết quả (in-app) | Banner/mục thông báo khi đề tài vào xét duyệt hoặc có kết luận |
| BO-04 | Hàng chờ chấm của tôi | Danh sách đề tài cần chấm (đã loại trừ xung đột lợi ích) — thành viên hội đồng |
| BO-05 | Màn hình chấm điểm (ScoreSheet) | Đọc hồ sơ, nhập điểm từng tiêu chí + nhận xét, gửi phiếu — thành viên hội đồng |

### 2.2 Nhóm quản trị

| Mã MH | Tên màn hình | Vai trò | Mục đích |
|-------|--------------|---------|----------|
| BO-01 | Quản lý hội đồng xét duyệt | Chuyên viên | Lập/sửa `EvaluationCommittee` PROPOSAL_REVIEW, phân công thành viên & chức danh |
| BO-02 | Mở & theo dõi đợt đánh giá | Chuyên viên | Tạo `EvaluationRound` cho đề tài, theo dõi tiến độ thu phiếu |
| BO-03 | Bảng tổng hợp điểm & kết luận | Chuyên viên | Xem `aggregateScore`, kiểm tra đủ phiếu, ra kết luận APPROVED/REJECTED |

## 3. Mô tả màn hình & thao tác

Wireframe đặt trong `./assets/` (bổ sung khi có), link Figma nếu có.

### FE-01 — Tiến trình xét duyệt
- Là một tab/section trong màn chi tiết đề tài (F01). Chỉ hiển thị khi đề tài đã từng vào xét duyệt
  (`UNDER_REVIEW` trở đi).
- Thành phần: chip trạng thái (`Đang xét duyệt` / `Đã duyệt` / `Từ chối`); timeline mốc:
  "Vào xét duyệt" (ngày tạo `EvaluationRound`), "Có kết luận" (ngày `CONCLUDED`).
- Trạng thái:
  - **Đang tải:** skeleton timeline.
  - **Rỗng / chưa xét duyệt:** ẩn tab hoặc hiển thị "Đề tài chưa vào vòng xét duyệt".
  - **Lỗi:** "Không tải được tiến trình xét duyệt" + nút thử lại.
- Chủ nhiệm **chỉ đọc** — không có hành động nào trên màn này.

### FE-02 — Kết quả xét duyệt
- Hiển thị khi đề tài đã `APPROVED` hoặc `REJECTED`.
- Thành phần:
  - Kết luận nổi bật: "Đề tài được duyệt" / "Đề tài không được duyệt".
  - `aggregateScore` — **chỉ hiển thị nếu** cấu hình công khai cho phép; nếu không, ẩn điểm.
  - Khối "Nhận xét hội đồng" — **chỉ hiển thị khi** `PROPOSAL_REVIEW.PUBLIC_COMMENTS=true` (BR-11);
    danh tính người chấm ẩn (hiển thị "Thành viên hội đồng 1/2/..." hoặc gộp chung).
  - Với `APPROVED`: ghi chú "đề tài sẽ được chuyển sang giai đoạn thực hiện" (F04).
- Trạng thái:
  - **Chưa có kết luận:** điều hướng về FE-01 (đang xét duyệt).
  - **Nhận xét bị ẩn:** hiển thị "Hội đồng không công khai nhận xét cho đợt này".
  - **Lỗi:** thông báo lỗi + thử lại.

### FE-03 — Thông báo kết quả (in-app)
- Mục thông báo (chuông) nhận sự kiện từ B04: "Đề tài *X* đã vào vòng xét duyệt", "Đề tài *X* đã được
  duyệt", "Đề tài *X* không được duyệt".
- Bấm thông báo → mở FE-01/FE-02 tương ứng. Đánh dấu đã đọc khi mở.

> Không có validate nhập liệu ở các màn theo dõi của chủ nhiệm (màn hình thuần đọc). Mọi luật hiển thị/ẩn
> dữ liệu do backend quyết định theo cấu hình & quyền (overview §4.1).

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

## 4. Thông báo & trạng thái

| Tình huống | Thông báo hiển thị |
|---|---|
| Đề tài vào xét duyệt | "Đề tài của bạn đã được đưa vào vòng xét duyệt hội đồng." |
| Có kết luận APPROVED | "Chúc mừng! Đề tài *X* đã được hội đồng thông qua." |
| Có kết luận REJECTED | "Đề tài *X* không được hội đồng thông qua." |
| Nhận xét không công khai | "Hội đồng không công khai nhận xét cho đợt xét duyệt này." |
| Lỗi tải dữ liệu | "Không tải được thông tin xét duyệt, vui lòng thử lại." |

- **Trạng thái rỗng/đang tải/lỗi:** áp dụng cho cả các màn quản trị (BO-01..BO-05) — danh sách trống,
  skeleton/spinner, banner lỗi + thử lại.

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
| FE-01 | AC-01 (vào xét duyệt → hiển thị trạng thái `UNDER_REVIEW`) |
| FE-02 | AC-03 (kết quả APPROVED), AC-04 (kết quả REJECTED), liên quan BR-11 (công khai nhận xét) |
| FE-03 | AC-01, AC-03, AC-04 (thông báo các sự kiện trạng thái cho chủ nhiệm) |
| BO-01 | AC-01 (tiền đề: có hội đồng + thành viên), AC-09 (sai quyền lập HĐ) |
| BO-02 | AC-01 (tạo đợt → `UNDER_REVIEW`), AC-06 (loại trừ xung đột lợi ích khỏi tiến độ) |
| BO-03 | AC-03 (kết luận APPROVED), AC-04 (kết luận REJECTED), AC-05 (thiếu phiếu), AC-09 (sai quyền kết luận), AC-10 (khóa sau kết luận) |
| BO-04 | AC-06 (ẩn đề tài xung đột lợi ích) |
| BO-05 | AC-02 (chấm & gửi phiếu), AC-07 (điểm vượt maxScore), AC-08 (một thành viên một phiếu), AC-10 (đợt đã kết luận) |
