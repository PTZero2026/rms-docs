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

Ngữ cảnh dự án ở [../AGENTS.md](../AGENTS.md), không lặp lại ở đây.
