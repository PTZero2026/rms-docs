---
title: "Audit (nhật ký hành động nghiệp vụ)"
id: "P02"
epic: "E0"
owner: "Kiến trúc/DEV (SA)"
status: Draft        # Draft | Review | Approved
version: 0.1
updated: 2026-06-12
---

# Audit (nhật ký hành động nghiệp vụ)

> **Năng lực nền (Platform)** — hạ tầng xuyên suốt do Kiến trúc/DEV sở hữu, mọi feature dùng. Nguồn:
> luật bất biến [AGENTS.md §4.4](../../../AGENTS.md), [ADR-0010](../../architecture/decisions/0010-chuan-du-lieu-cho-ai-tham-gia.md)
> (actor mở rộng), mô hình [data-model §4.7](../../architecture/data-model.md). File này chốt *cái gì & tại sao*;
> schema/trường ở data-model & `design.md`.

## 1. Bối cảnh & mục tiêu

Luật bất biến [AGENTS.md §4.4](../../../AGENTS.md): **mọi hành động đổi trạng thái nghiệp vụ phải ghi
`AuditLog` append-only**. Mục tiêu: một cơ chế nhật ký **truy vết được, minh bạch, không thể sửa**, phục vụ
soát xét, điều tra sự cố và (về sau) eval khi **AI tham gia như một tác nhân**. Vì AI/hệ thống sẽ hành động
trong hệ thống, nhật ký dùng **mô hình actor mở rộng** (`HUMAN | SYSTEM | AI_AGENT`) ngay từ đầu để khỏi
phải migration toàn hệ thống về sau ([ADR-0010](../../architecture/decisions/0010-chuan-du-lieu-cho-ai-tham-gia.md)).

## 2. Phạm vi

- **Trong phạm vi:**
  - Ghi `AuditLog` cho mọi hành động đổi trạng thái nghiệp vụ (tạo/sửa/xoá/chuyển trạng thái).
  - Append-only (không sửa, không xoá), ghi cùng transaction với thay đổi nghiệp vụ.
  - Mô hình actor: `actorType` (`HUMAN|SYSTEM|AI_AGENT`), `actorId`, `onBehalfOf` khi hành động thay người.
  - Xem/truy vấn nhật ký theo phân quyền & phạm vi dữ liệu.
- **Ngoài phạm vi:**
  - Log kỹ thuật/hạ tầng (tách khỏi audit nghiệp vụ).
  - `DomainEvent`/outbox và Event Stream (thuộc chuẩn 4 của [ADR-0010](../../architecture/decisions/0010-chuan-du-lieu-cho-ai-tham-gia.md) + ADR riêng).
  - Provenance của AI (`modelId`, `promptVersion`…) — gắn ở `AiSuggestion`, không ở `AuditLog`.

## 3. Luồng nghiệp vụ chính

Mỗi hành động nghiệp vụ làm thay đổi trạng thái → ghi một bản ghi `AuditLog` **trong cùng transaction** với
thay đổi đó (ACID) → bản ghi **không bao giờ** bị sửa/xoá. Chuyển trạng thái đề tài còn ghi song hành
`WorkflowHistory` (xem [P01](../P01-workflow-engine/)).

## 4. Business rules

| ID | Quy tắc | Mô tả | Ghi chú |
|----|---------|-------|---------|
| BR-01 | Ghi audit mọi đổi trạng thái | Mọi hành động đổi trạng thái nghiệp vụ phải sinh `AuditLog` | [§4.4](../../../AGENTS.md) |
| BR-02 | Append-only | `AuditLog` không được sửa, không được xoá | bất biến |
| BR-03 | Cùng transaction | Ghi audit trong cùng transaction với thay đổi nghiệp vụ (rollback thì không có audit "ma") | ACID |
| BR-04 | Đủ thông tin truy vết | Mỗi bản ghi có actor (`actorType`/`actorId`/`onBehalfOf`), hành động, đối tượng đích, giá trị trước/sau, thời điểm | [data-model §4.7](../../architecture/data-model.md) |
| BR-05 | Tách log kỹ thuật | Audit nghiệp vụ tách khỏi log hạ tầng/kỹ thuật | — |
| BR-06 | Xem theo quyền | Xem nhật ký tuân RLS tenant + RBAC; không lộ bản ghi ngoài phạm vi | [ADR-0008](../../architecture/decisions/0008-keycloak-idp-dang-nhap-email-otp.md) |
| BR-07 | AI/hệ thống là actor thật | AI/hệ thống ghi audit như một actor chịu RLS+RBAC, dùng `onBehalfOf` khi thay người; **không** tạo "user ảo" | [ADR-0010](../../architecture/decisions/0010-chuan-du-lieu-cho-ai-tham-gia.md) |

## 5. Dữ liệu (mức khái niệm)

- **Bản ghi nhật ký (AuditLog)** — ai (actor) làm gì (action), trên đối tượng nào (target), giá trị trước/sau, khi nào.
- **Nhật ký chuyển bước (WorkflowHistory)** — song hành cho riêng vòng đời đề tài (thuộc [P01](../P01-workflow-engine/)).

Chi tiết trường → [data-model §4.7](../../architecture/data-model.md) và `design.md`.

## 6. Acceptance criteria

- **AC-01** (BR-01) — Given một thao tác đổi trạng thái nghiệp vụ (vd duyệt đề xuất), When hoàn tất, Then có một bản ghi `AuditLog` tương ứng.
- **AC-02** (BR-02) — Given một bản ghi `AuditLog`, When cố sửa hoặc xoá, Then bị từ chối.
- **AC-03** (BR-03) — Given thao tác nghiệp vụ bị rollback, Then **không** tồn tại bản ghi audit cho thao tác đó.
- **AC-04** (BR-04, BR-07) — Given hành động do hệ thống/AI thực hiện thay một người, Then audit ghi `actorType` đúng và `onBehalfOf` là người được thay.
- **AC-05** (BR-06) — Given người dùng không đủ quyền hoặc khác tenant, When xem nhật ký, Then không thấy bản ghi ngoài phạm vi được phép.

## 7. Phụ thuộc & rủi ro

- **Nguồn:** [AGENTS.md §4.4](../../../AGENTS.md), [ADR-0010](../../architecture/decisions/0010-chuan-du-lieu-cho-ai-tham-gia.md) (actor mở rộng — *Proposed*), `AuditLog` gốc theo [ADR-0002](../../architecture/decisions/0002-kien-truc-hai-mat-mot-backend.md).
- **Phụ thuộc:** RBAC & tenant từ [B03](../B03-quan-ly-nguoi-dung/); ghi song hành với [P01](../P01-workflow-engine/) khi chuyển trạng thái.
- **Là dependency cứng của:** mọi feature có hành động đổi trạng thái (F01–F08, B01–B04).
- **Rủi ro / điểm cần chốt:** danh sách **action chuẩn** cần audit cho từng module; chính sách **lưu trữ/retention** nhật ký; ranh giới với `DomainEvent` (chuẩn 4 ADR-0010) để không ghi trùng tầng.
