---
title: "ADR-0006: Chuyển repo tài liệu thành monorepo AI-first"
status: Superseded
superseded_by: "ADR-0011"
date: 2026-06-03
deciders: "SA, Tech lead, PO"
---

# ADR-0006: Chuyển repo tài liệu thành monorepo AI-first

> ⚠️ **Superseded bởi [ADR-0011](0011-tach-code-quay-ve-docs-only.md)** (2026-06-24): phần "đưa code vào
> repo" đã bị đảo — repo quay về **thuần tài liệu (docs-only)**, code sẽ nằm ở repo riêng. Vẫn giữ giá trị
> docs-as-code, "AI-first" và ánh xạ feature↔module (dùng làm thiết kế hệ thống đích). Nội dung dưới đây giữ
> nguyên để truy vết lịch sử.

## Bối cảnh
Repo hiện tại là **docs-only** (`product/`, `architecture/`, `features/`, `guides/`, `templates/`) theo
mô hình docs-as-code. Bước tiếp theo là đưa **code chạy được** vào cùng repo: hai SPA giao diện (FE Portal,
BO Admin) và một backend modular monolith — đúng kiến trúc đã chốt ở [ADR-0002](0002-kien-truc-hai-mat-mot-backend.md).

Đồng thời đội ngũ lean và muốn dùng **AI coding agent** (Claude Code) làm lực lượng phát triển chính. Để
agent làm việc đúng và nhất quán, repo cần là nguồn ngữ cảnh tự mô tả: quy ước, lệnh build/test, ranh giới
module, và spec dạng máy-đọc phải nằm ngay trong repo thay vì trong đầu người. "AI-first" ở đây nghĩa là
**tối ưu cấu trúc repo cho agent đọc–sửa–kiểm chứng**, không chỉ cho con người.

Tài liệu nghiệp vụ (`features/`) là một nguồn sự thật; nếu code và docs tách hai repo sẽ lệch nhau và agent
mất khả năng truy hồi acceptance criteria khi sinh code.

## Quyết định
Chuyển repo thành **monorepo AI-first một-gốc**: dồn tài liệu hiện tại vào `docs/`, thêm `apps/` (fe-portal,
bo-admin, backend), `packages/` (code dùng chung), `ai/` (tài sản cho LLM), cùng hạ tầng agent ở `.claude/`
và `AGENTS.md`. Docs và code sống chung, version chung, một nguồn sự thật.

Mỗi feature tài liệu (`F0x`, `B0x`) tiếp tục ánh xạ 1–1 tới một module backend (`proposal`, `iam`, …) như
[overview.md §3](../overview.md) đã định.

## Phương án đã cân nhắc
- **A — Monorepo AI-first một gốc (chọn):** docs + code + tài sản AI chung một Git. Agent có đủ ngữ cảnh,
  refactor xuyên tầng (spec→contract→FE/BE) trong một PR, dùng chung `api-contracts`/`ui`. Nhược: cần tooling
  workspace và kỷ luật ranh giới thư mục.
- **B — Polyrepo (docs riêng, mỗi app một repo):** ranh giới cứng nhưng đồng bộ liên repo thủ công, agent
  mất ngữ cảnh chéo, spec dễ lệch code — đi ngược nguyên tắc một nguồn sự thật.
- **C — Giữ docs-only, code ở nơi khác:** giữ nguyên hiện trạng nhưng không giải quyết được nhu cầu đưa code
  vào và để agent truy hồi spec khi sinh code.

## Hệ quả
- Repo gốc tái cấu trúc: tài liệu hiện tại chuyển vào `docs/` (đường dẫn nội bộ trong Markdown cần rà lại).
- Thêm tầng mới: `apps/`, `packages/`, `ai/`, `infra/`, `db/`, `scripts/`, `.github/`, và hạ tầng agent
  `.claude/` + `AGENTS.md` (xem README mỗi tầng để biết trách nhiệm).
- `packages/api-contracts/` trở thành nguồn sinh type dùng chung FE/BE, sinh từ spec — giảm lệch hợp đồng API.
- `ai/context/` giữ bản máy-đọc của `features/*/spec.md` để agent truy hồi acceptance criteria chính xác;
  cần quy trình giữ đồng bộ với bản Markdown.
- Cần chốt tooling workspace (pnpm + Turborepo/Nx nếu thuần TS; cân nhắc khác nếu backend đa ngôn ngữ) —
  ghi ở một ADR tiếp theo khi chọn stack cụ thể.
- `AGENTS.md` là "hiến pháp" cho agent; `CLAUDE.md` trỏ về nó để tránh trùng lặp.
