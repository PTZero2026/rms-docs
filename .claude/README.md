# .claude/ — Cấu hình Claude Code dùng chung team

| Mục | Nội dung |
|---|---|
| `settings.json` | permissions, hooks, env dùng chung (commit vào repo). Cấu hình cá nhân để ở `settings.local.json` (gitignore). |
| `commands/` | Slash command nội bộ, vd `/new-feature`, `/gen-api`, `/scaffold-module`. |
| `agents/` | Sub-agent chuyên biệt (reviewer, test-writer…). |
| `skills/` | Skill tái dùng (scaffold module, gen migration…). |

Ngữ cảnh dự án ở [../AGENTS.md](../AGENTS.md), không lặp lại ở đây.
