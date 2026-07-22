---
title: "Kế hoạch kiểm thử tích hợp — luồng phức tạp & đa vai trò"
id: "integration-test-plan"
status: Draft
updated: 2026-07-10
---

# Kế hoạch kiểm thử tích hợp (RMS)

> Tập trung các **đường nối giữa feature** và **ranh giới phân quyền** — nơi luật bất biến
> ([AGENTS §4](../../AGENTS.md)) và gate đa nghiệp vụ dễ vỡ. Bổ sung cho test-plan từng feature
> (kiểm 1 feature), tài liệu này kiểm **phối hợp nhiều feature / nhiều vai trò**.
> Hiện thực Playwright: `e2e/tests/06-integration.spec.ts`.

## Quy ước trạng thái tự động hóa
| Nhãn | Nghĩa |
|---|---|
| 🟢 AUTO | Đã hiện thực chạy được trên môi trường dùng thử hiện tại (read-only, không phá dữ liệu) |
| 🟡 FIXME | Đã scaffold `test.fixme()` — chờ feature dựng xong / cần tạo dữ liệu có kiểm soát |
| ⚪ MANUAL | Chỉ nghiệm thu thủ công (transaction/atomicity, RLS đa tenant, số liệu công thức PO chốt) |

> Nguyên tắc: **không mutate dữ liệu pilot Thủy Lợi** (dùng chung với Trường). Các TC cần ghi dữ liệu
> chạy trên **tenant test BKA** (`bka-uni`, `nckh.vnest.vn`) — không đụng pilot.
>
> **Tenant ghi dữ liệu = BKA.** Fixtures `bkaAuthorPage` / `bkaAdminPage` (baseURL BKA + tài khoản
> `bka.author` / `bka.admin`). Đã kiểm: BKA hỗ trợ đủ luồng tạo đề tài → chuyển trạng thái → **tự xoá**
> (nút trang "Xoá" → modal "Xóa"), self-clean sạch. INT-01 gate đã chạy thật trên BKA (mặc định, không
> cần cờ). Các TC nhóm B còn lại mở khoá theo cách này: viết theo bước đã ghi, dùng `bkaAuthorPage` +
> helper `createBasicProject`/`deleteProject` (`lib/project-helpers.ts`).

> **Phạm vi hiện thực (chỉ đạo 2026-07-10):** không chờ **F04** (tiến độ) và **F08** (lý lịch);
> triển khai các luồng đa vai trò khả thi ngay. Đã hiện thực AUTO nhóm read-only đa vai trò
> (scope, IDOR, guard, loại E4, audit trail, **F04**). Nhóm cần **ghi dữ liệu** (tạo kỳ/đề tài/hội đồng/chấm
> điểm) vẫn FIXME — không ghi vào pilot dùng chung với Trường; chạy khi có **tenant test riêng đã seed**.
>
> **✅ F04 đã BẬT (xác minh UI 2026-07-10):** chi tiết đề tài có tab **Giao/Khoán** (khu *Hồ sơ Giao/Khoán*,
> nút *Thêm mới*) và **Tiến độ** (khu *Báo cáo tiến độ*, nút *Tạo các kỳ*). Đề tài *Đang triển khai* mở
> **"Chuyển trạng thái"** cho transition **"Gửi nghiệm thu"** (bề mặt workflow P01 → cổng F06). Do đó
> INT-01/02/06 **không còn bị chặn bởi feature**, chỉ còn cần ghi dữ liệu. Còn lại: F08-hiển-thị (INT-09 phần F08).

## Ma trận ưu tiên
| TC | Luồng | Rủi ro | Trạng thái | Ghi chú blocker |
|---|---|---|---|---|
| INT-01 | Cổng nghiệm thu — gate vòng đời (P01) | 🔴 | 🟢 AUTO¹ | chạy trên **BKA**, tạo→gate→tự xoá |
| INT-01+ | F04→F07→F06→F05 gate sản phẩm/MISMATCHED đầy đủ | 🔴 | 🟡 FIXME | cần lifecycle duyệt (chạy trên **BKA**) |
| INT-02 | F04→F05 trần khoán + phí quản lý | 🟠 | 🟡 FIXME | ghi dữ liệu (F04 đã bật) |
| INT-03 | F03 xung đột lợi ích ⇒ dưới ngưỡng phiếu | 🔴 | 🟡 FIXME | ghi dữ liệu (tenant test) |
| INT-04 | F03/F06 hai `type` không lẫn | 🟠 | 🟡 FIXME | ghi dữ liệu (tenant test) |
| INT-05 | F03 hội đồng đạo đức song song (AND) | 🔴 | 🟡 FIXME | ghi dữ liệu (tenant test) |
| INT-06 | On-behalf thư ký ủy quyền + audit | 🟠 | 🟡 FIXME | ghi dữ liệu (F04 đã bật) |
| INT-07 | F02↔F01 đóng băng cấu hình kỳ | 🟠 | 🟡 FIXME | ghi dữ liệu (tenant test) |
| INT-08 | F01 mã đề tài bất biến qua nộp lại | 🟠 | 🟡 FIXME | ghi dữ liệu (tenant test) |
| INT-09 | F09/F11→P03→F08 giờ giảng idempotent/thu hồi | 🔴 | 🟡 FIXME | ghi dữ liệu + **F08** (phần hiển thị) |
| INT-10 | F10/F11→P03 phân bổ đa vai trò =100% | 🟠 | 🟡 FIXME | ghi dữ liệu (tenant test) |
| INT-11 | P01+P02 nguyên tử workflow+audit | 🔴 | ⚪ MANUAL | tầng DB/service |
| INT-12 | RLS + phạm vi + deep-link + IDOR | 🔴 | 🟢 AUTO | a/b/d chạy; RLS 2-tenant manual |
| INT-13 | F06 làm lại có giới hạn `MAX_REDO_COUNT` | 🟠 | 🟡 FIXME | ghi dữ liệu (tenant test) |
| INT-14 | Loại đề tài E4 khả dụng ở luồng tạo (VP-FEAT) | 🟠 | 🟢 AUTO | read-only |
| INT-15 | Dấu vết audit (tab Lịch sử) trên đề tài | 🟠 | 🟢 AUTO | read-only |
| INT-16 | F04 tiến độ/giao-khoán bật + bề mặt workflow P01 | 🔴 | 🟢 AUTO | read-only, không commit |

### Đã hiện thực & PASS trên môi trường dùng thử (`e2e/tests/06-integration.spec.ts`)
- **INT-12a** — giảng viên `/projects` thấy ít đề tài hơn admin (phạm vi dữ liệu).
- **INT-12b** — giảng viên deep-link `/users`, `/councils`, `/users/author-requests` → "Không đủ quyền truy cập".
- **INT-12d** — giảng viên deep-link **UUID đề tài không thuộc mình** → "Không có quyền xem đề tài này" (chặn tầng dữ liệu / IDOR, không chỉ route).
- **INT-14** — luồng tạo đề tài cung cấp đủ 4 loại: cấp cơ sở, **cấp trên (F09)**, **sinh viên (F10)**, **phục vụ sản xuất (F11)** ⇒ E4 bật.
- **INT-15** — chi tiết đề tài có tab **Lịch sử** mở được (chứng cứ audit P02).
- **INT-16a** — đề tài *Đang triển khai* có tab **Giao/Khoán** (*Hồ sơ Giao/Khoán*) + **Tiến độ** (*Báo cáo tiến độ*, nút *Tạo các kỳ*) ⇒ F04 bật.
- **INT-16b** — mở **"Chuyển trạng thái"** thấy transition **"Gửi nghiệm thu"** (bề mặt workflow P01, cổng F04→F06); đóng dialog, không commit.
- **INT-05s** (BKA, read-only) — form "Tạo hội đồng" có cả **Hội đồng khoa học** + **Hội đồng đạo đức** ⇒ hệ thống hỗ trợ hội đồng song song (nền của điều kiện AND — ADR-0003).
- **INT-07s** (BKA, read-only) — form "Tạo đợt đăng ký" đủ trường cấu hình (Mã đợt, Loại đề tài, ngày Mở/Đóng, Thành viên min/max) — cấu hình sẽ bị đóng băng sau khi có đề tài nộp.

> **Nhóm B (INT-02..INT-13):** hạ tầng ghi dữ liệu đã sẵn trên **BKA** (`bkaAuthorPage`/`bkaAdminPage` +
> `lib/project-helpers.ts`). Đã phủ: INT-01 (gate, chạy thật) + INT-05s/07s (bề mặt cấu hình, read-only).
> Phần **hành vi stateful đầy đủ** (freeze sau submit, xung đột-dưới-ngưỡng, kết luận AND, idempotent
> giờ giảng, redo-limit) giữ `test.fixme` trong `10-groupB-surface-bka.spec.ts` — mở khoá bằng cách seed
> dữ liệu (đề tài SUBMITTED/APPROVED, hội đồng, chấm điểm) trên BKA; lưu ý các state này KHÔNG xoá được
> qua UI nên cần tenant/DB resettable.
- **INT-01**¹ (`e2e/tests/07-int01-gate.spec.ts`, chạy khi `RMS_MUTATE=1`) — tạo đề tài cấp cơ sở (nhãn `E2E-TEST-`), mở "Chuyển trạng thái": chỉ có **"Gửi duyệt"**, KHÔNG "Gửi nghiệm thu"/"Hoàn thành" ⇒ workflow P01 chặn nhảy bước (nền tảng cổng nghiệm thu); **tự xoá** đề tài ở `finally`.
  - ¹ Chỉ phủ *gate thứ tự vòng đời*. Các sub-gate "thiếu sản phẩm cam kết" / "còn MISMATCHED" (INT-01+) cần đề tài đã duyệt & đang thực hiện → tenant test seed.

---

## A. Chuỗi gate đa nghiệp vụ

### INT-01 — Cổng vào nghiệm thu: kỳ cuối + sản phẩm cam kết + quyết toán 🔴 🟡
- **Luồng:** F04 → F07 → F06 → F05 · **Vai trò:** chủ nhiệm, chuyên viên, hội đồng, tài chính
- **Tiền đề:** đề tài `IN_PROGRESS`, có bộ sản phẩm cam kết.
- **Bước & kỳ vọng:**
  1. Kỳ cuối F04 `PASSED` nhưng sản phẩm cam kết F07 chưa đủ `APPROVED` → chuyển `PENDING_ACCEPTANCE` **BỊ CHẶN**.
  2. Duyệt đủ sản phẩm cam kết (đúng loại + số lượng) → cho vào nghiệm thu.
  3. Hội đồng `ACCEPTANCE` `PASSED` → thử `COMPLETED` khi F05 còn giao dịch `MISMATCHED` → **CHẶN**.
  4. Quyết toán hết `MISMATCHED` → `PASSED→COMPLETED`.
- **BR/luật:** F04 BR-10 · F06 BR-01, BR-09 · F07 BR-11 · [ADR-0004](../architecture/decisions/0004-doi-soat-kinh-phi-qua-api.md)
- **Vì sao dễ lỗi:** 3 feature khóa chung một cổng; `ExpectedOutput` (sản phẩm cam kết) chưa chốt cấu trúc; chủ sở hữu `PASSED→COMPLETED` chưa rõ (F05/F06).

### INT-02 — Trần khoán `approvedBudget` xuyên F04→F05 + phí quản lý không hồi tố 🟠 🟡
- **Vai trò:** chuyên viên, chủ nhiệm, quản trị
- **Bước:**
  1. Giao đề tài kèm `approvedBudget` → F05 xác nhận cấp một lần, tổng ≤ `approvedBudget`.
  2. Phí quản lý flat-rate `min(floor(cấp×rate), cap)` tách khỏi kinh phí thực hiện.
  3. Ghi chi vượt kinh phí thực hiện → **chỉ cảnh báo, vẫn ghi**.
  4. Quản trị sửa `rate` → đề tài đã tính **KHÔNG hồi tố**.
- **BR/luật:** F04 BR-15 · F05 BR-03, BR-08, BR-10 · [AGENTS §4.5](../../AGENTS.md) (tiền VND bigint)
- **Vì sao dễ lỗi:** trần truyền qua feature; ranh giới cảnh báo-không-chặn; không hồi tố cấu hình.

## B. Hội đồng dùng chung + phân quyền

### INT-03 — Xung đột lợi ích ⇒ tụt dưới ngưỡng phiếu tối thiểu 🔴 🟡
- **Vai trò:** chuyên viên, nhiều thành viên hội đồng
- **Bước:**
  1. Thành viên hội đồng đồng thời là thành viên/chủ nhiệm đề tài → **ẩn khỏi hàng chờ + chặn tạo phiếu**.
  2. Sau khi loại, số người còn lại `< MIN_SUBMITTED_SCORE_SHEETS` → **không cho kết luận**.
  3. `aggregateScore` chỉ trung bình phiếu `SUBMITTED`; `totalScore = Σ(score×weight)`.
- **BR/luật:** F03 BR-03, BR-04, BR-06, BR-07 · [ADR-0003](../architecture/decisions/0003-mo-hinh-hoi-dong-dung-chung.md)
- **Vì sao dễ lỗi:** **open-point trong docs** — công thức số phiếu tối thiểu khi có xung đột lợi ích chưa chốt.

### INT-04 — Cùng model hội đồng, hai `type` không lẫn (F03 ↔ F06) 🟠 🟡
- **Bước:** cùng một đề tài lần lượt có `EvaluationRound` type `PROPOSAL_REVIEW` (F03) rồi `ACCEPTANCE` (F06); phiếu/tiêu chí/ngưỡng hai vòng **độc lập**, không rò chéo.
- **BR/luật:** [ADR-0003](../architecture/decisions/0003-mo-hinh-hoi-dong-dung-chung.md) · F06 BR-02..BR-08
- **Vì sao dễ lỗi:** dùng chung bảng phân biệt bằng `type` → dễ query lẫn round.

### INT-05 — Hội đồng đạo đức chạy song song (điều kiện AND) 🔴 🟡
- **Bước:** đề tài `SUBMITTED` → hội đồng khoa học (`PROPOSAL_REVIEW`) + hội đồng đạo đức (`ETHICS_REVIEW`) song song; `APPROVED` **chỉ khi CẢ HAI** đạt; một bên chưa đạt → **không APPROVED**.
- **BR/luật:** F03 (đạo đức song song) · [ADR-0003](../architecture/decisions/0003-mo-hinh-hoi-dong-dung-chung.md) · data-model `EvaluationRound.type=ETHICS_REVIEW`
- **Vì sao dễ lỗi:** docs gap rõ (F03 AC 10 < BR 11; mô hình cuộc họp/biên bản + đạo đức song song chưa hoàn thiện) → dễ `APPROVED` khi mới 1 hội đồng.

### INT-06 — On-behalf: thư ký ủy quyền cập nhật thay chủ nhiệm 🟠 🟡
- **Bước:**
  1. Thư ký nộp báo cáo tiến độ / sửa hồ sơ **thay** chủ nhiệm → `AuditLog` ghi `actorId=thư ký`, `onBehalfOf=chủ nhiệm`.
  2. Thư ký thử xác nhận cấp kinh phí (quyền chuyên viên) → **CHẶN**.
- **BR/luật:** P02 BR-04 · [ADR-0010](../architecture/decisions/0010-chuan-du-lieu-cho-ai-tham-gia.md) (actor model) · F04 BR-03/BR-05
- **Vì sao dễ lỗi:** phân biệt actor thật vs `onBehalfOf`; ranh giới quyền ủy quyền dễ nới nhầm.

## C. Đóng băng cấu hình theo kỳ

### INT-07 — Kỳ đóng băng sau khi có đề tài `SUBMITTED` 🟠 🟡
- **Bước:**
  1. Kỳ `OPEN`, biểu mẫu + `reviewCriteriaSetId` đã ghim; có ≥1 đề tài `SUBMITTED`.
  2. Sửa biểu mẫu/tiêu chí kỳ → **CHẶN**; chỉ cho **gia hạn `endDate`** về tương lai.
  3. Hủy kỳ có `SUBMITTED` → **CHẶN** (phải `CLOSED`, không `CANCELLED`).
  4. Nộp đề tài sau khi kỳ `CLOSED`/quá hạn → **CHẶN**.
- **BR/luật:** F02 BR-05, BR-06, BR-07 · F01 BR-01
- **Vì sao dễ lỗi:** biểu mẫu/tiêu chí ghim theo kỳ; đóng băng có điều kiện dễ lọt sửa cấu hình.

### INT-08 — Mã đề tài bất biến qua trả-bổ-sung / nộp lại 🟠 🟡
- **Bước:** nộp → chuyên viên **trả bổ sung** (`SUBMITTED→DRAFT` + lý do, còn hạn) → sửa → nộp lại → **mã đề tài KHÔNG đổi**; field khóa/mở đúng theo trạng thái; quá hạn kỳ → không mở lại.
- **BR/luật:** F01 BR-05, BR-06, BR-07
- **Vì sao dễ lỗi:** sinh mã idempotent + khóa field theo state.

## D. E4 — quy đổi giờ giảng

### INT-09 — Idempotent + thu hồi giờ giảng (F09/F11→P03→F08) 🔴 🟡
- **Bước:**
  1. Duyệt đầu mục F09 (`ON_APPROVE`) → P03 tạo `TeachingHourRecord` idempotent theo `(tenantId, sourceType, sourceId, eventKey)` → F08 hiển thị.
  2. Duyệt lại / tính lại → **KHÔNG nhân đôi giờ**.
  3. Thu hồi đầu mục đã duyệt (`APPROVED→DRAFT`) → P03 **điều chỉnh/gỡ giờ** + audit → F08 cập nhật.
  4. Công thức áp theo `sourceOccurredAt`, không theo ngày tính lại.
- **BR/luật:** F09 BR-04, BR-05, BR-06 · P03 BR-03, BR-08 · [ADR-0012](../architecture/decisions/0012-ranh-gioi-loi-vs-cau-hinh-tenant.md)
- **Vì sao dễ lỗi:** đồng bộ 3 tầng; idempotency key; điều chỉnh hồi tố; công thức theo hiệu lực thời điểm; số liệu công thức chưa chốt (seed).

### INT-10 — Phân bổ giờ đa vai trò tổng = 100% 🟠 🟡
- **Bước:** đầu mục nhiều người + `contributionRatio` → P03 phân bổ theo `allocationRule`; tổng tỷ lệ = 100%; sai tổng → chặn/cảnh báo.
- **BR/luật:** P03 BR-05 · VP-TH-ALLOC ([variation-points](../architecture/variation-points.md))
- **Vì sao dễ lỗi:** phân bổ đa vai trò; quy tắc chưa chốt.

## E. Nền tảng xuyên suốt

### INT-11 — Nguyên tử: workflow + audit cùng transaction 🔴 ⚪
- **Bước:** chuyển trạng thái mà guard/effect fail giữa chừng → rollback toàn bộ, **KHÔNG** để lại `AuditLog`/`WorkflowHistory` "ma"; khi thành công thì `status`+`statusSemantic`+`WorkflowHistory`+`AuditLog` cùng commit.
- **BR/luật:** P01 (kernel 1 transaction) · P02 BR-03 · [ADR-0007](../architecture/decisions/0007-workflow-engine-dong-per-tenant.md)
- **Vì sao dễ lỗi:** biên transaction; mirror status/statusSemantic. **Kiểm ở tầng tích hợp DB/service, không qua UI** → MANUAL.

### INT-12 — RLS đa tenant + phạm vi dữ liệu + deep-link guard 🔴 🟢
- **Bước & kỳ vọng:**
  1. Giảng viên `/projects` chỉ thấy đề tài của mình (scope) — số dòng < admin. ✅ AUTO
  2. Giảng viên deep-link route quản trị (`/users`, `/councils`, `/users/author-requests`) → **"Không đủ quyền truy cập"**. ✅ AUTO
  3. Tenant A không thấy dữ liệu tenant B (RLS `app.current_tenant`). ⚪ MANUAL (cần 2 tenant).
- **BR/luật:** [AGENTS §4.1](../../AGENTS.md) (phân quyền backend) · [ADR-0005](../architecture/decisions/0005-sso-va-rbac.md), [ADR-0009](../architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md) · VP-SCOPE
- **Vì sao dễ lỗi:** enforcement phải ở backend, không chỉ UI; RLS + scope đơn vị dễ rò.

### INT-13 — Làm lại nghiệm thu có giới hạn 🟠 🟡
- **Bước:** `FAILED→IN_PROGRESS` cho làm lại `≤ ACCEPTANCE.MAX_REDO_COUNT`; vượt → chặn; mỗi lần qua domain service + audit.
- **BR/luật:** F06 BR-10
- **Vì sao dễ lỗi:** đếm số lần làm lại; vòng lặp state dễ không chặn.

## F. Đa vai trò read-only (đã AUTO)

### INT-14 — Loại đề tài mở rộng E4 khả dụng ở luồng tạo 🟠 🟢
- **Bước:** mở `/projects/create` → hiển thị bộ chọn "Chọn loại đề tài" với đủ **Đề tài cấp cơ sở**, **Đề tài cấp trên** (F09), **Đề tài sinh viên** (F10), **Dự án phục vụ sản xuất** (F11).
- **BR/luật:** VP-FEAT ([ADR-0012](../architecture/decisions/0012-ranh-gioi-loi-vs-cau-hinh-tenant.md)) — E4 bật cho tenant Thủy Lợi.
- **Vì sao đáng kiểm:** xác nhận cấu hình bật E4 đúng; nếu tắt nhầm sẽ thiếu loại.

### INT-15 — Dấu vết audit trên đề tài 🟠 🟢
- **Bước:** mở chi tiết đề tài (`/projects/<uuid>`) → tab **Lịch sử** hiển thị & mở được.
- **BR/luật:** P02 (audit append-only, dùng chung) · [ADR-0010](../architecture/decisions/0010-chuan-du-lieu-cho-ai-tham-gia.md).
- **Vì sao đáng kiểm:** chứng cứ mọi chuyển trạng thái để lại dấu vết truy hồi.

---

## Phát hiện trong lúc khảo sát môi trường dùng thử (2026-07-10)

> ⚠️ **Route `/meetings/create` chưa chặn ở tầng điều hướng cho giảng viên.**
> Menu "Tạo cuộc họp" bị ẩn với giảng viên (đúng), nhưng deep-link `/meetings/create`
> vẫn **render form "Tạo cuộc họp mới"** thay vì trả "Không đủ quyền truy cập" như
> `/users`, `/councils`, `/users/author-requests`.
>
> Theo [AGENTS §4.1](../../AGENTS.md), phân quyền phải ở backend; UI chỉ ẩn/hiện. Việc form
> hiển thị **chưa** là lỗ hổng nếu API `POST` tạo cuộc họp bị backend từ chối — nhưng route
> nên chặn nhất quán như các trang quản trị khác. **Cần xác minh:** submit form này với
> tài khoản giảng viên có bị backend chặn không. Ghi nhận ở `e2e/tests/06-integration.spec.ts`
> (`INT-12c`, hiện `fixme` chờ xác minh hành vi backend).

## Kịch bản thao tác thủ công — các TC đang skip

> Neo vào giao diện thật môi trường dùng thử (khảo sát 2026-07-10). Màn hình đã xác nhận: đăng nhập,
> Đăng ký đề tài (`/projects/create`, 4 loại), Danh sách đề tài (`/projects`), Đợt đăng ký
> (`/projects/rounds`, nút *Tạo mới*), Quản lý Hội đồng (`/councils`, *Tạo hội đồng*), Cuộc họp
> (`/meetings`, *Tạo cuộc họp*), chi tiết đề tài (tab *Thuyết minh / Thành viên / Lịch sử*), Quy đổi
> giờ giảng (`/teaching-hours`). Các màn hình **F04 tiến độ · F05 kinh phí · F06 nghiệm thu · F07 sản
> phẩm · F08 lý lịch** ⇒ đánh dấu *(khi module dựng xong)*.
>
> Tài khoản: **admin** `tuanphamhong@gmail.com` · **giảng viên** `tuanph@vnpay.vn` · OTP `123456`.

### INT-12c — Giảng viên deep-link `/meetings/create` phải bị chặn
1. Đăng nhập **giảng viên**.
2. Dán thẳng URL `…/meetings/create` vào trình duyệt (menu "Tạo cuộc họp" không hiện với giảng viên).
- **Kỳ vọng:** trang trả **"Không đủ quyền truy cập"** (như `/users`, `/councils`).
- **Hiện tại (gap):** form "Tạo cuộc họp mới" vẫn render → xem mục *Phát hiện* bên dưới; cần chặn route + xác minh nút *Lưu/Tạo* bị backend từ chối.

### INT-01 — Cổng vào nghiệm thu (F04→F07→F06→F05)
- **Chuẩn bị:** một đề tài đang ở trạng thái *Đang thực hiện*, có danh mục sản phẩm cam kết.
1. **Giảng viên (chủ nhiệm):** mở chi tiết đề tài → khu *Tiến độ (F04, khi có)* → nộp **báo cáo kỳ cuối**.
2. **Admin/chuyên viên:** duyệt kỳ cuối → *Đạt*.
3. **Chủ nhiệm:** vào khu *Sản phẩm (F07, khi có)* nhưng **chưa** khai/duyệt đủ sản phẩm cam kết.
4. **Chuyên viên:** bấm **"Chuyển nghiệm thu"** → **kỳ vọng: bị chặn**, báo *thiếu sản phẩm cam kết*.
5. Khai + **duyệt** đủ sản phẩm cam kết (đúng loại & số lượng) → bấm lại "Chuyển nghiệm thu" → **cho phép** (đề tài sang *Chờ nghiệm thu*).
6. Lập hội đồng nghiệm thu, chấm → kết luận *Đạt*.
7. Bấm **"Hoàn thành đề tài"** khi khu *Kinh phí (F05)* còn dòng đối soát **MISMATCHED** → **kỳ vọng: bị chặn**.
8. Quyết toán hết MISMATCHED → bấm lại "Hoàn thành" → đề tài sang **Hoàn thành**.

### INT-02 — Trần khoán kinh phí + phí quản lý (F04→F05)
1. **Chuyên viên:** giao đề tài với **Kinh phí duyệt** = X (màn *Giao đề tài / F04*).
2. Màn *Kinh phí (F05)* → **"Xác nhận kinh phí cấp"**: nhập tổng ≤ X → lưu. Thử nhập > X → **bị chặn**.
3. Xem **Phí quản lý** tự tính = `min(floor(cấp×tỉ lệ), trần)`; kinh phí thực hiện = cấp − phí.
4. **Chủ nhiệm:** thêm **khoản chi** vượt kinh phí thực hiện → **kỳ vọng: chỉ cảnh báo, vẫn lưu**.
5. **Admin:** đổi tỉ lệ phí quản lý trong cấu hình → mở lại đề tài cũ → **số phí không đổi** (không hồi tố).

### INT-03 — Xung đột lợi ích trong hội đồng (F03)
- **Chuẩn bị:** đề tài đã nộp; một người vừa là **thành viên đề tài** vừa dự kiến vào hội đồng.
1. **Chuyên viên:** `/councils` → **"Tạo hội đồng"**, thêm thành viên (gồm người có xung đột).
2. Mở màn chấm điểm của hội đồng → **kỳ vọng:** người xung đột **không xuất hiện** trong danh sách chấm / bị chặn tạo phiếu.
3. Nếu sau khi loại, số người còn lại < ngưỡng phiếu tối thiểu → **kỳ vọng:** nút **"Kết luận"** bị vô hiệu.
4. Đủ phiếu → điểm tổng hợp = trung bình các phiếu *đã nộp*; so ngưỡng → *Đạt/Không đạt*.

### INT-04 — Hội đồng F03 và F06 không lẫn dữ liệu
1. Trên cùng đề tài, tạo hội đồng **xét duyệt** (F03), chấm xong.
2. Sau nghiệm thu, tạo hội đồng **nghiệm thu** (F06) trên cùng đề tài đó.
- **Kỳ vọng:** phiếu/tiêu chí/điểm của 2 hội đồng **tách biệt**; mở lại hội đồng xét duyệt không thấy phiếu nghiệm thu và ngược lại.

### INT-05 — Hội đồng đạo đức chạy song song (điều kiện AND)
1. Đề tài ở trạng thái *Đã nộp*.
2. **Chuyên viên:** lập **hội đồng khoa học** (xét duyệt) và **hội đồng đạo đức** cho cùng đề tài.
3. Cho **một** hội đồng kết luận *Đạt*, hội đồng kia **chưa** kết luận.
- **Kỳ vọng:** đề tài **chưa** chuyển *Đã duyệt*.
4. Hội đồng còn lại kết luận *Đạt* → đề tài mới chuyển **Đã duyệt**.

### INT-06 — Thư ký cập nhật thay chủ nhiệm (on-behalf)
- **Chuẩn bị:** đề tài có **thư ký** được ủy quyền.
1. Đăng nhập **thư ký** → mở đề tài → nộp **báo cáo tiến độ (F04)** thay chủ nhiệm.
2. Mở tab **Lịch sử** → **kỳ vọng:** dòng ghi *người thực hiện = thư ký, thay mặt = chủ nhiệm*.
3. Thư ký thử **"Xác nhận kinh phí cấp"** (quyền chuyên viên) → **kỳ vọng: bị chặn**.

### INT-07 — Đóng băng cấu hình đợt đăng ký (F02↔F01)
1. **Chuyên viên:** `/projects/rounds` → **"Tạo mới"** đợt, chọn biểu mẫu + bộ tiêu chí, mở đợt (*Đang mở*).
2. **Giảng viên:** *Đăng ký đề tài* vào đợt đó → nộp (đề tài *Đã nộp*).
3. **Chuyên viên:** mở lại đợt → thử **đổi biểu mẫu/bộ tiêu chí** → **kỳ vọng: bị chặn**; chỉ cho **gia hạn ngày kết thúc** về tương lai.
4. Thử **hủy** đợt đã có đề tài nộp → **kỳ vọng: bị chặn** (chỉ cho *Đóng*, không *Hủy*).
5. Sau khi đợt *Đóng*/quá hạn → giảng viên thử nộp đề tài mới vào đợt → **kỳ vọng: bị chặn**.

### INT-08 — Mã đề tài bất biến qua trả-bổ-sung / nộp lại (F01)
1. **Giảng viên:** *Đăng ký đề tài* → điền → **Nộp**. Ghi lại **mã đề tài** hiển thị.
2. **Chuyên viên:** mở đề tài → **"Trả lại bổ sung"** kèm lý do (đề tài về *Nháp*).
3. **Giảng viên:** sửa nội dung → **Nộp lại**.
- **Kỳ vọng:** **mã đề tài không đổi**; khi ở *Nháp* sửa được, sau *Nộp* khóa; nếu đợt đã quá hạn thì không mở lại được.

### INT-09 — Giờ giảng idempotent + thu hồi (F09/F11→P03→F08)
1. **Giảng viên:** *Đăng ký đề tài* → chọn **"Đề tài cấp trên"** (F09) hoặc **"Dự án phục vụ sản xuất"** (F11) → khai đầu mục + minh chứng → gửi.
2. **Chuyên viên:** **Duyệt** đầu mục.
3. Mở `/teaching-hours` (hoặc lý lịch F08 *khi có*) → **kỳ vọng:** xuất hiện **1** bản ghi giờ quy đổi.
4. **Duyệt lại / tính lại** → **kỳ vọng:** vẫn **1** bản ghi (không nhân đôi).
5. **Chuyên viên:** **Thu hồi** đầu mục đã duyệt → **kỳ vọng:** bản ghi giờ bị **gỡ/điều chỉnh**; tab *Lịch sử* có vết.

### INT-10 — Phân bổ giờ đa vai trò tổng = 100%
1. Tạo đầu mục (F10/F11) với **nhiều người** + nhập **tỉ lệ đóng góp**.
2. Đặt tổng tỉ lệ ≠ 100% → **kỳ vọng: cảnh báo/chặn**.
3. Đặt tổng = 100% → duyệt → `/teaching-hours`: mỗi người nhận giờ theo đúng tỉ lệ.

### INT-13 — Làm lại nghiệm thu có giới hạn (F06)
1. Đưa đề tài đến hội đồng nghiệm thu → kết luận **Không đạt**.
2. **Chuyên viên:** **"Cho làm lại"** → đề tài về *Đang thực hiện*. Lặp tới khi chạm `MAX_REDO_COUNT`.
3. Vượt số lần cho phép → nút **"Cho làm lại"** **bị vô hiệu/chặn**.

### INT-11 — Nguyên tử workflow + audit (MANUAL, tầng DB/service)
Không thao tác qua giao diện. Kiểm ở tầng service/DB: buộc một *effect/guard* lỗi giữa chừng khi chuyển
trạng thái → xác nhận **rollback** hoàn toàn, **không** còn dòng `AuditLog`/`WorkflowHistory` mồ côi.

> ⚠️ **"Hủy" trong panel "Chuyển trạng thái" là transition HỦY ĐỀ TÀI (→ CANCELLED), không phải nút đóng
> dialog.** Đóng panel không-commit phải dùng **Escape**. Test tự động lỡ bấm "Hủy" sẽ chuyển đề tài sang
> *Đã hủy* — mà đề tài đã hủy **mất nút Xoá** (không xoá được qua UI, kể cả admin) ⇒ không tự dọn được.
> Đề nghị: xem lại nhãn nút "Hủy" (dễ nhầm "đóng" vs "hủy đề tài") + cân nhắc cho phép xoá/ẩn đề tài đã hủy.

## Truy vết
- Luật bất biến & ánh xạ feature↔module: [AGENTS.md](../../AGENTS.md)
- Mô hình hội đồng dùng chung: [ADR-0003](../architecture/decisions/0003-mo-hinh-hoi-dong-dung-chung.md)
- Workflow động + `statusSemantic`: [ADR-0007](../architecture/decisions/0007-workflow-engine-dong-per-tenant.md)
- Ranh giới lõi/tenant + variation points: [ADR-0012](../architecture/decisions/0012-ranh-gioi-loi-vs-cau-hinh-tenant.md), [variation-points](../architecture/variation-points.md)
- Trạng thái tài liệu feature: [REVIEW.md](REVIEW.md)
