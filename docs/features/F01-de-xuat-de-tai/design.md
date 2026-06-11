---
title: "Đề xuất đề tài — Thiết kế kỹ thuật"
spec: "./spec.md"
owner: "BE DEV"
status: Draft        # Draft | Review | Approved
updated: 2026-06-11
---

# Đề xuất đề tài — Thiết kế kỹ thuật

> **Cách HIỆN THỰC** các luật & tiêu chí ở [`spec.md`](./spec.md). DEV sở hữu và maintain file này.
> PO/BA chỉ cần soát **§1 Bảng truy vết** để chắc mọi `BR-xx`/`AC-xx` đều có lời giải kỹ thuật.
> DRY: không chép lại schema — trỏ tới [`../../architecture/data-model.md`](../../architecture/data-model.md).

## 0. Ánh xạ trạng thái nghiệp vụ ↔ enum kỹ thuật

Trạng thái `ResearchProject.status` (data-model §3 — vòng đời đề tài):

| Nhãn nghiệp vụ (spec.md) | Enum kỹ thuật | Thuộc feature |
|--------------------------|---------------|---------------|
| Nháp                     | `DRAFT`       | F01 |
| Đã nộp                   | `SUBMITTED`   | F01 |
| Đang xét duyệt           | `UNDER_REVIEW`| F03 (F01 chỉ chốt danh sách) |
| Đã hủy                   | `CANCELLED`   | F01 |

## 1. Bảng truy vết (nghiệp vụ → hiện thực)

| Luật / AC | Hiện thực kỹ thuật | Tham chiếu |
|-----------|--------------------|------------|
| BR-01 | Guard ở domain service: chặn `DRAFT→SUBMITTED` nếu `ProposalCall.status ≠ OPEN` hoặc `now ∉ [startDate, endDate]`. | data-model §3 |
| BR-02 | Validate bắt buộc tại backend: trường lõi `ResearchProject` (`name`, `researchFieldId`, `durationMonths`, `requestedBudget`) + trường bắt buộc trong `proposalDocument` (jsonb) theo `proposalTemplateId` của kỳ. | §2, §3 |
| BR-03 | Kiểm tra `ResearchProject.researchFieldId ∈ ProposalCall.researchFieldIds`; bỏ qua nếu kỳ không giới hạn lĩnh vực. | §2 |
| BR-04 | `principalInvestigatorId` không null; tạo đồng thời 1 `ProjectMember(projectRole = PRINCIPAL_INVESTIGATOR)`. | §2 |
| BR-05 | Cho phép `UPDATE` nội dung chỉ khi `status = DRAFT`; ngược lại 409/403. | §3 |
| BR-06 | `SUBMITTED→DRAFT` bắt buộc `reason` không rỗng; chỉ khi `now ≤ ProposalCall.endDate`. | §3 |
| BR-07 | `projectCode` sinh 1 lần khi nộp đầu tiên, `UNIQUE` toàn hệ thống; lưu lại, không sinh lại khi nộp lại. | §5 (sinh mã) |
| BR-08 | `UNIQUE (researchProjectId, userId)` trên `ProjectMember`. | §2 |
| BR-09 | `requestedBudget` `BIGINT ≥ 0` (VND); `durationMonths` `INT > 0`. | §2, data-model §1 |
| BR-10 | `DRAFT`/`SUBMITTED → CANCELLED` kèm `reason`; không `DELETE` bản ghi. | §3 |
| BR-11 | Mọi `status` đổi qua domain service `proposal`; ghi `AuditLog`; cấm `UPDATE` enum trực tiếp. | §3, overview §4.3 |
| AC-01 | Tạo `ResearchProject(status=DRAFT)` + `ProjectMember(PI)`, `projectCode = null`. | §2, §3 |
| AC-02 | Transaction nộp: validate → set `SUBMITTED`, sinh `projectCode`, set `submittedAt`, khóa sửa, `AuditLog(SUBMIT)`. | §3, §5 |
| AC-03/04 | Guard BR-01/BR-02 ném lỗi nghiệp vụ, giữ `DRAFT`. | §3 |
| AC-05 | Guard BR-05 chặn `UPDATE` khi `status = SUBMITTED`. | §3 |
| AC-06 | Data scoping + permission `RESEARCH_PROJECT.*`; ngoài phạm vi → 403. | §3, B03 |
| AC-07/08 | `RETURN_FOR_REVISION`: BR-06 (reason + còn hạn); `AuditLog(RETURN_FOR_REVISION)`. | §3 |
| AC-09 | Vi phạm `UNIQUE (researchProjectId, userId)` → lỗi nghiệp vụ. | §2 |
| AC-10 | Chốt danh sách = thao tác F01; chuyển `UNDER_REVIEW` thuộc domain service F03. | §3 |
| AC-11 | Nộp lại: `projectCode` giữ nguyên (đã có), chỉ cập nhật `submittedAt`. | §5 |

## 2. Mô hình dữ liệu

Dùng lại thực thể & enum ở [`data-model.md`](../../architecture/data-model.md) — F01 **không** định nghĩa
lại. Phần đặc thù F01:

- **`ResearchProject`** (§4.3) — trục chính. Trường F01 dùng: `projectCode` (sinh khi nộp), `name`,
  `proposalCallId`, `researchFieldId`, `principalInvestigatorId`, `hostUnitId`, `abstract`,
  `proposalDocument` (jsonb theo biểu mẫu kỳ), `requestedBudget` (`BIGINT`, VND), `durationMonths`
  (`INT`, tháng), `status` (`DRAFT`/`SUBMITTED`, và `CANCELLED` khi hủy), `submittedAt` (set khi `SUBMITTED`).
- **`ProjectMember`** (§4.3) — `researchProjectId`, `userId`, `projectRole`
  (`PRINCIPAL_INVESTIGATOR`/`MEMBER`/`SECRETARY`), `responsibility`. `UNIQUE (researchProjectId, userId)` — BR-08.
- **`Attachment`** (§4.3) — `targetType = 'ResearchProject'`, `targetId = ResearchProject.id`; lưu object
  storage key, **không** lưu nhị phân trong CSDL.
- **`ProposalCall`** (§4.3) — đọc `status` (`OPEN`), `startDate`/`endDate`, `researchFieldIds`,
  `proposalTemplateId` để xác định điều kiện nộp & cấu trúc thuyết minh.
- **`ResearchField`** (§4.2), **`User`** (§4.1), **`Unit`** (§4.2) — tham chiếu danh mục.
- **`AuditLog`** (§4.7) — ghi `SUBMIT`, `RETURN_FOR_REVISION`, `CANCEL` với `oldValue`/`newValue` và `reason`.

## 3. Ràng buộc & bất biến kỹ thuật

- **Máy trạng thái:** chỉ 3 transition thuộc F01 (xem `spec.md §5`, bảng §1 trên). Tất cả đi qua domain
  service `proposal` (overview §4.3); cấm `UPDATE status` trực tiếp từ tầng màn hình hay query rời (BR-11).
- **Validate nộp** chạy server-side trong một transaction: kiểm BR-01..BR-04, BR-09 → đổi trạng thái →
  sinh `projectCode` → set `submittedAt` → `AuditLog`. FE chỉ phản ánh sớm, không thay backend quyết định.
- **Khóa sửa sau nộp:** mọi mutation nội dung (`proposalDocument`, `ProjectMember`, `Attachment`) kiểm
  `status = DRAFT` (BR-05). Trả lại (`RETURN_FOR_REVISION`) mở lại bằng cách đưa về `DRAFT` (BR-06).
- **Phân quyền & data scoping:** quyền họ `RESEARCH_PROJECT.*` (B03). Chủ nhiệm chỉ thấy đề tài của mình;
  chuyên viên thấy theo phạm vi đơn vị/kỳ. Backend là lớp thực thi quyền duy nhất (B03 BR-08) → AC-06/AC-10.

## 4. API / hợp đồng (nếu có)

Đề xuất endpoint (chốt khi định nghĩa `packages/api-contracts`):

| Thao tác | Gợi ý endpoint | Ghi chú |
|----------|----------------|---------|
| Tạo nháp | `POST /proposals` | tạo `DRAFT` + PI member |
| Sửa nháp | `PATCH /proposals/{id}` | chỉ khi `DRAFT` (BR-05) |
| Nộp | `POST /proposals/{id}:submit` | transaction §3; sinh `projectCode` |
| Trả lại bổ sung | `POST /proposals/{id}:return` | body `{ reason }` (BR-06) |
| Hủy | `POST /proposals/{id}:cancel` | body `{ reason }` (BR-10) |
| Chốt danh sách | `POST /calls/{callId}/proposals:finalize` | chuẩn bị sang F03 |

## 5. Điểm kỹ thuật cần chốt

- **Sinh `projectCode` chống trùng khi nộp đồng thời:** dùng sequence/khóa theo `proposalCallId` (vd
  `<callCode>-<seq>`) trong cùng transaction nộp, hoặc advisory lock. Cần chốt định dạng cùng quy tắc
  đánh số nghiệp vụ ở [`spec.md §7`](./spec.md).
- **Version hóa `proposalDocument`** khi biểu mẫu (`proposalTemplateId`) đổi giữa kỳ: lưu `templateVersion`
  kèm jsonb để render đúng biểu mẫu đã nhập (liên quan điểm mở nghiệp vụ ở `spec.md §7`).
- **Quyền sửa của thành viên/thư ký:** nếu mở rộng ngoài chủ nhiệm, bổ sung permission + nhánh data scoping.
