---
title: "Nghiệm thu — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-09
---

# Nghiệm thu — Giao diện

> Một web app duy nhất; màn hình & hành động hiển thị **theo phân quyền (RBAC)** — xem
> [ADR-0009](../../architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md). Chỉ mô tả phần
> **đặc thù giao diện**. Luật nghiệp vụ → xem `./spec.md`.

## 1. Đối tượng & phân quyền

- **Chủ nhiệm đề tài** (nhà khoa học): đăng ký nghiệm thu, nộp hồ sơ cuối, theo dõi lịch & kết quả
  nghiệm thu. Vào từ "Đề tài của tôi" → đề tài `IN_PROGRESS`/`PENDING_ACCEPTANCE`/`UNDER_ACCEPTANCE` →
  tab **Nghiệm thu**. Chỉ đăng ký & nộp hồ sơ (BR-11).
- **Thành viên đề tài** (nhà khoa học): xem trạng thái & kết quả nghiệm thu của đề tài mình tham gia.
- **Chuyên viên QL KHCN:** lập hội đồng `type=ACCEPTANCE`, phân công thành viên, mở đợt đánh giá, ra
  kết luận `PASSED`/`FAILED`, cho làm lại. Phạm vi dữ liệu theo đơn vị được phân công (B03).
- **Thành viên hội đồng:** chỉ chấm `ScoreSheet` cho đề tài được phân công, trừ trường hợp xung đột
  lợi ích (BR-03, BR-11).

Đăng nhập qua SSO. Cùng một web app — mỗi vai trò thấy đúng tập màn hình/hành động theo quyền; backend
là lớp bảo vệ thật.

### Ma trận phân quyền (Permission matrix)

Quyền nguyên tử dạng `MODULE.ACTION`. UI chỉ ẩn/hiện theo quyền; tách bạch quyền theo BR-11.

| Hành động | Chuyên viên QL KHCN | Thành viên hội đồng | Chủ nhiệm | Thành viên đề tài |
|-----------|:-------------------:|:-------------------:|:---------:|:-----------------:|
| Đăng ký nghiệm thu, nộp hồ sơ cuối | – | – | ✓ | – |
| Xem trạng thái/kết quả nghiệm thu | ✓ | ✓ (đề tài được phân công) | của mình | của mình |
| Lập hội đồng `ACCEPTANCE`, phân công thành viên | ✓ | – | – | – |
| Mở đợt đánh giá (`EvaluationRound`) | ✓ | – | – | – |
| Chấm & gửi phiếu (`ScoreSheet`) | – | ✓ (trừ xung đột lợi ích) | – | – |
| Ra kết luận `PASSED`/`FAILED` | ✓ | – | – | – |
| Cho làm lại (`FAILED → IN_PROGRESS`) | ✓ | – | – | – |
| Mở lại đợt sau kết luận | ✓ | – | – | – |

> Xung đột lợi ích (BR-03): thành viên hội đồng là chủ nhiệm/thành viên đề tài bị ẩn khỏi hàng chờ và
> chặn tạo `ScoreSheet`. Đóng đề tài `PASSED → COMPLETED` phối hợp với F05 (BR-09), không thuộc thao tác
> giao diện riêng F06.

## 2. Danh sách màn hình

Phân theo nhóm quyền; tất cả nằm trong cùng một web app. Giữ nguyên mã màn hình gốc.

### 2.1 Nhóm người dùng cuối (chủ nhiệm / thành viên đề tài)

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| FE-01 | Đăng ký nghiệm thu | Kiểm tra điều kiện, nộp hồ sơ cuối, gửi đăng ký |
| FE-02 | Theo dõi nghiệm thu | Trạng thái đề tài, lịch hội đồng, kết quả `PASSED`/`FAILED` + nhận xét (nếu công khai) |

### 2.2 Nhóm quản trị (chuyên viên QL KHCN / thành viên hội đồng)

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| BO-01 | Hàng chờ nghiệm thu | Danh sách đề tài `PENDING_ACCEPTANCE`/`UNDER_ACCEPTANCE`; lập hội đồng, mở đợt, ra kết luận |
| BO-02 | Lập hội đồng & phân công | Tạo `EvaluationCommittee` type `ACCEPTANCE`, phân công `CommitteeMember` |
| BO-03 | Mở đợt đánh giá | Tạo `EvaluationRound` type `ACCEPTANCE` với bộ tiêu chí nghiệm thu |
| BO-04 | Chấm điểm (thành viên hội đồng) | Nhập `CriterionScore` + nhận xét, gửi phiếu `ScoreSheet` |
| BO-05 | Tổng hợp & kết luận | Theo dõi phiếu, `aggregateScore`, ra kết luận `PASSED`/`FAILED`, cho làm lại |

## 3. Mô tả màn hình & thao tác

Wireframe đặt trong `./assets/` (bổ sung khi có), link Figma nếu có.

### FE-01 — Đăng ký nghiệm thu
- Bảng **điều kiện** (checklist): kỳ báo cáo cuối đã `PASSED`? đủ sản phẩm cam kết `APPROVED`? — hiển thị
  rõ mục nào chưa đạt và link tới F04/F07 để bổ sung (BR-01).
- Khu vực nộp **hồ sơ nghiệm thu cuối** (`Attachment`): kéo-thả, validate dung lượng/định dạng.
- Nút **Gửi đăng ký** chỉ bật khi đủ điều kiện → `ResearchProject: IN_PROGRESS → PENDING_ACCEPTANCE`.
- **Trạng thái rỗng/lỗi:** nếu chưa đủ điều kiện, nút bị vô hiệu kèm giải thích.

### FE-02 — Theo dõi nghiệm thu
- Hiển thị trạng thái đề tài theo chuỗi nghiệm thu; lịch họp/đợt đánh giá (thời điểm, hội đồng — ẩn danh
  tính người chấm nếu cấu hình ẩn).
- Khi có kết luận: hiển thị `PASSED`/`FAILED`; nếu `FAILED` kèm **thời hạn làm lại** và hướng dẫn;
  nhận xét hội đồng hiển thị khi `ACCEPTANCE.PUBLIC_COMMENTS=true`.
- **Đang tải:** skeleton; **Lỗi:** thông báo + thử lại.

### BO-01 — Hàng chờ nghiệm thu
- **Bộ lọc:** trạng thái đề tài (`PENDING_ACCEPTANCE`/`UNDER_ACCEPTANCE`/`PASSED`/`FAILED`), đơn vị, từ
  khóa. **Phạm vi dữ liệu:** chỉ đề tài trong đơn vị được phân công của chuyên viên (B03).
- **Bảng:** mã/tên đề tài, chủ nhiệm, trạng thái, hội đồng (đã lập chưa), đợt đánh giá, số phiếu
  `SUBMITTED`/tối thiểu. Điều hướng tới các thao tác BO-02/BO-03/BO-05 theo trạng thái & quyền.
- **Trạng thái rỗng/tải/lỗi:** "Chưa có đề tài chờ nghiệm thu"; skeleton; banner lỗi + thử lại.

### BO-02 — Lập hội đồng & phân công
- Tạo `EvaluationCommittee` type `ACCEPTANCE`; tìm và thêm `CommitteeMember`, gán `committeeRole`.
- **Xung đột lợi ích:** cảnh báo/chặn khi thành viên là `principalInvestigatorId` hoặc có trong
  `ProjectMember` của đề tài (BR-03) → AC-08.
- Áp dụng cho đề tài `PENDING_ACCEPTANCE`; cần ≥ 1 thành viên trước khi mở đợt (BR-02).

### BO-03 — Mở đợt đánh giá
- Tạo `EvaluationRound` type `ACCEPTANCE`, lấy `CriteriaSet` type `ACCEPTANCE` (cấu hình B01) — BR-02.
- Yêu cầu đề tài `PENDING_ACCEPTANCE` và đã có hội đồng `ACCEPTANCE` ≥ 1 thành viên. Mở đợt →
  `ResearchProject: PENDING_ACCEPTANCE → UNDER_ACCEPTANCE`, đợt `COLLECTING_SCORES`, gửi thông báo lịch
  cho chủ nhiệm (B04) → AC-02.

### BO-04 — Chấm điểm (thành viên hội đồng)
- Hàng chờ chấm: chỉ đề tài được phân công, **ẩn** đề tài xung đột lợi ích (BR-03) → AC-08.
- Nhập `CriterionScore` cho mọi tiêu chí và nhận xét; validate `0 ≤ score ≤ maxScore` (BR-05). Vượt
  `maxScore` → lỗi validate, phiếu giữ `DRAFT` → AC-09.
- **Gửi phiếu:** đủ điểm mọi tiêu chí → `ScoreSheet: DRAFT → SUBMITTED`, tính `totalScore` theo trọng
  số (BR-06), khóa phiếu → AC-03.
- Khi `EvaluationRound=CONCLUDED`: chặn gửi/sửa phiếu (BR-12) → AC-12.

### BO-05 — Tổng hợp & kết luận
- Theo dõi số phiếu `SUBMITTED`/tối thiểu (`ACCEPTANCE.MIN_SUBMITTED_SCORE_SHEETS`) và `aggregateScore`
  (trung bình `totalScore` các phiếu, làm tròn 2 chữ số — BR-06).
- **Ra kết luận:** chỉ khi đủ phiếu (BR-07); thiếu phiếu → chặn, báo số phiếu thiếu, không đổi trạng thái
  → AC-06. So `aggregateScore` với `ACCEPTANCE.PASSING_SCORE` (BR-08): ≥ ngưỡng → `PASSED`
  (`UNDER_ACCEPTANCE → PASSED`); ngược lại → `FAILED`; đặt `EvaluationRound=CONCLUDED`.
- **Đạt:** sau khi F05 xác nhận quyết toán xong (không còn `MISMATCHED`) → `PASSED → COMPLETED` (BR-09);
  cố đóng khi còn `MISMATCHED` → chặn, yêu cầu xử lý quyết toán trước → AC-10. → AC-04.
- **Không đạt:** cho làm lại kèm `reason` & **thời hạn** → `FAILED → IN_PROGRESS`, tăng số lần làm lại,
  không vượt `ACCEPTANCE.MAX_REDO_COUNT`, ghi audit (BR-10) → AC-05.
- **Mở lại đợt sau kết luận:** chỉ chuyên viên, kèm `reason`, ghi `AuditLog` (BR-12).

## 4. Thông báo & trạng thái

| Tình huống | Thông báo |
|---|---|
| Đăng ký nghiệm thu thành công | "Đề tài đã chuyển sang chờ nghiệm thu." |
| Chưa đủ điều kiện | (Chặn) "Chưa đủ điều kiện nghiệm thu: {danh sách thiếu}." (AC-07) |
| Có lịch nghiệm thu | "Đề tài của bạn sẽ được hội đồng nghiệm thu đánh giá." (B04) |
| Mở đợt nghiệm thu thành công | "Đã mở đợt nghiệm thu cho đề tài." (AC-02) |
| Điểm vượt khung | "Điểm phải nằm trong khoảng [0, {maxScore}]." (AC-09) |
| Thiếu phiếu khi kết luận | (Chặn) "Chưa đủ phiếu chấm để kết luận (cần thêm {n} phiếu)." (AC-06) |
| Kết luận đạt | "Đề tài đã nghiệm thu ĐẠT." |
| Kết luận không đạt | "Đề tài chưa đạt, được làm lại đến {hạn}." |
| Còn giao dịch MISMATCHED khi đóng | (Chặn) "Cần xử lý quyết toán (còn giao dịch chưa khớp) trước khi đóng đề tài." (AC-10) |
| Sai quyền | "Bạn không có quyền thực hiện thao tác này." (AC-11) |
| Khóa sau kết luận | "Đợt đánh giá đã kết luận, không thể gửi/sửa phiếu." (AC-12) |

- **Trạng thái rỗng:** hàng chờ trống, chưa có hội đồng/đợt/phiếu — đều có minh họa + hướng dẫn.
- **Đang tải:** skeleton/spinner cho danh sách, form, upload.
- **Lỗi:** lỗi mạng/máy chủ → banner + "Thử lại"; lỗi nhập liệu → inline cạnh trường.

## 5. Audit & nhật ký

Ghi `AuditLog` (append-only) cho mọi hành động đổi trạng thái/quan trọng:

| Hành động | Ghi nhận |
|-----------|----------|
| Đăng ký nghiệm thu | `IN_PROGRESS → PENDING_ACCEPTANCE`, người đăng ký, hồ sơ cuối |
| Mở đợt đánh giá | `PENDING_ACCEPTANCE → UNDER_ACCEPTANCE`, `evaluationRoundId`, người mở |
| Gửi phiếu | `ScoreSheet` `DRAFT → SUBMITTED`, `totalScore`, người chấm |
| Ra kết luận | `conclusion=PASSED/FAILED`, `aggregateScore`, ngưỡng, người kết luận |
| Cho làm lại | `FAILED → IN_PROGRESS`, `reason`, thời hạn, số lần làm lại (BR-10) |
| Mở lại đợt | `reopenReason`, người thực hiện (BR-12) |
| Đóng đề tài | `PASSED → COMPLETED` (phối hợp F05, BR-09) |

- Quyền xem nhật ký: chuyên viên (phạm vi của mình) và quản trị.
- Mọi chuyển trạng thái đi qua domain service chung (acceptance service), không update enum trực tiếp.

## 6. Liên kết AC

| Màn hình | AC liên quan |
|----------|--------------|
| FE-01 | AC-01, AC-07 |
| FE-02 | AC-04, AC-05 |
| BO-01 | AC-02, AC-04, AC-05, AC-06 |
| BO-02 | AC-08 |
| BO-03 | AC-02 |
| BO-04 | AC-03, AC-08, AC-09, AC-12 |
| BO-05 | AC-04, AC-05, AC-06, AC-10, AC-11, AC-12 |
