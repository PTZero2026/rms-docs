# AGENTS.md — Hiến pháp cho AI agent (RMS)

> File này là nguồn ngữ cảnh **bắt buộc đọc trước** cho mọi AI coding agent làm việc trên repo.
> Con người đọc `README.md`; agent đọc file này. Giữ ngắn, cập nhật khi quy ước đổi.
> Quyết định nền tảng: [ADR-0006](docs/architecture/decisions/0006-monorepo-ai-first.md).

## 1. Repo là gì
Monorepo AI-first cho **Hệ thống Quản lý Nghiên cứu Khoa học (RMS)**. Gồm tài liệu nghiệp vụ
(`docs/`) **và** code chạy được (`apps/`, `packages/`). Tài liệu là **nguồn sự thật nghiệp vụ** —
khi sinh/sửa code phải bám `docs/features/<feature>/spec.md` (acceptance criteria).

## 2. Bản đồ thư mục
| Thư mục | Nội dung | Agent dùng để |
|---|---|---|
| `docs/` | product, architecture (+ADR), features, guides, templates | Truy hồi spec, AC, kiến trúc, quyết định |
| `apps/fe-portal` | SPA nhà khoa học | Code giao diện người dùng cuối |
| `apps/bo-admin` | SPA quản trị/hội đồng | Code giao diện back-office |
| `apps/backend` | Modular monolith, `src/modules/<module>` | Domain logic; 1 module ↔ 1 feature |
| `packages/api-contracts` | OpenAPI + type sinh ra | Hợp đồng API dùng chung FE/BE |
| `packages/ui` | Design system dùng chung | Component FE + BO |
| `packages/domain-types` | Enum/model dùng chung (vd trạng thái `ResearchProject`) | Type chia sẻ |
| `packages/config` | eslint/tsconfig/prettier | Cấu hình dùng chung |
| `ai/context` | Spec dạng máy-đọc (trích từ `docs/features`) | Truy hồi AC có cấu trúc |
| `ai/prompts` `ai/rules` `ai/evals` | Prompt mẫu, rule per-module, eval | Tự định hướng & tự kiểm |
| `db/` | migrations + seed | Khớp `docs/architecture/data-model.md` |
| `infra/` | IaC, docker-compose, k8s | Môi trường chạy |
| `e2e/` | Test xuyên app | Khớp `docs/features/*/test-plan.md` |

## 3. Ánh xạ feature ↔ module backend (BẮT BUỘC giữ)
`F01→proposal · F02→call · F03→review · F04→progress · F05→budget · F06→acceptance · F07→product · F08→profile`
`B01→catalog · B02→report · B03→iam · B04→notification` (+ `audit` xuyên suốt).
Nguồn: [overview.md §3](docs/architecture/overview.md).

## 4. Luật bất biến (đọc trước khi sửa)
1. **Phân quyền ở backend** cho mọi API; FE/BO chỉ ẩn/hiện theo quyền, không phải lớp bảo vệ. ([ADR-0005](docs/architecture/decisions/0005-sso-va-rbac.md))
2. **Vòng đời `ResearchProject`** chuyển trạng thái qua domain service dùng chung — KHÔNG tự update enum ở màn hình.
3. **Hợp đồng API**: sửa ở `packages/api-contracts` rồi sinh type; không tự gõ type lệch hai phía.
4. **Audit**: mọi hành động đổi trạng thái nghiệp vụ ghi `AuditLog` (append-only).
5. Tiền VND, ngày `dd/MM/yyyy`, giờ hiển thị Asia/Ho_Chi_Minh, lưu UTC.

## 5. Lệnh (điền khi chọn stack — xem TODO)
```
# TODO: cập nhật sau khi chốt tooling (ADR tiếp theo)
install:   <pnpm install>
dev:       <pnpm dev>
build:     <pnpm build>
test:      <pnpm test>
lint:      <pnpm lint>
```

## 6. Định nghĩa hoàn thành (DoD) cho agent
- Bám acceptance criteria trong `spec.md` của feature liên quan.
- Có test khớp `test-plan.md`; lint & build sạch.
- Không phá ánh xạ feature↔module và 5 luật bất biến ở §4.
- PR mô tả thay đổi và liên kết feature/ADR liên quan.
