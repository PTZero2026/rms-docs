# AGENTS.md — Hiến pháp cho AI agent (RMS)

> File này là nguồn ngữ cảnh **bắt buộc đọc trước** cho mọi AI agent làm việc trên repo.
> Con người đọc `README.md`; agent đọc file này. Giữ ngắn, cập nhật khi quy ước đổi.
> Quyết định về cấu trúc repo nằm trong [ADR-0015](docs/architecture/decisions/0015-monorepo-rms.md).

## 1. Repo là gì
Monorepo cho **Hệ thống Quản lý Nghiên cứu Khoa học (RMS)** gồm tài liệu, ứng dụng web và thư viện UI dùng chung.
`docs/features/<feature>/spec.md` là **nguồn sự thật nghiệp vụ** (acceptance criteria).

## 2. Bản đồ thư mục
| Thư mục | Nội dung | Agent dùng để |
|---|---|---|
| `apps/web/` | React, TypeScript, Vite | Chạy ứng dụng web |
| `packages/ui/` | Component shadcn/ui và theme Tailwind | Dùng lại giao diện trong web |
| `docs/product/` | vision, glossary, personas, roadmap | WHY & WHAT mức sản phẩm |
| `docs/architecture/` | overview, data-model, integrations, migration-coverage, **variation-points** (cấu hình per-tenant) + `decisions/` (ADR) | Kiến trúc & quyết định hệ thống đích |
| `docs/features/<mã>/` | `spec.md` (nghiệp vụ) · `design.md` (kỹ thuật) · `ui.md` · `test-plan.md` | Truy hồi spec, AC, thiết kế từng feature |
| `docs/epics/` | Lớp Epic E0–E4 gom feature theo vòng đời & nền tảng | Xác định phạm vi & phụ thuộc |
| `docs/guides/` | Onboarding & vận hành | Hướng dẫn |
| `docs/templates/` | Mẫu rỗng spec/design/ui/test-plan/adr | Tạo tài liệu mới |

> Cấu hình harness ẩn (không phải tài liệu nghiệp vụ): `.claude/`, `.specify/`, `.agents/`, `.github/`.
> `apps/backend` và `packages/api-contracts` là các workspace dự kiến trong kế hoạch triển khai.

## 3. Ánh xạ feature ↔ module backend (thiết kế hệ thống đích — BẮT BUỘC giữ nhất quán)
> Dùng ánh xạ này khi triển khai backend để truy vết từ module về spec/design.

`F01→proposal · F02→call · F03→review · F04→progress · F05→budget · F06→acceptance · F07→product · F08→profile`
`B01→catalog · B02→report · B03→iam · B04→notification · B06→home` (B06 = trang chủ/dashboard cá nhân — khung nhìn tổng hợp read-only sau đăng nhập; `B05` để dành Cổng công khai).
`P01→workflow (kernel dùng chung) · P02→audit` — **Platform spec** (năng lực nền do Kiến trúc/DEV sở hữu, không phải feature CRUD; xuyên suốt mọi feature).
**Năng lực mở rộng E4 (optional, bật/tắt per-tenant — [ADR-0012](docs/architecture/decisions/0012-ranh-gioi-loi-vs-cau-hinh-tenant.md); Draft):** `F09→upper-project · F10→student-project · F11→applied-project · F12→activity` ·
`P03→teaching-hour` (Platform xuyên suốt — quy đổi giờ giảng, nguồn nuôi F08). Xem [E4](docs/epics/E4-hoat-dong-mo-rong.md).
Quy ước kênh và ranh giới AI có căn cứ trong [ADR-0014](docs/architecture/decisions/0014-kenh-san-pham-va-ke-hoach-invest.md).
Nguồn: [overview.md §3](docs/architecture/overview.md).

## 4. Luật bất biến (thiết kế hệ thống đích — mọi spec/design phải tôn trọng)
1. **Một web app, phân quyền ở backend** cho mọi API; UI chỉ ẩn/hiện theo quyền, không phải lớp bảo vệ. ([ADR-0005](docs/architecture/decisions/0005-sso-va-rbac.md), [ADR-0009](docs/architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md))
2. **Vòng đời `ResearchProject`** chuyển trạng thái qua domain service dùng chung — KHÔNG tự update enum ở màn hình.
3. **Hợp đồng API**: nguồn duy nhất ở `packages/api-contracts` rồi sinh type; tài liệu design trỏ về đó, không gõ type lệch hai phía.
4. **Audit**: mọi hành động đổi trạng thái nghiệp vụ ghi `AuditLog` (append-only).
5. Tiền VND, ngày `dd/MM/yyyy`, giờ hiển thị Asia/Ho_Chi_Minh, lưu UTC.

6. **Kênh sản phẩm.** Web responsive dùng một ứng dụng. Tiền tố `web-` cho tác vụ trên web, `mobile-` cho trải nghiệm đặc thù màn hình nhỏ, `shared-` cho luật/dịch vụ dùng lại. B06 chỉ đọc, mọi thao tác đi tới feature sở hữu. PO chỉ đưa push/offline/native vào kế hoạch sau khi hai đơn vị xác nhận cùng nhu cầu và phương án quản lý dữ liệu thiết bị.
7. **Trợ lý AI.** Chỉ xử lý nguồn được phép trong phạm vi người dùng/tenant, lưu căn cứ và phiên bản, để người dùng quyết định dùng/bỏ. Mọi thay đổi nghiệp vụ vẫn qua thẩm quyền của con người và dịch vụ miền. Khi thiếu nguồn hoặc dịch vụ gián đoạn, tác vụ thủ công vẫn thực hiện được. E4 và AI phải được bật theo tenant.

## 5. Chạy và kiểm tra
Từ gốc repo, dùng `pnpm install --frozen-lockfile`, `pnpm dev`, `pnpm typecheck` và `pnpm build`.
Thêm component bằng CLI shadcn từ `apps/web`. Bản mẫu tĩnh ở `wireframe-prototype/` và bộ kiểm thử pilot ở `e2e/` có hướng dẫn chạy riêng.

## 6. Định nghĩa hoàn thành (DoD) cho tài liệu
- `spec.md` có Business rules (`BR-xx`) và Acceptance criteria (`AC-xx`) rõ ràng; mỗi AC có ≥1 test case trong `test-plan.md`.
- Màn hình trong `ui.md` map được về AC; `design.md` có bảng truy vết `BR/AC → cách hiện thực`.
- Không phá ánh xạ feature↔module (§3) và các luật bất biến (§4); thuật ngữ/trạng thái khớp tài liệu dùng chung.
- `status` và `updated` ở frontmatter đã cập nhật; thay đổi luật trong `spec.md` cần reviewer là PO/BA.

## 7. Quy trình Spec-Driven (GitHub Spec Kit)
Repo dùng **Spec Kit** (chạy trong Claude Code, Antigravity, Cursor, Codex, không cần API) qua các skill `/speckit-*`:
`constitution → specify → clarify → plan → tasks → analyze(tùy chọn) → converge(tùy chọn) → implement`.
- **Hiến pháp**: `.specify/memory/constitution.md` là bản *chiếu* của file này (§4 + §6); khi đổi
  luật, sửa AGENTS.md trước rồi đồng bộ (chạy `/speckit-constitution`). AGENTS.md là canonical.
- **Hai nơi chứa spec, không thay thế nhau**:
  - `specs/NNN-slug/` — *xưởng* SDD: nơi `/speckit-*` sinh `spec.md`, `plan.md`, `tasks.md`,
    `research.md`… (đánh số tuần tự, gắn tiền tố kênh; chọn lát bằng SPECIFY_FEATURE_DIRECTORY). Artifact trung gian của quy trình.
  - `docs/features/<feature>/` — **nguồn sự thật nghiệp vụ đã chốt** (`spec.md`/`design.md`/
    `ui.md`/`test-plan.md`, truy vết `BR-xx`/`AC-xx`). Khi nội dung ở `specs/` đã chín thì
    chắt lọc về đây.
- **Lớp Epic**: `docs/epics/` gom feature theo vòng đời (E0 nền tảng + E1–E3 + E4 năng lực mở rộng optional). Phân tầng đầy đủ:
  **Epic (`docs/epics/`) → Feature (`docs/features/`) → Spec làm việc (`specs/`)**. Bản đồ & phụ thuộc ở
  [docs/epics/README.md](docs/epics/README.md); gắn feature↔epic qua field `epic:` trong frontmatter spec.
- Trong đợt lập kế hoạch, mỗi thẻ INVEST có một thư mục `specs/NNN-<web|mobile|shared>-slug/`. Chạy đủ specify → clarify → plan → tasks. Hiện thực task trong workspace phụ trách.
- Quyết định tư vấn phải ghi mã, use case, khuyến nghị, vai trò duyệt và trạng thái. Chỉ cập nhật BR/AC đã chốt sau review của PO/BA. Tài liệu bị thay toàn bộ được lưu dưới `ref/` và có đường dẫn tới bản hiện hành.

## 8. Phương pháp luận Superpowers & Hệ sinh thái Skills dùng chung mọi AI
Dự án tích hợp bộ kỹ năng theo chuẩn Agent Skills (`agentskills.io`), được cài đặt đồng bộ tại 3 vị trí để **tất cả các AI agent cùng sử dụng**:
- `.agents/skills/`: Chuẩn mở Agent Skills (dành cho Google Antigravity, OpenAI Codex CLI, v.v.).
- `.claude/skills/`: Dành cho Anthropic Claude Code.
- `.cursor/skills/`: Dành cho Cursor Agent / Cursor IDE.

### Nguyên tắc Superpowers (`using-superpowers`)
Mọi agent phải tuân thủ kỷ luật kỹ thuật trước khi hành động:
1. **Brainstorming trước khi lập kế hoạch (`brainstorming`)**: Khi tiếp cận tính năng hay yêu cầu mới, khơi gợi ý định, thảo luận ngắn gọn trước khi chốt spec/plan.
2. **Kỷ luật TDD & Debug có hệ thống (`systematic-debugging`, `test-driven-development`)**: 4 bước tìm nguyên nhân gốc rễ, viết kiểm thử trước khi sửa, không suy đoán.
3. **Xác minh trước khi tuyên bố hoàn thành (`verification-before-completion`)**: Luôn chạy kiểm chứng thực tế và đối soát bằng chứng trước khi kết luận đạt yêu cầu.
4. **Phân rã sub-agent & Review 2 chặng (`subagent-driven-development`, `requesting-code-review`)**: Tách nhỏ nhiệm vụ, kiểm tra tuân thủ spec trước, sau đó duyệt chất lượng kỹ thuật.

### Danh mục Skills cài đặt trong dự án
| Nhóm | Kỹ năng | Nguồn | Mục đích sử dụng trong RMS |
|---|---|---|---|
| **Kỹ thuật & Quy trình (Superpowers)** | `using-superpowers`, `brainstorming`, `writing-plans`, `executing-plans`, `subagent-driven-development`, `systematic-debugging`, `test-driven-development`, `verification-before-completion`, `requesting-code-review`, `receiving-code-review`, `using-git-worktrees`, `finishing-a-development-branch`, `dispatching-parallel-agents`, `diagnosing-superpowers`, `writing-skills` | [obra/superpowers](https://github.com/obra/superpowers) | Phương pháp luận kỹ thuật phần mềm, TDD, quy trình làm việc chuẩn xác và điều tra lỗi có bằng chứng. |
| **Quy trình Spec Kit (SDD)** | `speckit-constitution`, `speckit-specify`, `speckit-clarify`, `speckit-plan`, `speckit-tasks`, `speckit-checklist`, `speckit-converge`, `speckit-analyze`, `speckit-implement`, `speckit-agent-context-update` | [github/spec-kit](https://github.com/github/spec-kit) (v1.4.2) | Bộ công cụ Spec-Driven Development: sinh spec, kế hoạch, phân rã tasks, đối soát chéo và cập nhật ngữ cảnh agent. |
| **Soạn thảo & Tài liệu (Docs)** | `doc-coauthoring`, `docx`, `pptx`, `xlsx`, `pdf` | [anthropics/skills](https://github.com/anthropics/skills) | Soạn thảo tài liệu kiến trúc/spec, xử lý hồ sơ Word/PDF đề tài NCKH, slide thuyết trình giải pháp (`docs/sales/`), bảng tính kinh phí (`F05`). |
| **Kiểm thử & Giao diện** | `webapp-testing`, `frontend-design`, `web-artifacts-builder` | [anthropics/skills](https://github.com/anthropics/skills) | Tự động hóa kiểm thử Playwright (`e2e/`), thiết kế UI/UX chất lượng cao, dựng mẫu giao diện tương tác (`wireframe-prototype/`). |
| **Thiết kế và rà soát UI/UX** | `ui-ux-pro-max` | [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/f76d1653d7467fc11fb9d9d79295a421c92ab958/.claude/skills/ui-ux-pro-max) | Tra cứu hướng dẫn về biểu mẫu, điều hướng, khả năng tiếp cận và cách áp dụng với React hoặc shadcn/ui. |
| **Mở rộng & Tích hợp** | `skill-creator`, `mcp-builder` | [anthropics/skills](https://github.com/anthropics/skills) | Tạo và đo lường kỹ năng mới, xây dựng máy chủ MCP tích hợp hệ thống backend RMS. |

