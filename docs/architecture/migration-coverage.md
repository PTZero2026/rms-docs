---
title: "Bản đồ migrate: backend cũ → monorepo RMS"
status: Draft
version: 0.1
updated: 2026-06-07
source_repo: https://github.com/ducnv2509/BE_NCKH
---

# Bản đồ migrate (coverage matrix)

> Nguồn sự thật về **hiện trạng** để chuyển từ repo cũ sang monorepo này.
> Đọc cùng [overview.md §3](overview.md) (ánh xạ feature↔module) và [../../AGENTS.md](../../AGENTS.md) §4 (luật bất biến).
> Cột `Owner tribal` để người nắm nghiệp vụ điền — đây là chỗ thu thập kiến thức trong đầu người.

## 0. Tóm tắt repo cũ

- **Stack:** NestJS 10 + Prisma 7 (PostgreSQL) · Keycloak (realm-per-tenant) · BullMQ · MinIO · Redis · Nodemailer · ExcelJS.
- **Không chạy production** (nội bộ/staging) → được tái cấu trúc mạnh tay, big-bang từng feature; **không cần** chiến lược strangler giữ uptime.
- **Là multi-service (hỗn hợp):**
  | Service | Vai trò | Số phận đề xuất |
  |---|---|---|
  | `nckh-backend` | Modular monolith domain NCKH (16 module) | **Nguồn chính** → rót vào `apps/backend` |
  | `templates-service` | Render template (đề cương/biểu mẫu/docx) | Gộp thành module hoặc giữ làm service phụ |
  | `sys-config-service` | Cấu hình hệ thống | Gộp vào `catalog`/config |
  | `isofh-admin` | Control-plane SaaS: tenant, subscription, **payment** | **Loại khỏi phạm vi RMS** (không phải domain NCKH) |

## 1. Quyết định kiến trúc cần chốt TRƯỚC (chặn nhiều việc phía sau)

| # | Quyết định | Vì sao quan trọng |
|---|---|---|
| ~~Q1~~ ✅ **ĐÃ CHỐT: ĐA TỔ CHỨC** (2026-06-07) | RMS đa tổ chức (multi-tenant) | Giữ realm-per-tenant + Postgres RLS của repo cũ → **Lift** tầng `auth`/`tenants`/`users`. `data-model.md` giữ `tenant_id` + RLS. **Cần ADR multi-tenant mới** (monorepo chưa có). |
| ~~Q2~~ ✅ **ĐÃ CHỐT: GIỮ ĐỘNG PER-TENANT** ([ADR-0007](decisions/0007-workflow-engine-dong-per-tenant.md)) | Giữ engine cấu hình động (lifecycle khác nhau giữa tổ chức, nhất là NCKH nội bộ); tái cấu trúc 3 tầng + tầng `statusSemantic`, kéo domain logic khỏi kernel. |
| ~~Q3~~ ✅ **ĐÃ CHỐT: GIỮ KEYCLOAK** ([ADR-0008](decisions/0008-keycloak-idp-dang-nhap-email-otp.md)) | Keycloak realm-per-tenant; đăng nhập passwordless **email-OTP**; không tự đăng ký, không quên mật khẩu. Keycloak=authN, RMS=authZ. |
| Q4 ⏳ **CHỜ DEV** | Phận của `isofh-admin` (payment/subscription) | Khuyến nghị: **loại khỏi domain RMS**, nhưng **giữ phần tạo/quản realm Keycloak** (onboard tổ chức vẫn cần) → chuyển về `iam`/infra. **Cần hỏi DEV:** (1) `isofh-admin` có đang được dùng cho việc gì ngoài tenant/subscription/payment không? (2) Có logic nào RMS đang phụ thuộc vào nó không? (3) Phần tạo realm/SMTP đang nằm ở service nào? |

## 2. Coverage matrix theo feature đích

> Tình trạng: **Lift** (bê + đổi tên) · **Carve** (tách khỏi module lớn) · **Build** (làm mới) · **Adapt** (giữ nhưng sửa theo quyết định Q1–Q3).
> Độ chín ở repo cũ: 0 (không có) → 3 (đầy đủ).

| Feature đích | Module đích | Nguồn ở repo cũ (`nckh-backend/src/modules/…`) | Tình trạng | Chín | Owner tribal | Ghi chú |
|---|---|---|---|:--:|---|---|
| **F01** đề xuất đề tài | `proposal` | `research/` (+ `proposal-content/` form builder động) | Lift+Carve | 3 | _điền_ | Module giàu nhất; chứa cả entity `ResearchProject`. **Đề xuất làm tracer bullet.** |
| **F02** đợt kêu gọi | `call` | `registration/` (`RegistrationGuide/Form/FormVersion`) | Lift/Carve | 2 | _điền_ | Cần xác minh: "registration" = đợt kêu gọi hay form đăng ký. |
| **F03** xét duyệt hội đồng | `review` | `councils/` + `research/…projects-review` (`ProposalReview`, `ProjectEvaluation`, `CouncilMeeting`) | Lift+Carve | 3 | _điền_ | Có PRD riêng (xem §3). Họp hội đồng, biên bản, tiêu chí đánh giá đủ. |
| **F04** quản lý tiến độ | `progress` | rải trong `research/` (status enum) — **không có module riêng** | **Build**+Carve | 1 | _điền_ | Khoảng trống. Phần lớn làm mới. |
| **F05** quản lý kinh phí | `budget` | `research/…project-budget.{controller,service}`, `dto/budget` | **Carve** | 2 | _điền_ | Đang **lẫn trong** `research` → tách ra module riêng. |
| **F06** nghiệm thu | `acceptance` | `AcceptanceResult` (trong research) + `certificates/` | Lift+Carve | 2 | _điền_ | Nghiệm thu + cấp chứng nhận. |
| **F07** sản phẩm khoa học | `product` | **KHÔNG CÓ** | **Build mới** | 0 | _điền_ | Khoảng trống rõ — cần spec từ đầu (tribal + YC đầu vào). |
| **F08** lý lịch khoa học | `profile` | `users/` + `AuthorUpgradeRequest` | Carve/Build | 1 | _điền_ | `users` chủ yếu là tài khoản; lý lịch học thuật chưa rõ. |
| **B01** danh mục/cấu hình | `catalog` | `categories/` + `sys-config-service` (`ResearchCategory`, `EvaluationCriterion`, `NotificationCategory`, `TenantSetting`) | Lift | 2 | _điền_ | Gộp config service vào đây. |
| **B02** báo cáo thống kê | `report` | `reports/` (+ `admin/admin-reports`) | Lift | 2 | _điền_ | ExcelJS export, dashboard, raw SQL. |
| **B03** quản lý người dùng | `iam` | `auth/` + `users/` + `tenants/` + `admin/` + Keycloak | Lift+Adapt | 3 | _điền_ | Phụ thuộc Q1, Q3. Có BRD riêng (xem §3). |
| **B04** thông báo | `notification` | `notifications/` + `noti-templates/` + `templates-service` | Lift | 3 | _điền_ | BullMQ in-app + email; `Notification`, `UserNotification`, `NotificationTemplate`. |
| **audit** (xuyên suốt) | `audit` | model `ActivityLog` | Lift | 2 | _điền_ | Khớp luật §4.4 (append-only). |
| _(cross-cutting)_ | vòng đời `ResearchProject` | `workflow/` (`WorkflowTemplate/Step/Transition/Instance/History`) | Adapt (Q2) | 3 | _điền_ | Là "domain service dùng chung" của luật §2. |
| _(ngoài phạm vi)_ | — | `isofh-admin` (tenant/subscription/**payment**) | **Loại** | — | — | Control-plane SaaS, không thuộc domain NCKH. Xác nhận ở Q4. |

## 3. Tài liệu nghiệp vụ tìm thấy trong repo cũ (gom về spec đích)

| Tài liệu cũ | Map về |
|---|---|
| `BRD (MVP) — Quản lý Người dùng Vai trò …md` | `docs/features/B03-quan-ly-nguoi-dung/spec.md` |
| `PRD One-Page — Quản lý Cuộc họp Hội đồng …md` | `docs/features/F03-xet-duyet-hoi-dong/spec.md` |
| `Tài liệu Yêu cầu Phần mềm.md` (SRS) | xuyên suốt → `docs/product/` + nhiều spec |
| `YC đầu vào_PM NCKH, QLDT, QLCDT.docx` | `docs/product/vision.md` + đầu vào F07 |
| `docs/module2..7/tailieu_*.txt` | module2→F01/F02 · module3→B01/B03 · module4→F03 · module5→F06 · module6→B02 · module7→B04 |
| `nckh-schema.sql` + `prisma/schema.prisma` | `docs/architecture/data-model.md` |
| `nckh-architecture.md`, `ARCHITECTURE.md`, `nckh-diagram.md` | `docs/architecture/overview.md` |

> **Luật ưu tiên nguồn khi mâu thuẫn:** (1) code đang chạy = "hệ thống làm gì"; (2) owner xác nhận "đúng ra phải làm gì"; (3) Word/PDF/wiki = bổ trợ, coi như có thể đã cũ. Mâu thuẫn → ghi vào "Open questions" của spec, không tự chọn.

## 4. Trình tự đề xuất

1. **Chốt Q1–Q4** (mục §1) — chặn nhiều việc, làm trước tiên.
2. **Xương sống:** `data-model.md` (rút từ Prisma) + vòng đời `ResearchProject` (từ `workflow/`).
3. **Tracer bullet F01** end-to-end: `spec.md` → `api-contracts` (OpenAPI) → bê `research`→`proposal` (tách `budget`) → 1 lát FE. Kiểm chứng quy ước + DoD §6.
4. **Nhân rộng theo vòng đời:** F02 → F01 → F03 → F04 → F05 → F06 → F07; song song B01–B04, audit.
5. Với mỗi feature: buổi 30–45' với owner, dùng 6 mục `templates/spec.md` làm agenda để moi tribal.

## 5. Ánh xạ legacy → target (lát lõi F01)

> Quan hệ: **[data-model.md](data-model.md) = đích** (giữ thiết kế, bám ADR-0003/0004); **Prisma cũ = nguồn**.
> Bảng dưới để DEV biết transform gì khi lift module `research`/`proposal-content` → `proposal`.
> Ký hiệu: ✏️ đổi tên · 🧩 đổi cấu trúc · ➕ target mới (build) · ⚠️ legacy có, target chưa quyết.

### `ResearchProject` (legacy) → `ResearchProject` (target)

| Legacy (Prisma) | Target (data-model) | Loại | Ghi chú |
|---|---|---|---|
| `tenantId` | `tenantId` | = | Giữ — multi-tenant đã chốt (Q1) |
| `code` | `projectCode` | ✏️ | unique theo tenant; target sinh khi nộp |
| `title` | `name` | ✏️ | |
| `authorId` | `principalInvestigatorId` | ✏️ | FK → User |
| `categoryId` (→`ResearchCategory`) | `researchFieldId` (→`ResearchField`) | ✏️🧩 | Danh mục đổi tên + chuẩn hoá (B01) |
| `departmentId` | `hostUnitId` (→`Unit`) | ✏️ | |
| `status` (`ProjectStatus` enum) | `status` (mã bước) **+** `statusSemantic` (enum §3.1) | 🧩 | Tách theo ADR-0007: map từng giá trị enum cũ → `statusSemantic` |
| `budget` `Decimal(15,2)` | **`BudgetEstimate`** (`estimatedAmount` `bigint`) | 🧩 | Tách bảng + đổi sang bigint VND (ADR-0004) |
| `startDate`/`endDate`/`durationMonths` | `durationMonths` (+ phái sinh) | 🧩 | Cân nhắc giữ start/end ở giai đoạn thực hiện (F04) |
| `version` | (optimistic lock) | = | |
| `revisionRequest`/`revisionDeadline`/`lastRevisionSubmittedAt` | (effect `setRevisionDeadline` — ADR-0007) | 🧩 | Chuyển thành side-effect của transition, không phải cột rời |
| `ethicsRequired`/`ethicsApprovedAt`/`ethicsApprovedById`/`ethicsMeetingId` | — | ⚠️ | **Đạo đức nghiên cứu**: target chưa mô hình hoá. Cần hỏi owner: thuộc F03 hay feature riêng? |
| `level` (`ProjectLevel`), `year` | — | ⚠️ | Cấp đề tài / năm — target chưa có; `year` có thể về `ProposalCall` |
| `approvalDecisionUrl` | `Attachment` | 🧩 | File → object storage qua `Attachment` |

### `ProjectMember` (legacy) → `ProjectMember` (target)

| Legacy | Target | Loại | Ghi chú |
|---|---|---|---|
| `projectId` | `researchProjectId` | ✏️ | |
| `userId` (nullable) | `userId` (FK) | 🧩 | Legacy cho thành viên ngoài hệ thống (chỉ tên); target cân nhắc giữ nullable |
| `fullName`/`academicTitle`/`department` | (lấy từ `User`) | 🧩 | Target tham chiếu User; chỉ giữ denormalize cho thành viên ngoài |
| `role` (`MemberRole` `CO_AUTHOR`…) | `projectRole` (`PRINCIPAL_INVESTIGATOR`\|`MEMBER`\|`SECRETARY`) | ✏️🧩 | Ánh xạ lại tập giá trị |
| `isMain` | → `projectRole = PRINCIPAL_INVESTIGATOR` | 🧩 | |

### `ResearchProposal` (legacy) → nội dung đề xuất (target)

> Legacy tách `ResearchProposal` (versioned) khỏi project; target gộp nội dung vào `ResearchProject.proposalDocument` (jsonb) + tách kinh phí.

| Legacy | Target | Loại | Ghi chú |
|---|---|---|---|
| `content`/`idea`/`expectedResults`/`literatureReview`/`ethics` | `ResearchProject.proposalDocument` (jsonb theo mẫu kỳ) | 🧩 | Nội dung động — khớp `proposal-content` form builder |
| `attachedFiles` (Json) | `Attachment[]` | 🧩 | |
| `budgetItems`/`budgetTotal`/`budgetSource`/`budgetNote` | `BudgetEstimate[]` (`bigint`) | 🧩 | Tách bảng (ADR-0004) |
| `version`/`submittedAt`/`status` (`ProposalStatus`)/`revisionNote` | Vòng đời ở `WorkflowInstance` + `statusSemantic` | 🧩 | Trạng thái proposal hợp nhất vào workflow đề tài |

### Việc phát sinh cần hỏi owner/DEV
- ⚠️ **Đạo đức nghiên cứu** (`ethics*`): legacy có hẳn luồng (ethicsMeeting); target chưa mô hình hoá → quyết định thuộc F03 hay feature mới.
- ⚠️ **Cấp đề tài** (`level`) và **năm** (`year`): bổ sung vào target ở đâu.
- 🧩 Map chi tiết `ProjectStatus` (enum legacy) → `statusSemantic` (§3.1) cần làm khi dựng workflow mặc định.
