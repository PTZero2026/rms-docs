---
title: "Workflow engine (vòng đời ResearchProject)"
id: "P01"
epic: "E0"
owner: "Kiến trúc/DEV (SA)"
status: Draft        # Draft | Review | Approved
version: 0.1
updated: 2026-06-12
---

# Workflow engine (vòng đời ResearchProject)

> **Năng lực nền (Platform)** — không phải feature CRUD do PO/BA sở hữu, mà là **hạ tầng nghiệp vụ
> dùng chung** do Kiến trúc/DEV sở hữu. Nguồn sự thật thiết kế: [ADR-0007](../../architecture/decisions/0007-workflow-engine-dong-per-tenant.md).
> Mô hình dữ liệu chi tiết: [data-model §3 & §4.8](../../architecture/data-model.md). File này chốt *cái gì &
> tại sao* ở mức hành vi quan sát được; *làm thế nào* (schema, kernel) ở ADR-0007/data-model.

## 1. Bối cảnh & mục tiêu

Luật bất biến [AGENTS.md §4.2](../../../AGENTS.md) yêu cầu mọi chuyển trạng thái `ResearchProject` đi qua
**một domain service dùng chung** (không tự update enum ở màn hình). RMS là **đa tổ chức**, và **vòng đời
đề tài có thể khác nhau giữa các tổ chức** (nội bộ có thể bỏ/gộp bước hội đồng, đổi tên trạng thái).

Mục tiêu: một **workflow engine cấu hình động per-tenant** theo **mô hình 3 tầng** (Graph cấu hình ·
Từ vựng ngữ nghĩa cố định · Handlers trong code), kèm tầng **`statusSemantic` chuẩn hoá** để báo cáo &
business rule chạy xuyên tổ chức dù tên trạng thái khác nhau. Mọi feature F01–F06 phụ thuộc engine này.

## 2. Phạm vi

- **Trong phạm vi:**
  - Graph vòng đời per-tenant (steps, transitions, `allowedRoles`, `requiresComment`), versioned.
  - Mỗi step gắn một `statusSemantic` từ danh mục cố định; mỗi transition chọn `guards[]`/`effects[]` từ catalog có sẵn.
  - Kernel điều phối: kiểm tra quyền/điều kiện → chạy guard → ghi lịch sử → mirror trạng thái → phát effect.
  - Versioning: mỗi đề tài ghim version template lúc tạo; sửa graph không ảnh hưởng đề tài đang dở.
  - Validate graph khi kích hoạt (guard-rail trình cấu hình).
- **Ngoài phạm vi:**
  - Đa `entityType` — hiện chỉ `RESEARCH_PROJECT` (giữ cột cho tương lai, không build admin generic đa-entity).
  - Cài đặt cụ thể của từng guard/effect (thuộc module domain: `proposal`/`review`/`acceptance`…).
  - Vận chuyển sự kiện qua broker/Event Stream (thuộc chuẩn DomainEvent — [ADR-0010](../../architecture/decisions/0010-chuan-du-lieu-cho-ai-tham-gia.md) & ADR Event Stream riêng).

## 3. Luồng nghiệp vụ chính

Khi một tác nhân yêu cầu chuyển bước (`execute(entity, transitionCode, user)`), kernel (thuần điều phối):

1. Nạp instance (đã ghim version template) + các transition hợp lệ từ bước hiện tại.
2. Kiểm tra built-in: `allowedRoles` (role RMS) và `requiresComment`.
3. Chạy các **guard** đã đăng ký cho transition → **chặn** nếu fail.
4. Ghi trong **một transaction**: cập nhật bước hiện tại của instance + `WorkflowHistory` + `AuditLog`.
5. Mirror trạng thái lên đề tài: `status = bước mới`; `statusSemantic = statusSemantic của bước mới`.
6. Phát các **effect** đã đăng ký (qua event) → module domain tự xử lý (vd `notify`, `setRevisionDeadline`).

## 4. Business rules

| ID | Quy tắc | Mô tả | Ghi chú |
|----|---------|-------|---------|
| BR-01 | Chuyển trạng thái chỉ qua engine | Mọi đổi trạng thái `ResearchProject` đi qua engine; cấm update enum ở UI/tầng dữ liệu | [§4.2](../../../AGENTS.md) |
| BR-02 | Ranh giới cấu hình | Per-tenant chỉ được chọn *graph* và *chọn guard/effect nào* từ **danh mục cố định**; cài đặt guard/effect luôn ở code domain | ADR-0007 |
| BR-03 | Mỗi bước có `statusSemantic` | Mỗi step gắn một `statusSemantic` hợp lệ — từ vựng chuẩn để báo cáo/business rule chạy xuyên tổ chức | dùng cho B02 |
| BR-04 | Ghim version | Mỗi đề tài ghim version template lúc tạo; sửa graph **không** ảnh hưởng đề tài đang chạy | versioning bắt buộc |
| BR-05 | Quyền theo role RMS | `allowedRoles` của transition trỏ về **role RMS** (không phải realm-role Keycloak); phân quyền thực thi ở backend | [ADR-0005](../../architecture/decisions/0005-sso-va-rbac.md) |
| BR-06 | Validate graph khi kích hoạt | Đúng 1 step khởi đầu, mọi step kết thúc reachable, không transition mồ côi, mọi step có `statusSemantic` hợp lệ | guard-rail |
| BR-07 | Lịch sử append-only | Mỗi transition thành công ghi `WorkflowHistory` + `AuditLog` trong cùng transaction; append-only | [§4.4](../../../AGENTS.md) |
| BR-08 | Bắt buộc lý do | Transition cấu hình `requiresComment` mà thiếu comment thì bị chặn | built-in |
| BR-09 | Một entityType | Hiện chỉ áp dụng cho `RESEARCH_PROJECT` | phạm vi hiện tại |

## 5. Dữ liệu (mức khái niệm)

- **Mẫu vòng đời (Workflow template)** — graph các bước & chuyển bước của một tổ chức, có phiên bản.
- **Phiên đang chạy (Workflow instance)** — vòng đời thực của một đề tài, ghim version mẫu.
- **Nhật ký chuyển bước (Workflow history)** — append-only, ai/khi/từ bước nào sang bước nào, lý do.
- **`statusSemantic`** — từ vựng trạng thái ổn định, chung cho mọi tổ chức.

Chi tiết bảng/trường → [data-model §3, §4.8](../../architecture/data-model.md) và `design.md`.

## 6. Acceptance criteria

- **AC-01** (BR-01) — Given có cố gắng đổi trạng thái đề tài trực tiếp (ngoài engine), When thực hiện, Then bị từ chối; chỉ engine mới đổi được trạng thái.
- **AC-02** (BR-02, BR-03) — Given tổ chức ráp lifecycle riêng từ catalog (vd `DRAFT→DUYỆT_NHANH→IN_PROGRESS→DONE`), When chạy, Then engine chạy đúng **không cần sửa code**, mỗi bước có `statusSemantic` hợp lệ.
- **AC-03** (BR-04) — Given đề tài đang chạy trên template v1, When admin sửa graph thành v2, Then đề tài đó **vẫn** theo v1 tới khi kết thúc.
- **AC-04** (BR-05) — Given tác nhân thiếu role RMS mà transition yêu cầu, When thực hiện, Then bị chặn ở backend.
- **AC-05** (BR-06) — Given graph thiếu `statusSemantic` ở một bước hoặc có transition mồ côi, When kích hoạt template, Then bị từ chối kèm thông báo lỗi rõ.
- **AC-06** (BR-07) — Given một transition thành công, Then sinh đúng một bản ghi `WorkflowHistory` + `AuditLog`, và không thể sửa/xoá.
- **AC-07** (BR-08) — Given transition `requiresComment`, When không nhập lý do, Then bị chặn.
- **AC-08** (BR-02) — Given một guard fail (vd `validateProposalContent`), When thực hiện transition, Then bị chặn; effect (`notify`…) chỉ phát khi transition thành công.

## 7. Phụ thuộc & rủi ro

- **Nguồn thiết kế:** [ADR-0007](../../architecture/decisions/0007-workflow-engine-dong-per-tenant.md) (engine 3 tầng, kernel ~100 dòng, danh mục guard/effect khởi điểm).
- **Phụ thuộc:** role RMS từ [B03](../B03-quan-ly-nguoi-dung/) ([ADR-0005](../../architecture/decisions/0005-sso-va-rbac.md)); actor mở rộng trong `WorkflowHistory` theo [ADR-0010](../../architecture/decisions/0010-chuan-du-lieu-cho-ai-tham-gia.md); nhật ký dùng [P02 Audit](../P02-audit/); `statusSemantic` cần thêm vào `packages/domain-types`.
- **Là dependency cứng của:** F01–F06 (mọi chuyển trạng thái đề tài).
- **Rủi ro / điểm cần chốt:** lift an toàn từ engine cũ (gỡ nhánh hardcode trong `execute()`); **danh mục guard/effect khởi điểm** và **tập `statusSemantic` chuẩn** cần chốt với PO/BA của F01–F06; guard-rail trình cấu hình graph.
