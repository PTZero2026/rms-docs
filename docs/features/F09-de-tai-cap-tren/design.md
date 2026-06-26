---
title: "Đề tài cấp trên — Thiết kế kỹ thuật"
spec: "./spec.md"
owner: "<BE DEV>"
status: Draft        # Draft | Review | Approved
updated: 2026-06-26
---

# Đề tài cấp trên — Thiết kế kỹ thuật

> **Cách HIỆN THỰC** các luật & tiêu chí ở [`spec.md`](./spec.md). DEV sở hữu file này.
> PO/BA chỉ cần soát **§1 Bảng truy vết**. Không chép lại schema dùng chung — trỏ về
> [`data-model.md`](../../architecture/data-model.md).

## 1. Bảng truy vết (nghiệp vụ → hiện thực)

| Luật / AC | Hiện thực kỹ thuật | Tham chiếu |
|-----------|--------------------|------------|
| BR-01 | Entity riêng `UpperProject` (module `upper-project`), **không** dùng `ResearchProject`/`ProposalCall`; không có hội đồng/nghiệm thu nội bộ | §2; AGENTS §3 |
| BR-01b | `levelItemId` → `CatalogItem` của `RESEARCH_TOPIC_CATEGORY`, lọc `extra.tier = UPPER` ở tầng query | §2; data-model §4.2 |
| BR-02 | Khi duyệt: đọc `level.extra.requiredEvidence[stage]`, đối chiếu `Attachment` (theo `evidenceTypeItemId`) gắn vào đề tài; thiếu → chặn, trả danh sách loại còn thiếu | §3.2 |
| BR-03 | Máy trạng thái `DRAFT → PENDING_APPROVAL → APPROVED` + `RETURNED→DRAFT`; chuyển qua domain service, ghi `AuditLog` | §3.1 |
| BR-04 | Effect "phát sinh quy đổi giờ giảng" gắn vào transition đã duyệt; gọi P03 với khóa idempotent `(source=UPPER_PROJECT, refId=id)` | §3.3; P03 |
| BR-05 | P03 nhận `levelItem.code` + `member.projectRole` + `contributionRatio` để tính & phân bổ giờ | §3.3; P03 §4 |
| BR-06 | Khi thu hồi/trả lại sau duyệt: effect đảo chiều gọi P03 điều chỉnh (có lý do, ghi audit) | §3.3 |
| AC-01 | Tạo `UpperProject` không yêu cầu `proposalCallId`/workflow hội đồng | §2 |
| AC-02 | Guard `requiredEvidenceSatisfied` trên transition duyệt | §3.2 |
| AC-03 | Action `return(reason)` đưa về `DRAFT`, mở quyền sửa cho chủ nhiệm | §3.1 |
| AC-04 | Mọi transition ghi `AuditLog` (append-only) | §3.1; AGENTS §4 |
| AC-05 | P03 idempotent theo khóa nguồn (P03 BR-06) | §3.3 |
| AC-06 | Effect đảo chiều P03 khi rời trạng thái `APPROVED` | §3.3 |

## 2. Mô hình dữ liệu

Thực thể **đặc thù feature** (chưa có trong `data-model.md` — đề xuất bổ sung khi chốt):

**UpperProject**

| Trường | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | uuid | PK | |
| `name` | string | not null | Tên đề tài |
| `upperCode` | string | nullable | Mã do **cơ quan cấp trên** cấp (khác `projectCode` nội bộ) |
| `levelItemId` | uuid | FK → CatalogItem (`RESEARCH_TOPIC_CATEGORY`, `extra.tier=UPPER`), not null | Cấp đề tài |
| `managingBodyItemId` | uuid | FK → CatalogItem (`MANAGING_BODY`), not null | Cơ quan chủ trì/quản lý cấp trên |
| `researchFieldId` | uuid | FK → ResearchField, nullable | Lĩnh vực — báo cáo B02 / F08 |
| `principalInvestigatorId` | uuid | FK → User, not null | Chủ nhiệm |
| `hostUnitId` | uuid | FK → Unit, nullable | Đơn vị chủ trì phía Trường |
| `startDate` | date | nullable | |
| `endDate` | date | nullable | |
| `totalBudget` | bigint | nullable | Kinh phí tổng — **tham khảo, không đối soát** |
| `result` | text | nullable | Kết quả (cập nhật khi hoàn thành) |
| `status` | enum | `DRAFT`\|`PENDING_APPROVAL`\|`APPROVED`, not null | Máy trạng thái §3.1 |
| `returnReason` | text | nullable | Lý do trả lại gần nhất |
| `approvedBy` / `approvedAt` | uuid / timestamptz | nullable | Người & thời điểm duyệt |

**UpperProjectMember** (`id`, `upperProjectId` FK, `userId` FK → User, `projectRole` enum `PRINCIPAL_INVESTIGATOR`|`MEMBER`, `contributionRatio` numeric) — `contributionRatio` là đầu vào phân bổ giờ giảng cho P03.

**Dùng chung (không chép lại):**
- **Attachment** (`data-model.md §4.3`) làm minh chứng — đã bổ sung trường nullable `evidenceTypeItemId`
  (FK → CatalogItem `EVIDENCE_TYPE`) phân loại minh chứng; dùng chung F09–F12. `targetType = 'UPPER_PROJECT'`.
- **CatalogItem** (`RESEARCH_TOPIC_CATEGORY`, `EVIDENCE_TYPE`, `MANAGING_BODY`) cho cấp, loại minh chứng & cơ quan chủ trì.

## 3. Ràng buộc & bất biến kỹ thuật

### 3.1 Máy trạng thái & audit
- **Máy trạng thái tối giản riêng** của module `upper-project` — **không** dùng P01 (P01 BR-09 chỉ áp `RESEARCH_PROJECT`; vòng đời F09 cố định 3 trạng thái, giống nhau mọi tenant → không cần graph động/versioning).
- Trạng thái: `DRAFT → PENDING_APPROVAL` (gửi duyệt) → `APPROVED` (QLKH duyệt) | `→ DRAFT` (trả lại, kèm `returnReason`); cho phép `APPROVED → DRAFT` (thu hồi) để sửa.
- Mọi chuyển trạng thái đi qua **domain service** (không tự `UPDATE status` ở handler màn hình — tinh thần AGENTS §4); mỗi transition ghi `AuditLog` (`oldValue`/`newValue`, actor, lý do).
- **Map `statusSemantic` chuẩn** để báo cáo xuyên tổ chức (B02) gom được dù không qua P01: `DRAFT→DRAFT`, `PENDING_APPROVAL→SUBMITTED`, `APPROVED→APPROVED`.
- Quyền: `UPPERPROJECT.EDIT` (chủ nhiệm/chuyên viên — kê khai, gửi duyệt); `UPPERPROJECT.APPROVE` (QLKH — duyệt/trả lại). Phân quyền ở backend cho mọi API (AGENTS §4.1).

### 3.2 Validate minh chứng động (BR-02)
- Guard `requiredEvidenceSatisfied(level, stage)` đọc `level.extra.requiredEvidence[stage]` (`stage ∈ {khai_bao, ket_qua}`).
- Với mỗi `EVIDENCE_TYPE.code` bắt buộc → đếm `Attachment` của đề tài có `evidenceTypeItemId` tương ứng (recordStatus hợp lệ). Thiếu bất kỳ loại nào → **chặn** transition duyệt, trả về danh sách loại còn thiếu.
- Đổi `extra.requiredEvidence` (B01) → quy tắc áp dụng ngay, **không deploy** (đọc runtime).

### 3.3 Trigger giờ giảng (P03) — idempotent & đảo chiều
- Effect `emitTeachingHour` chạy khi vào trạng thái cấu hình bởi tham số `f09.teachingHourTrigger` (`ON_APPROVE` mặc định | `ON_RESULT`) — `SystemSetting` per-tenant (VP-PARAM). Gửi yêu cầu quy đổi tới P03 với khóa **idempotent** `(sourceType=UPPER_PROJECT, sourceId=id)` → xử lý lại không sinh giờ trùng (P03 BR-06).
- P03 nhận `levelItem.code` (định mức theo cấp) + danh sách member (`projectRole`, `contributionRatio`) để tính & phân bổ.
- Effect `revokeTeachingHour` chạy khi rời trạng thái đã kích hoạt (thu hồi/trả lại) → P03 điều chỉnh giảm tương ứng, ghi lý do + audit (BR-06).

## 4. API / hợp đồng (đề xuất — chốt khi định nghĩa `packages/api-contracts`)

- `POST /upper-projects` · `PUT /upper-projects/{id}` — kê khai/cập nhật (DRAFT).
- `POST /upper-projects/{id}/submit` — gửi duyệt (`→ PENDING_APPROVAL`).
- `POST /upper-projects/{id}/approve` — duyệt (guard minh chứng; effect P03).
- `POST /upper-projects/{id}/return` — trả lại `{ reason }`.
- `POST /upper-projects/{id}/attachments` — thêm minh chứng `{ evidenceTypeCode, file }`.

## 5. Điểm kỹ thuật cần chốt

- ~~Cơ quan chủ trì cấp trên~~ → **đã chốt**: danh mục B01 `MANAGING_BODY` (`managingBodyItemId`).
- ~~`evidenceTypeItemId` trên `Attachment`~~ → **đã chốt**: bổ sung trường dùng chung F09–F12 (data-model §4.3).
- ~~Vòng đời P01 vs riêng~~ → **đã chốt**: máy trạng thái tối giản riêng cho F09 (§3.1), không mở rộng P01.
- ~~`statusSemantic` cho `UpperProject`~~ → **đã chốt**: map sang từ vựng chuẩn để B02 báo cáo xuyên tổ chức (§3.1).
- *(còn mở)* Khi nào tổng quát hóa máy trạng thái cho F10–F12 nếu các feature E4 khác cùng nhu cầu — cân nhắc tách service trạng thái nhẹ dùng chung.
