# scripts/ — Tooling tự động hóa

Script cho agent và người dùng chung, vd:
- `gen-types-from-spec` — sinh `packages/api-contracts` / `ai/context` từ `docs/features/*/spec.md`.
- `scaffold-module` — tạo module backend mới khớp ánh xạ feature↔module ([AGENTS.md §3](../AGENTS.md)).

Giữ script idempotent và không phá nguồn sự thật trong `docs/`.
