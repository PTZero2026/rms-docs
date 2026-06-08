---
title: "ADR-0007: Workflow engine cấu hình động per-tenant cho vòng đời ResearchProject"
status: Accepted
date: 2026-06-07
deciders: "SA, Tech lead, PO/BA (F01–F06)"
---

# ADR-0007: Workflow engine cấu hình động per-tenant cho vòng đời ResearchProject

## Bối cảnh

Luật bất biến [AGENTS.md §4.2](../../../AGENTS.md) yêu cầu chuyển trạng thái `ResearchProject` qua một
**domain service dùng chung**, không tự update enum ở màn hình. RMS là **đa tổ chức** ([migration-coverage §1](../migration-coverage.md)),
và **vòng đời đề tài có thể khác nhau giữa các tổ chức** — đặc biệt NCKH nội bộ có thể bỏ bước hội đồng,
gộp bước duyệt, đổi tên trạng thái.

Repo cũ ([nckh-backend/src/modules/workflow](https://github.com/ducnv2509/BE_NCKH)) đã có một engine cấu hình động
(`WorkflowTemplate/Step/Transition/Instance/History`, per-tenant, versioned) — nhưng `execute()` (587 dòng)
**hardcode chặt vào domain**: cố định `entityType='RESEARCH_PROJECT'`, các transition `submit`/`cancel`,
map `PROPOSAL_STATUS_MAP`, ép `step.code as ProjectStatus`, validate đề cương viết thẳng trong engine.

→ Hệ quả: engine *trả giá* của tính cấu hình động nhưng **không thật sự tổng quát**. Khi một tổ chức dùng
graph khác, các nhánh hardcode này chạy sai hoặc văng lỗi — tức tính đa tổ chức **gãy ngay trên engine
hiện có**. Đây không còn là vấn đề "sạch code" mà là vấn đề **đúng/sai**.

## Quyết định

Giữ workflow engine **cấu hình động per-tenant**, nhưng tái cấu trúc theo **mô hình 3 tầng** để kéo toàn bộ
domain logic ra khỏi kernel; bổ sung một tầng **`statusSemantic` chuẩn hoá** để báo cáo và business rule
hoạt động xuyên tổ chức dù tên trạng thái khác nhau.

| Tầng | Ở đâu | Nội dung | Ai sửa |
|---|---|---|---|
| **1. Graph** | DB (`Workflow*`), per-tenant, versioned | Steps, transitions, `allowedRoles`, `requiresComment` | Tổ chức tự cấu hình |
| **2. Từ vựng ngữ nghĩa** (cố định) | Catalog trong code | Mỗi step gắn 1 `statusSemantic`; mỗi transition chọn `guards[]` + `effects[]` từ danh mục có sẵn | Dev định nghĩa danh mục; tổ chức *chọn* dùng |
| **3. Handlers** | Code (module domain) | Cài đặt thật của guard/effect | Dev |

**Ranh giới vàng:** cấu hình per-tenant chỉ được chọn **graph + chọn guard/effect nào áp vào transition nào**,
*từ một danh mục cố định*. Cài đặt của guard/effect luôn nằm trong code domain module — không bao giờ nhét vào engine.

### Kernel sau tái cấu trúc (~100 dòng, thuần điều phối)
```
execute(entity, transitionCode, user):
  1. load instance (đã ghim templateVersion) + transitions hợp lệ từ currentStep
  2. check built-in: allowedRoles (role RMS), requiresComment
  3. chạy GUARDS đã đăng ký cho transition  → chặn nếu fail
  4. ghi (1 transaction): instance.currentStep + WorkflowHistory + ActivityLog
  5. mirror: entity.status = newStep.code; entity.statusSemantic = newStep.statusSemantic
  6. fire EFFECTS đã đăng ký (event) → domain module tự xử
```

### Danh mục guard/effect khởi điểm (rút từ chính nhánh hardcode của `execute()` cũ)
| Loại | Tên | Thay cho hardcode cũ |
|---|---|---|
| guard | `requireComment` | `transition.requiresComment` (giữ, đưa vào catalog) |
| guard | `validateProposalContent` | nhánh `submit` validate trường bắt buộc (dòng 416–453) |
| guard | `authorCancellableOnly` | nhánh `cancel` + `AUTHOR_CANCELLABLE_STEPS` (dòng 400–410) |
| effect | `syncProposalStatus` | `PROPOSAL_STATUS_MAP`, increment version, `submittedAt`/`revisionNote` (dòng 469, 521–540) |
| effect | `setRevisionDeadline` | `revisionRequest` + `revisionDeadline` (dòng 471–487) |
| effect | `clearRevision` | clear khi APPROVED/IN_PROGRESS (dòng 483–486) |
| effect | `notify` | event `workflow.autoActions` → module `notification` |

`validateProposalContent` chuyển về module `proposal` → hết circular-dep mà code cũ phải "re-implement check here".

## Phương án đã cân nhắc

- **A — Giữ động per-tenant + 3 tầng (chọn):** đáp ứng đúng yêu cầu lifecycle khác nhau giữa tổ chức; domain
  logic nằm đúng chỗ; engine tổng quát thật. Đổi lại: giữ chi phí của template per-tenant + versioning.
- **B — Hardcode vòng đời trong code (state machine tĩnh dùng chung):** đơn giản nhất, nhưng **trái yêu cầu
  đa tổ chức** — không cho NCKH nội bộ có lifecycle riêng. Loại.
- **C — Giữ nguyên engine cũ (động nhưng hardcode trong `execute`):** vẫn động trên giấy nhưng gãy khi graph
  khác — mang tiếng linh hoạt mà không dùng được. Loại.

## Hệ quả

**Được:**
- Mỗi tổ chức ráp lifecycle riêng từ các khối có sẵn, **không đụng code** (vd nội bộ: `DRAFT→DUYỆT_NHANH→IN_PROGRESS→DONE`).
- Kernel nhỏ, testable; mọi đặc thù NCKH tập trung ở handlers, dễ kiểm thử độc lập.
- Báo cáo B02/dashboard và business rule xuyên tổ chức dựa trên `statusSemantic`, không vỡ khi tên step khác nhau.

**Phải làm tiếp:**
- Thêm enum `statusSemantic` vào `packages/domain-types` (dùng chung FE/BE/report); thêm cột `status_semantic`
  vào `research_projects` và trường `statusSemantic` cho `WorkflowStep`.
- `allowedRoles` của transition trỏ về **role RMS** ([ADR-0005](0005-sso-va-rbac.md)), **không** phải realm-role Keycloak;
  bước lift cần ánh xạ lại. Phân quyền vẫn thực thi ở backend ([AGENTS.md §4.1](../../../AGENTS.md)).
- **Versioning bắt buộc giữ:** mỗi `WorkflowInstance` ghim version template lúc tạo; sửa graph không được ảnh
  hưởng đề tài đang dở.
- **Guard-rail trình cấu hình:** validate graph khi kích hoạt — đúng 1 step `isInitial`, mọi `isFinal` reachable,
  không transition mồ côi; mỗi step phải gắn `statusSemantic` hợp lệ.
- **Phạm vi hiện tại: 1 `entityType` = `RESEARCH_PROJECT`.** Giữ cột `entityType` cho tương lai nhưng không
  build admin generic đa-entity; bỏ logic versioning/seed thừa cho entity khác.
- `autoActions: string[]` (Json, stringly-typed) → thay bằng catalog effect có kiểu, đăng ký tường minh.
- `WorkflowHistory` + `ActivityLog` giữ append-only ([AGENTS.md §4.4](../../../AGENTS.md)).
- Engine kernel đặt làm **domain service dùng chung** (hiện thực [AGENTS.md §4.2](../../../AGENTS.md)); các module
  `proposal`/`review`/`acceptance` đăng ký guard/effect, không tự đổi `status`.
