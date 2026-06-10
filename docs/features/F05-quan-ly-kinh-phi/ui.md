---
title: "Quản lý kinh phí — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-09
---

# Quản lý kinh phí — Giao diện

> Một web app duy nhất; màn hình & hành động hiển thị **theo phân quyền (RBAC)** — xem
> [ADR-0009](../../architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md). Chỉ mô tả phần
> **đặc thù giao diện**. Luật nghiệp vụ → xem `./spec.md`.

## 1. Đối tượng & phân quyền

- **Chủ nhiệm đề tài** (nhà khoa học): xem kinh phí được giao, khoán kinh phí theo khoản mục, đợt cấp,
  dự toán vs thực chi của đề tài mình, giải trình khoản chi, đính chứng từ. **Không** chạy đối soát,
  **không** đổi `reconciliationStatus`, **không** sửa dự toán/khoán kinh phí (BR-08). Vào từ "Đề tài của
  tôi" → đề tài `IN_PROGRESS`/`SUSPENDED`/`PASSED` → tab **Kinh phí**.
- **Chuyên viên QL KHCN:** lập khoán kinh phí theo khoản mục, theo dõi đợt cấp kinh phí, ghi giao dịch
  cấp/chi, chạy đối soát (API hoặc nhập file), xử lý giao dịch `MISMATCHED`, quyết toán & đóng đề tài.
  Phạm vi theo đơn vị/kỳ được phân.
- **Quản trị hệ thống:** xem; cấu hình tham số kinh phí qua B01 (`BUDGET.OVER_BUDGET_MODE`...).

Đăng nhập qua SSO. Cùng một web app — mỗi vai trò thấy đúng tập màn hình/hành động theo quyền; backend
là lớp bảo vệ thật.

### Ma trận phân quyền (Permission matrix)

Quyền nguyên tử dạng `MODULE.ACTION`. UI chỉ ẩn/hiện theo quyền.

| Hành động | Quyền | Chuyên viên QL KHCN | Quản trị hệ thống | Chủ nhiệm |
|-----------|-------|:-------------------:|:-----------------:|:---------:|
| Xem kinh phí đề tài | `BUDGET.VIEW` | ✓ | ✓ | chỉ của mình |
| Lập/sửa khoán kinh phí/dự toán | `BUDGET.ESTIMATE` | ✓ | – | – |
| Lập/sửa đợt cấp kinh phí | `BUDGET.ALLOCATION` | ✓ | – | – |
| Ghi/sửa giao dịch cấp/chi | `BUDGET.TRANSACTION` | ✓ | – | – |
| Chạy đối soát (API) | `BUDGET.RECONCILE` | ✓ | – | – |
| Nhập file đối soát (degrade) | `BUDGET.RECONCILE_FILE` | ✓ | – | – |
| Xử lý giao dịch `MISMATCHED` | `BUDGET.RESOLVE_MISMATCH` | ✓ | – | – |
| Quyết toán & đóng đề tài | `BUDGET.SETTLE` | ✓ | – | – |
| Giải trình khoản chi / đính chứng từ | — | – | – | ✓ (đề tài của mình) |

## 2. Danh sách màn hình

Phân theo nhóm quyền; tất cả nằm trong cùng một web app.

### 2.1 Nhóm người dùng cuối

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| FE-01 | Tổng quan kinh phí đề tài | Kinh phí được giao, khoán theo khoản mục vs thực chi, tỷ lệ giải ngân, cảnh báo vượt |
| FE-02 | Đợt cấp & giao dịch | Danh sách `BudgetAllocation`/`BudgetTransaction`, trạng thái đối soát; giải trình & đính chứng từ |

### 2.2 Nhóm quản trị

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| BO-01 | Khoán kinh phí đề tài | Lập/sửa `BudgetEstimate` theo khoản mục và `settlementMode` |
| BO-02 | Đợt cấp kinh phí | Lập/theo dõi `BudgetAllocation` theo kế hoạch và thực tế |
| BO-03 | Sổ giao dịch kinh phí | Ghi/sửa `BudgetTransaction` cấp/chi, lọc theo trạng thái đối soát |
| BO-04 | Đối soát | Chạy đối soát API hoặc nhập file; xem kết quả khớp/lệch |
| BO-05 | Xử lý chênh lệch | Danh sách giao dịch `MISMATCHED`; điều chỉnh/khớp lại/đánh dấu giải quyết kèm lý do |
| BO-06 | Quyết toán & đóng đề tài | Kiểm tra điều kiện, quyết toán, chuyển `PASSED → COMPLETED` |

## 3. Mô tả màn hình & thao tác

Wireframe đặt trong `./assets/` (bổ sung khi có), link Figma nếu có.

### FE-01 — Tổng quan kinh phí đề tài
- Thẻ tổng: kinh phí được giao từ F04 (`approvedBudget`), tổng khoán/dự toán, tổng đã cấp, tổng chi, còn lại
  (định dạng VND).
- Bảng theo khoản mục: `estimatedAmount`, `settlementMode` (`LUMP_SUM`/`ACTUAL_EXPENSE`/`MIXED`), tổng đã chi,
  còn lại, % giải ngân; tô cảnh báo khi chi vượt/đạt ngưỡng.
- Chỉ đọc; mọi số liệu lấy từ backend (chủ nhiệm không sửa).
- **Trạng thái rỗng:** chưa có dự toán → "Chưa có dự toán cho đề tài." **Đang tải:** skeleton. **Lỗi:** thử lại.

### FE-02 — Đợt cấp & giao dịch
- Bảng `BudgetAllocation`: `allocationNo`, `plannedDate`, `actualDate`, `amount`, `status`
  (`PLANNED`/`DISBURSED`/`CANCELLED`).
- Bảng `BudgetTransaction`: `date`, `budgetLine`, `type` (DISBURSEMENT/EXPENSE), `amount`, `reconciliationStatus`
  (`UNRECONCILED`/`MATCHED`/`MISMATCHED` — gắn nhãn màu).
- Với mỗi giao dịch chi, đặc biệt khoản `ACTUAL_EXPENSE`: chủ nhiệm có thể **giải trình** (nhập diễn giải)
  và **đính chứng từ** (`Attachment`).
- Hiển thị giao dịch `MISMATCHED` nổi bật kèm ghi chú "đang chờ chuyên viên xử lý".
- Giao dịch thuộc đề tài `COMPLETED` ở chế độ khóa, chỉ đọc (BR-10).

### BO-01 — Khoán kinh phí đề tài
- Chỉ thao tác khi đề tài `IN_PROGRESS` (BR-01); hiển thị `ProjectAssignment.approvedBudget` từ F04
  làm trần tổng khoán (BR-12); nhập `budgetLine`, `estimatedAmount` (validate số nguyên VND > 0, BR-02) và
  `settlementMode` (`LUMP_SUM`/`ACTUAL_EXPENSE`/`MIXED`, BR-13); hiển thị tổng dự toán và phần còn lại so với
  kinh phí được giao.

### BO-02 — Đợt cấp kinh phí
- Lập các `BudgetAllocation`: `allocationNo`, `amount`, `plannedDate`; cập nhật `DISBURSED` khi cấp
  thực tế, nhập `actualDate` và liên kết/tạo giao dịch `DISBURSEMENT`; tổng đợt cấp đã giải ngân không vượt
  tổng dự toán/khoán (BR-14).

### BO-03 — Sổ giao dịch kinh phí
- Thêm giao dịch `DISBURSEMENT`/`EXPENSE`, `budgetLine`, `amount`, `date`, `financeTransactionCode` (tùy chọn).
  Khi chi vượt dự toán khoản mục: theo `BUDGET.OVER_BUDGET_MODE` → cảnh báo hoặc chặn (BR-03). Giao
  dịch mới ở `UNRECONCILED`.

### BO-04 — Đối soát
- Nút **Đối soát qua API**; nếu API lỗi/không sẵn sàng → **Nhập file CSV/Excel** (BR-05). Kết
  quả: khớp → `MATCHED`, lệch/không tìm thấy → `MISMATCHED`; chặn khớp trùng `financeTransactionCode` (BR-09); phát
  thông báo chênh lệch (BR-06).

### BO-05 — Xử lý chênh lệch
- Với mỗi `MISMATCHED`: điều chỉnh giao dịch để khớp lại, hoặc đánh dấu **đã giải quyết** kèm `reason`
  (→ `MATCHED`, BR-05/AC-05).

### BO-06 — Quyết toán & đóng đề tài
- Chỉ bật khi đề tài `PASSED` và **không còn** giao dịch `MISMATCHED` (BR-07); nếu còn → liệt kê giao
  dịch cần xử lý và chặn. Với khoản `ACTUAL_EXPENSE`, hiển thị giao dịch thiếu chứng từ để chặn/cảnh báo theo
  quy chế (BR-13). Quyết toán → chuyển `PASSED → COMPLETED` (domain service, phối hợp F06).

## 4. Thông báo & trạng thái

| Tình huống | Thông báo |
|---|---|
| Đính chứng từ thành công | "Đã lưu chứng từ cho giao dịch." |
| Phát hiện chênh lệch đối soát | "Giao dịch ngày {date} có chênh lệch, đang được xử lý." (B04) |
| Đợt cấp kinh phí đã giải ngân | "Đợt cấp kinh phí {allocationNo} đã được ghi nhận." |
| Đề tài được quyết toán & đóng | "Đề tài đã được quyết toán và hoàn thành." |
| Cố sửa dự toán/đối soát | (Ẩn nút) — không khả dụng với chủ nhiệm |

## 5. Audit & nhật ký

Ghi `AuditLog` cho: lập/sửa khoán kinh phí/dự toán, lập/sửa/hủy/cập nhật đợt cấp kinh phí, ghi/sửa giao
dịch, chạy đối soát (API/file), xử lý lệch (kèm `reason`), quyết toán & đóng đề tài (BR-11). Append-only,
xem được theo phạm vi dữ liệu.

## 6. Liên kết AC

| Màn hình | AC liên quan (spec) |
|---|---|
| FE-01 | AC-01 (xem khoán kinh phí), AC-09 (cảnh báo vượt), AC-11 (chỉ thấy đề tài của mình), AC-14 (không vượt kinh phí giao) |
| FE-02 | AC-02 (xem giao dịch chi), AC-03 (trạng thái đối soát), AC-10 (không được đối soát/sửa dự toán), AC-15 (xem đợt cấp), AC-16 (chứng từ khoản thực thanh) |
| BO-01 | AC-01 (lập khoán kinh phí), AC-08 (số tiền không hợp lệ), AC-12 (chặn khi chưa thực hiện), AC-14 (vượt kinh phí giao) |
| BO-02 | AC-15 (lập và ghi nhận đợt cấp kinh phí) |
| BO-03 | AC-02 (ghi chi trong dự toán), AC-08, AC-09 (vượt dự toán theo cấu hình), AC-12 |
| BO-04 | AC-03 (đối soát API), AC-04 (nhập file degrade), AC-13 (mã trùng) |
| BO-05 | AC-05 (xử lý lệch) |
| BO-06 | AC-06 (quyết toán & đóng), AC-07 (chặn khi còn MISMATCHED), AC-16 (thiếu chứng từ khoản thực thanh) |
| (RBAC chung) | AC-10, AC-11 (sai quyền / sai phạm vi) |
