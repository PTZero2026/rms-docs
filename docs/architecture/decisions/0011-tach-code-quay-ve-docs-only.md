---
title: "ADR-0011: Tách code khỏi repo — quay về repo thuần tài liệu (docs-only)"
status: Accepted
date: 2026-06-24
deciders: "SA, Tech lead, PO/BA"
supersedes: "ADR-0006 (phần đưa code vào repo)"
---

# ADR-0011: Tách code khỏi repo — quay về repo thuần tài liệu (docs-only)

## Bối cảnh

[ADR-0006](0006-monorepo-ai-first.md) chốt biến repo tài liệu thành **monorepo AI-first** chứa cả code
(`apps/`, `packages/`, `db/`, `infra/`, `e2e/`, `scripts/`, `ai/`). Trên thực tế các tầng code này **chưa
bao giờ có code** — chỉ tồn tại dưới dạng thư mục rỗng với `README.md` mô tả ý định và `.gitkeep`.

Hệ quả: cây thư mục gốc phình ~12 đầu mục, đa số rỗng, gây **nhiễu điều hướng** ("loạn đầu mục") trong khi
toàn bộ giá trị thật của repo nằm ở `docs/`. Dự án vẫn đang ở **pha docs-first** (xem [AGENTS.md §7](../../../AGENTS.md));
việc sinh/thực thi code (Spec Kit `plan`/`tasks`/`implement`) chưa bắt đầu.

## Quyết định

**Quay repo về thuần tài liệu (docs-only):** xóa các tầng scaffolding code rỗng, giữ repo chỉ gồm `docs/`
(nguồn sự thật nghiệp vụ + kiến trúc) và các file điều hướng gốc (`README.md`, `AGENTS.md`, `CONTRIBUTING.md`,
`CLAUDE.md`) cùng cấu hình harness ẩn (`.claude/`, `.specify/`, `.agents/`, `.github/`). **Code chạy được sẽ
nằm ở (các) repo riêng** khi bước sang pha thực thi.

Quyết định này **thay thế phần "đưa code vào repo"** của ADR-0006; vẫn **giữ** các giá trị khác của ADR-0006:
docs-as-code, "AI-first" (repo tự mô tả ngữ cảnh cho agent), và quy ước ánh xạ feature ↔ module backend
(dùng làm **thiết kế hệ thống đích**, không phải thư mục code trong repo này).

## Phương án đã cân nhắc

- **A — Docs-only, code ở repo riêng (chọn):** repo gọn, đúng hiện trạng (pha docs-first); tài liệu kiến trúc
  vẫn mô tả hệ thống đích (`apps/backend`, `packages/api-contracts`…) như **tham chiếu thiết kế**. Nhược: khi
  bắt đầu code, cần cơ chế đồng bộ spec ↔ code xuyên repo (chốt ở ADR sau).
- **B — Giữ monorepo rỗng (nguyên ADR-0006):** giữ chỗ sẵn cho code, nhưng duy trì hàng chục thư mục rỗng gây
  nhiễu suốt pha docs-first — chi phí nhận thức không tương xứng.
- **C — Monorepo nhưng ẩn tầng code:** phức tạp hóa cấu hình mà không giải quyết gốc vấn đề (vẫn là repo "code"
  trên danh nghĩa).

## Hệ quả

- **Xóa** `apps/`, `packages/`, `db/`, `infra/`, `e2e/`, `scripts/`, `ai/` (đều rỗng) — Git giữ lịch sử, khôi
  phục được nếu cần. Cây gốc còn `docs/` + 4 file `.md` + cấu hình ẩn.
- **ADR-0006** chuyển trạng thái **Superseded** (trỏ tới ADR này); nội dung giữ lại để truy vết lịch sử quyết định.
- Cập nhật **README.md** (bỏ bản đồ code, đồng bộ danh sách feature), **AGENTS.md** (§2 bản đồ thư mục, §3 ghi
  rõ module là thiết kế đích, §5 bỏ lệnh build code), **CONTRIBUTING.md** (sửa quy ước `ui.md`/`design.md`, bỏ
  "PR chung với code").
- Tài liệu kiến trúc/design (`data-model.md`, `migration-coverage.md`, các ADR, `features/*/design.md`) **vẫn
  tham chiếu** `apps/backend`, `packages/*`… với tư cách **mô tả hệ thống đích** — không sửa, không phải đường
  dẫn trong repo này.
- Khi bước sang pha thực thi: tạo repo code riêng và bổ sung một ADR về mô hình đa-repo + cách đồng bộ spec ↔ code
  (cân nhắc lại `ai/context` máy-đọc ở repo code nếu cần).
