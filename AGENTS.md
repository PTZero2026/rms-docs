# AGENTS.md — Hiến pháp cho AI agent (RMS)

> File này là nguồn ngữ cảnh **bắt buộc đọc trước** cho mọi AI agent làm việc trên repo.
> Con người đọc `README.md`; agent đọc file này. Giữ ngắn, cập nhật khi quy ước đổi.
> Quyết định nền tảng: [ADR-0011](docs/architecture/decisions/0011-tach-code-quay-ve-docs-only.md)
> (repo thuần tài liệu, thay thế [ADR-0006](docs/architecture/decisions/0006-monorepo-ai-first.md) monorepo).

## 1. Repo là gì
Repo **thuần tài liệu (docs-only)** cho **Hệ thống Quản lý Nghiên cứu Khoa học (RMS)**, theo mô hình
docs-as-code. Chỉ chứa tài liệu nghiệp vụ & kiến trúc trong `docs/` — **không có code chạy được** (code
ở repo riêng, pha thực thi; xem [ADR-0011](docs/architecture/decisions/0011-tach-code-quay-ve-docs-only.md)).
`docs/features/<feature>/spec.md` là **nguồn sự thật nghiệp vụ** (acceptance criteria).

## 2. Bản đồ thư mục
| Thư mục | Nội dung | Agent dùng để |
|---|---|---|
| `docs/product/` | vision, glossary, personas, roadmap | WHY & WHAT mức sản phẩm |
| `docs/architecture/` | overview, data-model, integrations, migration-coverage, **variation-points** (cấu hình per-tenant) + `decisions/` (ADR) | Kiến trúc & quyết định hệ thống đích |
| `docs/features/<mã>/` | `spec.md` (nghiệp vụ) · `design.md` (kỹ thuật) · `ui.md` · `test-plan.md` | Truy hồi spec, AC, thiết kế từng feature |
| `docs/epics/` | Lớp Epic E0–E4 gom feature theo vòng đời & nền tảng | Xác định phạm vi & phụ thuộc |
| `docs/guides/` | Onboarding & vận hành | Hướng dẫn |
| `docs/templates/` | Mẫu rỗng spec/design/ui/test-plan/adr | Tạo tài liệu mới |

> Cấu hình harness ẩn (không phải tài liệu nghiệp vụ): `.claude/`, `.specify/`, `.agents/`, `.github/`.
> Các tài liệu kiến trúc/design **vẫn tham chiếu** `apps/backend`, `packages/api-contracts`… với tư cách
> **mô tả hệ thống đích** ở repo code tương lai — không phải thư mục trong repo này.

## 3. Ánh xạ feature ↔ module backend (thiết kế hệ thống đích — BẮT BUỘC giữ nhất quán)
> Ánh xạ này mô tả module ở **repo code tương lai**, không phải thư mục trong repo tài liệu này; giữ nhất
> quán để spec/design truy vết đúng.

`F01→proposal · F02→call · F03→review · F04→progress · F05→budget · F06→acceptance · F07→product · F08→profile`
`B01→catalog · B02→report · B03→iam · B04→notification`.
`P01→workflow (kernel dùng chung) · P02→audit` — **Platform spec** (năng lực nền do Kiến trúc/DEV sở hữu, không phải feature CRUD; xuyên suốt mọi feature).
**Năng lực mở rộng E4 (optional, bật/tắt per-tenant — [ADR-0012](docs/architecture/decisions/0012-ranh-gioi-loi-vs-cau-hinh-tenant.md); Draft):** `F09→upper-project · F10→student-project · F11→applied-project · F12→activity` ·
`P03→teaching-hour` (Platform xuyên suốt — quy đổi giờ giảng, nguồn nuôi F08). Xem [E4](docs/epics/E4-hoat-dong-mo-rong.md).
Nguồn: [overview.md §3](docs/architecture/overview.md).

## 4. Luật bất biến (thiết kế hệ thống đích — mọi spec/design phải tôn trọng)
1. **Một web app, phân quyền ở backend** cho mọi API; UI chỉ ẩn/hiện theo quyền, không phải lớp bảo vệ. ([ADR-0005](docs/architecture/decisions/0005-sso-va-rbac.md), [ADR-0009](docs/architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md))
2. **Vòng đời `ResearchProject`** chuyển trạng thái qua domain service dùng chung — KHÔNG tự update enum ở màn hình.
3. **Hợp đồng API**: nguồn duy nhất ở `packages/api-contracts` (repo code) rồi sinh type; tài liệu design trỏ về đó, không gõ type lệch hai phía.
4. **Audit**: mọi hành động đổi trạng thái nghiệp vụ ghi `AuditLog` (append-only).
5. Tiền VND, ngày `dd/MM/yyyy`, giờ hiển thị Asia/Ho_Chi_Minh, lưu UTC.

## 5. Repo này không build/chạy
Đây là repo **thuần tài liệu** — không có lệnh `install`/`dev`/`build`/`test`. "Kiểm thử" tài liệu là rà
tính nhất quán (xem §6). Lệnh build/test của hệ thống thật thuộc **repo code** (chốt ở ADR khi bước sang thực thi).

## 6. Định nghĩa hoàn thành (DoD) cho tài liệu
- `spec.md` có Business rules (`BR-xx`) và Acceptance criteria (`AC-xx`) rõ ràng; mỗi AC có ≥1 test case trong `test-plan.md`.
- Màn hình trong `ui.md` map được về AC; `design.md` có bảng truy vết `BR/AC → cách hiện thực`.
- Không phá ánh xạ feature↔module (§3) và 5 luật bất biến (§4); thuật ngữ/trạng thái khớp tài liệu dùng chung.
- `status` và `updated` ở frontmatter đã cập nhật; thay đổi luật trong `spec.md` cần reviewer là PO/BA.

## 7. Quy trình Spec-Driven (GitHub Spec Kit)
Repo dùng **Spec Kit** (chạy trong Claude Code, không cần API) qua các skill `/speckit-*`:
`constitution → specify → clarify(tùy chọn) → plan → tasks → analyze(tùy chọn) → implement`.
- **Hiến pháp**: `.specify/memory/constitution.md` là bản *chiếu* của file này (§4 + §6); khi đổi
  luật, sửa AGENTS.md trước rồi đồng bộ (chạy `/speckit-constitution`). AGENTS.md là canonical.
- **Hai nơi chứa spec, không thay thế nhau**:
  - `specs/NNN-slug/` — *xưởng* SDD: nơi `/speckit-*` sinh `spec.md`, `plan.md`, `tasks.md`,
    `research.md`… (đánh số tuần tự, kèm nhánh git). Artifact trung gian của quy trình.
  - `docs/features/<feature>/` — **nguồn sự thật nghiệp vụ đã chốt** (`spec.md`/`design.md`/
    `ui.md`/`test-plan.md`, truy vết `BR-xx`/`AC-xx`). Khi nội dung ở `specs/` đã chín thì
    chắt lọc về đây.
- **Lớp Epic**: `docs/epics/` gom feature theo vòng đời (E0 nền tảng + E1–E3 + E4 năng lực mở rộng optional). Phân tầng đầy đủ:
  **Epic (`docs/epics/`) → Feature (`docs/features/`) → Spec làm việc (`specs/`)**. Bản đồ & phụ thuộc ở
  [docs/epics/README.md](docs/epics/README.md); gắn feature↔epic qua field `epic:` trong frontmatter spec.
- Dự án đang ở pha **docs-first**: `plan`/`tasks`/`implement` chỉ dùng khi bước sang thực thi code.
