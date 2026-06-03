# Hệ thống Quản lý Nghiên cứu Khoa học (RMS) — Monorepo

Monorepo **AI-first**: tài liệu (`docs/`) và code chạy được (`apps/`, `packages/`) sống chung một Git,
review chung PR. Tài liệu theo mô hình **docs-as-code**; tài liệu là **nguồn sự thật nghiệp vụ** mà code
bám theo. Quyết định nền tảng: [ADR-0006](docs/architecture/decisions/0006-monorepo-ai-first.md).

> **AI agent** (Claude Code) đọc [AGENTS.md](AGENTS.md) trước mọi tác vụ — đó là nguồn ngữ cảnh chính.

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
docs/           ★ Tài liệu (nguồn sự thật) — product / architecture / features / guides / templates
apps/           Ứng dụng chạy được: fe-portal · bo-admin · backend (modular monolith)
packages/       Code dùng chung: api-contracts · ui · domain-types · config
ai/             Tài sản cho LLM/agent: context · prompts · rules · evals
db/             Migration & seed (khớp docs/architecture/data-model.md)
infra/          IaC, môi trường chạy
scripts/        Tooling tự động hóa
e2e/            Test xuyên ứng dụng
.claude/        Cấu hình Claude Code (commands · agents · skills · settings)
AGENTS.md       Hiến pháp cho AI agent
```

Chi tiết từng tầng: README trong mỗi thư mục (`apps/README.md`, `packages/README.md`, `ai/README.md`…).

### Bên trong `docs/`

```
product/        WHY & WHAT mức sản phẩm — ít thay đổi
architecture/   HOW mức hệ thống + ADR (quyết định kiến trúc)
features/       ★ Trục chính: mỗi feature 1 thư mục, gom đủ tài liệu
guides/         Onboarding & vận hành
templates/      Mẫu rỗng cho spec / frontend / backoffice / test-plan / adr
```

## Quy ước feature

- `F0x-...` = feature hướng **người dùng cuối** (có thể kèm mặt quản trị).
- `B0x-...` = feature **thuần quản trị / hạ tầng dùng chung**.
- Trong mỗi feature: `spec.md` là nguồn sự thật nghiệp vụ; `frontend.md` / `backoffice.md`
  chỉ mô tả giao diện; `test-plan.md` bám vào acceptance criteria của `spec.md`.

## Danh sách feature

| Mã  | Feature | FE | BO |
|-----|---------|:--:|:--:|
| F01 | Đề xuất đề tài | ✓ | ✓ |
| F02 | Đợt kêu gọi đề xuất | ✓ | ✓ |
| F03 | Xét duyệt hội đồng | ✓ | ✓ |
| F04 | Quản lý tiến độ | ✓ | ✓ |
| F05 | Quản lý kinh phí | ✓ | ✓ |
| F06 | Nghiệm thu | ✓ | ✓ |
| F07 | Sản phẩm khoa học | ✓ | ✓ |
| F08 | Lý lịch khoa học | ✓ | ✓ |
| B01 | Danh mục & cấu hình | – | ✓ |
| B02 | Báo cáo & thống kê | – | ✓ |
| B03 | Quản lý người dùng | – | ✓ |
| B04 | Thông báo | ✓ | ✓ |

Xem `CONTRIBUTING.md` để biết quy ước đặt tên, vòng đời tài liệu và Definition of Done.
