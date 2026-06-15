# AGENTS.md — Hiến pháp cho AI agent (RMS)

> File này là nguồn ngữ cảnh **bắt buộc đọc trước** cho mọi AI coding agent làm việc trên repo.
> Con người đọc `README.md`; agent đọc file này. Giữ ngắn, cập nhật khi quy ước đổi.
> Quyết định nền tảng: [ADR-0006](docs/architecture/decisions/0006-monorepo-ai-first.md).

## 1. Repo là gì
Monorepo AI-first cho **Hệ thống Quản lý Nghiên cứu Khoa học (RMS)**. Gồm tài liệu nghiệp vụ
(`docs/`) **và** code chạy được (`apps/`, `packages/`). Tài liệu là **nguồn sự thật nghiệp vụ** —
khi sinh/sửa code phải bám `docs/features/<feature>/spec.md` (acceptance criteria).

## 2. Bản đồ thư mục
| Thư mục | Nội dung | Agent dùng để |
|---|---|---|
| `docs/` | product, architecture (+ADR), features, guides, templates | Truy hồi spec, AC, kiến trúc, quyết định |
| `apps/web` | SPA hợp nhất, điều hướng theo phân quyền | Code toàn bộ giao diện (mọi vai trò) |
| `apps/backend` | Modular monolith, `src/modules/<module>` | Domain logic; 1 module ↔ 1 feature |
| `packages/api-contracts` | OpenAPI + type sinh ra | Hợp đồng API dùng chung FE/BE |
| `packages/ui` | Design system dùng chung | Component giao diện dùng chung |
| `packages/domain-types` | Enum/model dùng chung (vd trạng thái `ResearchProject`) | Type chia sẻ |
| `packages/config` | eslint/tsconfig/prettier | Cấu hình dùng chung |
| `ai/context` | Spec dạng máy-đọc (trích từ `docs/features`) | Truy hồi AC có cấu trúc |
| `ai/prompts` `ai/rules` `ai/evals` | Prompt mẫu, rule per-module, eval | Tự định hướng & tự kiểm |
| `db/` | migrations + seed | Khớp `docs/architecture/data-model.md` |
| `infra/` | IaC, docker-compose, k8s | Môi trường chạy |
| `e2e/` | Test xuyên app | Khớp `docs/features/*/test-plan.md` |

## 3. Ánh xạ feature ↔ module backend (BẮT BUỘC giữ)
`F01→proposal · F02→call · F03→review · F04→progress · F05→budget · F06→acceptance · F07→product · F08→profile`
`B01→catalog · B02→report · B03→iam · B04→notification`.
`P01→workflow (kernel dùng chung) · P02→audit` — **Platform spec** (năng lực nền do Kiến trúc/DEV sở hữu, không phải feature CRUD; xuyên suốt mọi feature).
Nguồn: [overview.md §3](docs/architecture/overview.md).

## 4. Luật bất biến (đọc trước khi sửa)
1. **Một web app, phân quyền ở backend** cho mọi API; UI chỉ ẩn/hiện theo quyền, không phải lớp bảo vệ. ([ADR-0005](docs/architecture/decisions/0005-sso-va-rbac.md), [ADR-0009](docs/architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md))
2. **Vòng đời `ResearchProject`** chuyển trạng thái qua domain service dùng chung — KHÔNG tự update enum ở màn hình.
3. **Hợp đồng API**: sửa ở `packages/api-contracts` rồi sinh type; không tự gõ type lệch hai phía.
4. **Audit**: mọi hành động đổi trạng thái nghiệp vụ ghi `AuditLog` (append-only).
5. Tiền VND, ngày `dd/MM/yyyy`, giờ hiển thị Asia/Ho_Chi_Minh, lưu UTC.

## 5. Lệnh (điền khi chọn stack — xem TODO)
```
# TODO: cập nhật sau khi chốt tooling (ADR tiếp theo)
install:   <pnpm install>
dev:       <pnpm dev>
build:     <pnpm build>
test:      <pnpm test>
lint:      <pnpm lint>
```

## 6. Định nghĩa hoàn thành (DoD) cho agent
- Bám acceptance criteria trong `spec.md` của feature liên quan.
- Có test khớp `test-plan.md`; lint & build sạch.
- Không phá ánh xạ feature↔module và 5 luật bất biến ở §4.
- PR mô tả thay đổi và liên kết feature/ADR liên quan.

## 7. Quy trình Spec-Driven (GitHub Spec Kit)
Repo dùng **Spec Kit** (chạy trong Claude Code, không cần API) qua các skill `/speckit-*`:
`constitution → specify → clarify(tùy chọn) → plan → tasks → analyze(tùy chọn) → implement`.
- **Hiến pháp**: `.specify/memory/constitution.md` là bản *chiếu* của file này (§4 + §6); khi đổi
  luật, sửa AGENTS.md trước rồi đồng bộ (chạy `/speckit-constitution`). AGENTS.md là canonical.
- **Hai nơi chứa spec, không thay thế nhau**:
  - `specs/NNN-slug/` — *xưởng* SDD: nơi `/speckit-*` sinh `spec.md`, `plan.md`, `tasks.md`,
    `research.md`… (đánh số tuần tự, kèm nhánh git). Artifact trung gian của quy trình.
  - `docs/features/<feature>/` — **nguồn sự thật nghiệp vụ đã chốt** (`spec.md`/`design.md`/
    `ui.md`/`test-plan.md`, truy vết `BR-xx`/`AC-xx`). Khi nội dung ở `specs/` đã chín thì
    chắt lọc về đây.
- **Lớp Epic**: `docs/epics/` gom feature theo vòng đời (E0 nền tảng + E1–E3). Phân tầng đầy đủ:
  **Epic (`docs/epics/`) → Feature (`docs/features/`) → Spec làm việc (`specs/`)**. Bản đồ & phụ thuộc ở
  [docs/epics/README.md](docs/epics/README.md); gắn feature↔epic qua field `epic:` trong frontmatter spec.
- Dự án đang ở pha **docs-first**: `plan`/`tasks`/`implement` chỉ dùng khi bước sang thực thi code.
