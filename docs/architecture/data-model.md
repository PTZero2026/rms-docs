---
title: "Mô hình dữ liệu — RMS"
status: Draft
updated: 2026-06-01
---

# Mô hình dữ liệu

> **Nguồn sự thật về dữ liệu dùng chung.** Mọi `spec.md` tham chiếu tên thực thể, tên trường và
> enum trạng thái ở đây thay vì tự định nghĩa lại. Khi một feature cần trường mới, bổ sung vào file
> này trong cùng PR. Tên thực thể tiếng Anh, PascalCase; tên trường tiếng Anh camelCase.

## 1. Quy ước chung

- **Khóa chính:** mọi thực thể có `id` (UUID v4), không tái sử dụng.
- **Trường audit dùng chung** (mọi thực thể nghiệp vụ, không lặp lại trong bảng trường bên dưới):
  `createdAt`, `createdBy`, `updatedAt`, `updatedBy` (FK → `User`).
- **Xóa mềm:** thực thể danh mục và hồ sơ dùng `recordStatus` (`ACTIVE` | `INACTIVE` | `DELETED`)
  thay vì xóa cứng, để giữ toàn vẹn tham chiếu lịch sử.
- **Tiền tệ:** lưu số nguyên VND (`bigint`), không dùng số thực.
- **Thời gian:** lưu UTC (`timestamptz`), hiển thị theo múi giờ Việt Nam ở tầng giao diện.
- **File đính kèm:** không lưu nhị phân trong CSDL — xem thực thể `Attachment` (trỏ tới object storage).

## 2. Sơ đồ thực thể (ERD)

```mermaid
erDiagram
    User ||--o{ ProjectMember : "tham gia"
    User }o--o{ Role : "được gán"
    Role }o--o{ Permission : "gồm"
    Unit ||--o{ User : "thuộc"

    ProposalCall ||--o{ ResearchProject : "nhận đề xuất"
    ResearchField ||--o{ ResearchProject : "phân loại"
    ResearchProject ||--o{ ProjectMember : "có"
    ResearchProject ||--o{ Attachment : "đính kèm"

    ResearchProject ||--o{ EvaluationRound : "trải qua"
    EvaluationRound ||--|| EvaluationCommittee : "do"
    EvaluationRound ||--o{ ScoreSheet : "tổng hợp"
    EvaluationCommittee ||--o{ CommitteeMember : "gồm"
    CommitteeMember ||--o{ ScoreSheet : "điền"
    EvaluationCriterion ||--o{ CriterionScore : "được chấm"
    ScoreSheet ||--o{ CriterionScore : "gồm"

    ResearchProject ||--o{ ProgressReport : "nộp"
    ResearchProject ||--o{ BudgetEstimate : "có"
    ResearchProject ||--o{ BudgetTransaction : "phát sinh"
    ResearchProject ||--o{ ResearchOutput : "tạo ra"
    User ||--o{ ResearchOutput : "đồng tác giả"

    User ||--o{ Notification : "nhận"
    User ||--o{ AuditLog : "thực hiện"
```

> `EvaluationRound` là một **lượt đánh giá** của một hội đồng trên một đề tài; nó được dùng lại cho cả
> **xét duyệt** (F03) và **nghiệm thu** (F06) — phân biệt bằng trường `type`. Xem [ADR-0003](decisions/0003-mo-hinh-hoi-dong-dung-chung.md).

## 3. Vòng đời đề tài (state machine)

Trạng thái của `ResearchProject.status` là **trục xương sống** nối các feature. Mỗi chuyển trạng thái
do đúng một feature kích hoạt và được ghi `AuditLog`.

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Chủ nhiệm tạo đề xuất (F01)
    DRAFT --> SUBMITTED : Nộp trong đợt kêu gọi mở (F01)
    SUBMITTED --> DRAFT : Chuyên viên trả lại bổ sung (F01)
    SUBMITTED --> UNDER_REVIEW : Đưa vào hội đồng (F03)
    UNDER_REVIEW --> APPROVED : Hội đồng thông qua (F03)
    UNDER_REVIEW --> REJECTED : Hội đồng không thông qua (F03)
    APPROVED --> IN_PROGRESS : Ký hợp đồng/giao đề tài (F04)
    IN_PROGRESS --> SUSPENDED : Tạm dừng có lý do (F04)
    SUSPENDED --> IN_PROGRESS : Tiếp tục (F04)
    IN_PROGRESS --> PENDING_ACCEPTANCE : Đủ điều kiện nghiệm thu (F06)
    PENDING_ACCEPTANCE --> UNDER_ACCEPTANCE : Lập hội đồng nghiệm thu (F06)
    UNDER_ACCEPTANCE --> PASSED : Nghiệm thu đạt (F06)
    UNDER_ACCEPTANCE --> FAILED : Nghiệm thu không đạt (F06)
    FAILED --> IN_PROGRESS : Cho làm lại có thời hạn (F06)
    PASSED --> COMPLETED : Quyết toán & đóng đề tài (F05/F06)
    REJECTED --> [*]
    COMPLETED --> [*]
    DRAFT --> CANCELLED : Chủ nhiệm/chuyên viên hủy
    SUBMITTED --> CANCELLED : Hủy trước xét duyệt
    CANCELLED --> [*]
```

| Từ trạng thái | Tới | Điều kiện | Feature | Người thực hiện |
|---|---|---|---|---|
| `DRAFT` | `SUBMITTED` | Đợt kêu gọi đang mở, hồ sơ đủ trường bắt buộc | F01 | Chủ nhiệm |
| `SUBMITTED` | `DRAFT` | Hồ sơ thiếu/sai, còn hạn nộp | F01 | Chuyên viên |
| `SUBMITTED` | `UNDER_REVIEW` | Hết hạn nộp / chốt danh sách, đã gán hội đồng | F03 | Chuyên viên |
| `UNDER_REVIEW` | `APPROVED` / `REJECTED` | Đủ phiếu chấm hợp lệ, đạt/không đạt ngưỡng | F03 | Chuyên viên (theo kết luận HĐ) |
| `APPROVED` | `IN_PROGRESS` | Đã giao đề tài / ký hợp đồng | F04 | Chuyên viên |
| `IN_PROGRESS` | `PENDING_ACCEPTANCE` | Đã nộp báo cáo cuối + đủ sản phẩm cam kết | F06 | Chủ nhiệm |
| `UNDER_ACCEPTANCE` | `PASSED` / `FAILED` | Hội đồng nghiệm thu kết luận | F06 | Chuyên viên |
| `PASSED` | `COMPLETED` | Đã quyết toán kinh phí | F05/F06 | Chuyên viên |

> Quy tắc chung: **không cho nhảy trạng thái ngoài sơ đồ**. Mọi chuyển trạng thái phải kèm
> `reason` khi là chuyển lùi/hủy/tạm dừng. Logic này tập trung ở backend (domain service), không
> phân tán ở từng màn hình.

## 4. Thực thể cốt lõi

### 4.1 Người dùng & phân quyền (B03)

**User**

| Trường | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | uuid | PK | |
| `userCode` | string | unique | Mã cán bộ/nhà khoa học |
| `fullName` | string | not null | |
| `email` | string | unique, not null | Định danh đăng nhập (khớp SSO) |
| `phoneNumber` | string | | Dùng cho thông báo SMS (B04) |
| `unitId` | uuid | FK → Unit | Đơn vị công tác |
| `academicTitle` | string | | Phục vụ lý lịch khoa học (F08) |
| `accountSource` | enum | `SSO` \| `INTERNAL` | Nguồn tạo tài khoản |
| `status` | enum | `ACTIVE` \| `LOCKED` \| `INACTIVE` | |

**Role** (`id`, `code` unique, `name`, `description`, `isSystem` bool) — vai trò chuẩn xem B03 §Vai trò.
**Permission** (`id`, `code` unique vd `RESEARCH_PROJECT.APPROVE`, `description`) — quyền nguyên tử theo `MODULE.ACTION`.
**User_Role** và **Role_Permission**: bảng nối nhiều-nhiều.

### 4.2 Danh mục dùng chung (B01)

**Unit** (`id`, `code`, `name`, `parentUnitId` self-FK, `recordStatus`) — cây đơn vị.
**ResearchField** (`id`, `code`, `name`, `parentFieldId` self-FK, `recordStatus`) — lĩnh vực nghiên cứu.
**ProductType** (`id`, `code`, `name`, `category` enum `ARTICLE`|`PATENT`|`SOLUTION`|`TRAINING`|`OTHER`).
**SystemSetting** (`key` PK, `value`, `dataType`, `description`) — tham số chạy (ngưỡng điểm, hạn nhắc…).

### 4.3 Đợt kêu gọi & đề tài (F02, F01)

**ProposalCall**

| Trường | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | uuid | PK | |
| `code` | string | unique | Mã đợt, vd `KG-2026-01` |
| `name` | string | not null | |
| `startDate` / `endDate` | date | not null | Khoảng nhận đề xuất |
| `researchFieldIds` | uuid[] | | Lĩnh vực được nhận trong đợt |
| `proposalTemplateId` | uuid | | Mẫu thuyết minh áp dụng |
| `reviewCriteriaSetId` | uuid | FK → CriteriaSet | Bộ tiêu chí xét duyệt áp dụng |
| `status` | enum | `DRAFT`\|`OPEN`\|`CLOSED`\|`CANCELLED` | Vòng đời đợt (xem F02) |

**ResearchProject**

| Trường | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | uuid | PK | |
| `projectCode` | string | unique | Sinh tự động khi nộp |
| `name` | string | not null | |
| `proposalCallId` | uuid | FK → ProposalCall, not null | Đợt nộp |
| `researchFieldId` | uuid | FK → ResearchField | |
| `principalInvestigatorId` | uuid | FK → User, not null | Chủ nhiệm |
| `hostUnitId` | uuid | FK → Unit | Đơn vị chủ trì |
| `abstract` | text | | |
| `proposalDocument` | jsonb | | Nội dung theo biểu mẫu của đợt |
| `requestedBudget` | bigint | | Tổng dự toán đề xuất (VND) |
| `durationMonths` | int | | Số tháng |
| `status` | enum | not null | Vòng đời §3 |
| `submittedAt` | timestamptz | | Thời điểm chuyển `SUBMITTED` |

**ProjectMember** (`id`, `researchProjectId`, `userId`, `projectRole` enum `PRINCIPAL_INVESTIGATOR`|`MEMBER`|`SECRETARY`, `responsibility`).
**Attachment** (`id`, `targetType`, `targetId`, `fileName`, `storageKey` object-storage key, `fileSize`, `mimeType`) — dùng chung cho mọi feature.

### 4.4 Hội đồng & đánh giá (F03, F06)

**EvaluationCommittee** (`id`, `code`, `name`, `type` enum `PROPOSAL_REVIEW`|`ACCEPTANCE`, `status`).
**CommitteeMember** (`id`, `committeeId`, `userId`, `committeeRole` enum `CHAIR`|`REVIEWER`|`MEMBER`|`SECRETARY`).
**CriteriaSet** (`id`, `name`, `type` `PROPOSAL_REVIEW`|`ACCEPTANCE`) & **EvaluationCriterion** (`id`, `criteriaSetId`, `name`, `maxScore`, `weight`).
**EvaluationRound** (`id`, `researchProjectId`, `committeeId`, `type` `PROPOSAL_REVIEW`|`ACCEPTANCE`, `status`, `conclusion` enum `PASSED`|`FAILED`|`null`, `aggregateScore`).
**ScoreSheet** (`id`, `evaluationRoundId`, `committeeMemberId`, `status` `DRAFT`|`SUBMITTED`, `comment`, `totalScore`).
**CriterionScore** (`id`, `scoreSheetId`, `evaluationCriterionId`, `score`).

### 4.5 Thực hiện đề tài (F04, F05)

**ProgressReport** (`id`, `researchProjectId`, `period` int, `dueDate` date, `submittedAt`, `content` text, `status` `PENDING_SUBMISSION`|`SUBMITTED`|`PASSED`|`REVISION_REQUESTED`, `officerComment`).
**BudgetEstimate** (`id`, `researchProjectId`, `budgetLine`, `estimatedAmount` bigint, `period`).
**BudgetTransaction** (`id`, `researchProjectId`, `budgetLine`, `amount` bigint, `type` `DISBURSEMENT`|`EXPENSE`, `date`, `reconciliationStatus` `UNRECONCILED`|`MATCHED`|`MISMATCHED`, `financeTransactionCode`).

### 4.6 Sản phẩm & lý lịch (F07, F08)

**ResearchOutput** (`id`, `researchProjectId` nullable, `productTypeId`, `name`, `authors` jsonb, `publicationYear`, `publicationInfo`, `evidenceAttachmentId` FK → Attachment, `approvalStatus` `PENDING_APPROVAL`|`APPROVED`|`REJECTED`).
> Lý lịch khoa học (F08) là **khung nhìn tổng hợp** trên `User` + `ResearchOutput` + vai trò
> trong `ResearchProject`, không phải một bảng riêng (xem F08 §Dữ liệu).

### 4.7 Hạ tầng dùng chung (B04, audit)

**Notification** (`id`, `recipientId`, `eventType`, `title`, `content`, `channel` `IN_APP`|`EMAIL`|`SMS`, `status` `PENDING_SEND`|`SUBMITTED`|`READ`|`ERROR`, `link`).
**AuditLog** (`id`, `actorId`, `action`, `targetType`, `targetId`, `oldValue` jsonb, `newValue` jsonb, `occurredAt`, `ipAddress`) — append-only, xem [ADR-0002](decisions/0002-kien-truc-hai-mat-mot-backend.md).

## 5. Ghi chú toàn vẹn

- Mọi FK trỏ tới danh mục dùng `ON DELETE RESTRICT` — danh mục đang được tham chiếu không xóa cứng được.
- `ResearchProject.status` chỉ được đổi qua domain service, không update trực tiếp từ API CRUD.
- Bảng nối nhiều-nhiều (`User_Role`, `Role_Permission`, `CommitteeMember`) có unique constraint trên cặp khóa để tránh trùng.
