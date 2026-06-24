# Hệ thống Quản lý Nghiên cứu Khoa học (RMS) — Tài liệu

Repo **thuần tài liệu** (docs-only) theo mô hình **docs-as-code**: đây là **nguồn sự thật nghiệp vụ &
kiến trúc** của hệ thống RMS. Code chạy được nằm ở repo riêng (pha thực thi) — xem
[ADR-0011](docs/architecture/decisions/0011-tach-code-quay-ve-docs-only.md).

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
