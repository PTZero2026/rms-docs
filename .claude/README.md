# .claude/ — Cấu hình Claude Code dùng chung team

| Mục | Nội dung |
|---|---|
| `settings.json` | permissions, hooks, env dùng chung (commit vào repo). Cấu hình cá nhân để ở `settings.local.json` (gitignore). |
| `commands/` | Slash command nội bộ, vd `/new-feature`, `/gen-api`, `/scaffold-module`. |
| `agents/` | Sub-agent chuyên biệt (reviewer, test-writer…). |
| `skills/` | Skill tái dùng (scaffold module, gen migration…). |

## Skill đã cài

| Skill | Nguồn | Dùng để |
|---|---|---|
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | Dựng giao diện FE/BO chất lượng cao (`apps/fe-portal`, `apps/bo-admin`, `packages/ui`); tránh thẩm mỹ "AI slop". Tự kích hoạt khi tác vụ liên quan UI. |
| `speckit-*` | [github/spec-kit](https://github.com/github/spec-kit) (`specify init`) | Quy trình Spec-Driven Development: `/speckit-constitution`, `/speckit-specify`, `/speckit-clarify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-analyze`, `/speckit-checklist`, `/speckit-implement`. Chạy trong Claude Code (không cần API). |

## Spec Kit (Spec-Driven Development)

Cài bằng CLI chính chủ `specify init --here --integration claude`. Thành phần:

| Đường dẫn | Vai trò |
|---|---|
| `.specify/memory/constitution.md` | Hiến pháp (bản chiếu của [../AGENTS.md](../AGENTS.md) §4/§6). |
| `.specify/templates/` | Template `spec`/`plan`/`tasks`/`checklist`/`constitution`. |
| `.specify/scripts/bash/` | Script tạo feature, setup plan/tasks. |
| `specs/NNN-slug/` | Xưởng chạy SDD (sinh khi gọi `/speckit-specify`). |

Quan hệ `specs/` ↔ `docs/features/`: xem [../AGENTS.md](../AGENTS.md) §7. AGENTS.md là canonical.

Ngữ cảnh dự án ở [../AGENTS.md](../AGENTS.md), không lặp lại ở đây.
