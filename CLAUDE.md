# CLAUDE.md

Ngữ cảnh dự án cho Claude Code nằm ở **[AGENTS.md](AGENTS.md)** — đọc file đó trước mọi tác vụ.
File này cố ý mỏng để tránh trùng lặp; mọi quy ước, bản đồ thư mục, luật bất biến và lệnh build
đều ở `AGENTS.md`.

Bổ sung riêng cho Claude Code:
- Cấu hình harness (permissions, hooks, env) ở `.claude/settings.json`.
- Slash command nội bộ ở `.claude/commands/`, sub-agent ở `.claude/agents/`, skill ở `.claude/skills/`.
