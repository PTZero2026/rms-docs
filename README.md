# Hệ thống Quản lý Nghiên cứu Khoa học (RMS)

Monorepo gồm ứng dụng web React ở `apps/web/`, thư viện shadcn/ui ở `packages/ui/` và tài liệu nghiệp vụ, kiến trúc ở `docs/`. [ADR-0015](docs/architecture/decisions/0015-monorepo-rms.md)

## Chạy web trên máy

Dùng Node.js theo `.nvmrc` và pnpm theo `packageManager` trong `package.json`. Với Corepack, có thể gọi `corepack pnpm` thay cho `pnpm`. Chạy từ thư mục gốc:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Mở địa chỉ Vite in trong terminal. V0 mở tổng quan của chủ nhiệm Lê Thanh Mai. Chọn **Phiên mô phỏng** để đổi vai trò hoặc trường và thử các thao tác trên dữ liệu giả lập. [Hướng dẫn 20 màn hình và 32 lát nghiệp vụ](docs/guides/rms-v0-frontend.md).

- `pnpm ui:add input` thêm component từ registry shadcn vào `packages/ui/src/components/`, dùng được ngay trong `apps/web`.
- MCP `shadcn` đã được cấu hình cho Codex, Claude Code và Cursor. Sau khi cài dependency, mở repo trong client và kết nối server `shadcn` để tra cứu component từ registry. Server dùng phiên bản CLI của monorepo và đọc cấu hình ở `apps/web/components.json`.
- Skill `ui-ux-pro-max` có sẵn cho Codex, Claude Code và Cursor để thiết kế, rà soát biểu mẫu và khả năng tiếp cận. [Hướng dẫn skill](.agents/skills/ui-ux-pro-max/SKILL.md).
- `pnpm test` chạy kiểm thử nghiệp vụ của V0. `pnpm lint` và `pnpm typecheck` kiểm tra web và UI. `pnpm build` kiểm tra kiểu rồi tạo bản web tĩnh ở `apps/web/dist/`.
- Mở `wireframe-prototype/index.html` để xem bản mẫu HTML. Bộ Playwright pilot có hướng dẫn riêng trong [e2e/README.md](e2e/README.md).

> **AI agent** (Claude Code) đọc [AGENTS.md](AGENTS.md) trước mọi tác vụ — đó là nguồn ngữ cảnh chính.

Bộ hồ sơ kế hoạch tháng 11/2026 gồm [32 lát Spec Kit](specs/README.md), [các quyết định cần review](specs/review-decisions.md) và [lộ trình sản phẩm](docs/product/roadmap.md).

Để duyệt và triển khai v0, đọc [hồ sơ kiến trúc cho SA](docs/architecture/rms-v0-sa-review.md), [thứ tự và phiếu giao việc cho AI](docs/guides/ke-hoach-implement-rms.md) và [kế hoạch kiểm thử feature, bảo mật và tải](docs/guides/kiem-thu-rms.md).

Kết quả kiểm thử, đo tải trên trình duyệt và các yêu cầu chỉnh sửa trước pilot nằm trong [báo cáo rà soát độc lập V0](docs/reviews/rms-v0-frontend.md).

## Đọc từ đâu

| Bạn là | Bắt đầu ở |
|--------|-----------|
| Người mới | `docs/product/vision.md` → `docs/product/glossary.md` |
| PO / BA   | `docs/product/` rồi vào `docs/features/<feature>/spec.md` |
| SA / DEV  | `docs/architecture/` và `docs/architecture/decisions/` (ADR) |
| TEST      | `docs/features/<feature>/test-plan.md` (bám theo AC trong `spec.md`) |
| AI agent  | [AGENTS.md](AGENTS.md) |

## Cấu trúc

```
apps/web/       Ứng dụng web React + TypeScript + Vite
packages/ui/    Component shadcn/ui và theme Tailwind dùng chung
docs/           ★ Toàn bộ tài liệu (nguồn sự thật)
├── product/        WHY & WHAT mức sản phẩm — vision, glossary, personas, roadmap
├── architecture/   HOW mức hệ thống + ADR (quyết định kiến trúc) + data-model, integrations
├── features/       ★ Trục chính: mỗi feature 1 thư mục (spec / design / ui / test-plan)
├── epics/          Lớp Epic (E0–E4): gom feature theo vòng đời & nền tảng
├── guides/         Onboarding & vận hành
└── templates/      Mẫu rỗng cho spec / design / ui / test-plan / adr
AGENTS.md       Hiến pháp cho AI agent (đọc trước mọi tác vụ)
CLAUDE.md       Trỏ về AGENTS.md (riêng cho Claude Code)
CONTRIBUTING.md Quy ước đặt tên, vòng đời tài liệu, Definition of Done
```

Cấu hình harness ẩn: `.claude/` (Claude Code), `.specify/` (Spec Kit), `.agents/`, `.github/`.

## Quy ước feature

- `F0x-...` = feature hướng **người dùng cuối** (có thể kèm mặt quản trị).
- `B0x-...` = feature **thuần quản trị / hạ tầng dùng chung**.
- `P0x-...` = **năng lực nền (Platform)** xuyên suốt, do Kiến trúc/DEV sở hữu.
- Trong mỗi feature: `spec.md` là nguồn sự thật nghiệp vụ (PO/BA); `design.md` mô tả kỹ thuật (DEV);
  `ui.md` mô tả giao diện; `test-plan.md` bám acceptance criteria của `spec.md`.

## Danh sách feature & Epic

Danh sách feature đầy đủ, độ chín tài liệu và checklist rà soát: **[docs/features/README.md](docs/features/README.md)**.
Bản đồ Epic (E0 nền tảng · E1–E3 vòng đời · E4 mở rộng ĐH Thủy Lợi): **[docs/epics/README.md](docs/epics/README.md)**.

Xem [CONTRIBUTING.md](CONTRIBUTING.md) để biết quy ước đặt tên, vòng đời tài liệu và Definition of Done.
