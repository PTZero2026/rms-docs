# .claude/ — Cấu hình Claude Code dùng chung team

| Mục | Nội dung |
|---|---|
| `settings.json` | permissions, hooks, env dùng chung (commit vào repo). Cấu hình cá nhân để ở `settings.local.json` (gitignore). |
| `commands/` | Slash command nội bộ, vd `/new-feature`, `/gen-api`, `/scaffold-module`. |
| `agents/` | Sub-agent chuyên biệt (reviewer, test-writer…). |
| `skills/` | Skill tái dùng (scaffold module, gen migration…). |

## Skill đã cài (35 skills)

Hệ sinh thái skills được đồng bộ giữa `.claude/skills/`, `.agents/skills/` và `.cursor/skills/` để mọi AI (Claude Code, Antigravity, Cursor, Codex) dùng chung:

| Nhóm | Kỹ năng | Nguồn | Mục đích sử dụng |
|---|---|---|---|
| **Superpowers** (15 skills) | `using-superpowers`, `brainstorming`, `writing-plans`, `executing-plans`, `subagent-driven-development`, `systematic-debugging`, `test-driven-development`, `verification-before-completion`, `requesting-code-review`, `receiving-code-review`, `using-git-worktrees`, `finishing-a-development-branch`, `dispatching-parallel-agents`, `diagnosing-superpowers`, `writing-skills` | [obra/superpowers](https://github.com/obra/superpowers) | Phương pháp luận kỹ thuật: TDD, debug 4 bước, lập kế hoạch, review chéo, kiểm chứng trước khi hoàn thành. |
| **Spec Kit (SDD)** (10 skills) | `speckit-constitution`, `speckit-specify`, `speckit-clarify`, `speckit-plan`, `speckit-tasks`, `speckit-checklist`, `speckit-converge`, `speckit-analyze`, `speckit-implement`, `speckit-agent-context-update` | [github/spec-kit](https://github.com/github/spec-kit) (v1.4.2) | Bộ công cụ Spec-Driven Development: quy trình từ hiến pháp, đặc tả, kế hoạch đến phân rã task và đối soát. |
| **Tài liệu & Office** (5 skills) | `doc-coauthoring`, `docx`, `pptx`, `xlsx`, `pdf` | [anthropics/skills](https://github.com/anthropics/skills) | Soạn thảo tài liệu kiến trúc/spec, xử lý mẫu Word/PDF hồ sơ NCKH, slide giới thiệu giải pháp (`docs/sales/`), bảng tính kinh phí (`F05`). |
| **Kiểm thử & UI** (3 skills) | `webapp-testing`, `frontend-design`, `web-artifacts-builder` | [anthropics/skills](https://github.com/anthropics/skills) | Tự động hóa kiểm thử Playwright (`e2e/`), thiết kế UI/UX hiện đại, xây dựng mẫu giao diện tương tác (`wireframe-prototype/`). |
| **Mở rộng** (2 skills) | `skill-creator`, `mcp-builder` | [anthropics/skills](https://github.com/anthropics/skills) | Tạo và đo lường kỹ năng mới, xây dựng máy chủ MCP tích hợp. |

## Spec Kit (Spec-Driven Development)

Cài bằng CLI chính chủ `specify init --here --integration claude` (phiên bản CLI v1.4.2). Đã cài đặt đa tích hợp an toàn (`claude`, `codex`, `cursor-agent`). Thành phần:

| Đường dẫn | Vai trò |
|---|---|
| `.specify/memory/constitution.md` | Hiến pháp (bản chiếu của [../AGENTS.md](../AGENTS.md) §4/§6). |
| `.specify/templates/` | Template `spec`/`plan`/`tasks`/`checklist`/`constitution`. |
| `.specify/scripts/bash/` | Script tạo feature, setup plan/tasks. |
| `specs/NNN-slug/` | Xưởng chạy SDD (sinh khi gọi `/speckit-specify`). |

Quan hệ `specs/` ↔ `docs/features/`: xem [../AGENTS.md](../AGENTS.md) §7. AGENTS.md là canonical.

Ngữ cảnh dự án ở [../AGENTS.md](../AGENTS.md), không lặp lại ở đây.
