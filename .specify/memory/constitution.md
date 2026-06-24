# Hiến pháp RMS — Hệ thống Quản lý Nghiên cứu Khoa học

<!--
  Đây là bản "hiến pháp" theo định dạng GitHub Spec Kit, dùng cho các flow
  /speckit-specify · /speckit-plan · /speckit-tasks · /speckit-analyze · /speckit-implement.

  NGUỒN CANONICAL là AGENTS.md (§4 Luật bất biến, §6 DoD). File này là bản chiếu
  của AGENTS.md sang định dạng Spec Kit — KHI ĐỔI LUẬT, sửa AGENTS.md trước, rồi
  đồng bộ lại đây (chạy /speckit-constitution hoặc cập nhật tay). Không để hai bên lệch.
-->

## Core Principles

### I. Tài liệu là nguồn sự thật (Spec-Driven)
Nghiệp vụ được chốt ở `docs/features/<feature>/spec.md` qua mã `BR-xx`/`AC-xx`. Mọi
việc sinh/sửa code phải bám acceptance criteria; không hiện thực thứ không có trong spec,
không đổi luật nghiệp vụ trong code mà chưa cập nhật spec. Repo ưu tiên **docs trước, code sau**.

> **Repo thuần tài liệu (docs-only)** — code chạy được nằm ở repo riêng ([ADR-0011](../../docs/architecture/decisions/0011-tach-code-quay-ve-docs-only.md),
> thay thế ADR-0006). Nguyên tắc II–V dưới đây là **luật thiết kế hệ thống đích** mà spec/design phải tôn trọng.

### II. Một web app, phân quyền ở backend (NON-NEGOTIABLE)
Mọi API phải có kiểm tra authorization ở backend (controller/service) kèm data scoping theo
tenant/quyền. UI chỉ ẩn/hiện theo vai trò — **không** phải lớp bảo vệ.
Tham chiếu: ADR-0005 (SSO & RBAC), ADR-0009 (hợp nhất một web phân quyền).

### III. Vòng đời `ResearchProject` qua domain service (NON-NEGOTIABLE)
Mọi chuyển trạng thái của `ResearchProject` đi qua domain service dùng chung.
**Cấm** tự update enum trạng thái trực tiếp ở màn hình hay ở tầng dữ liệu.

### IV. Hợp đồng API tập trung
Thay đổi API phải sửa ở `packages/api-contracts` (OpenAPI) rồi **sinh** type;
không tự gõ type ở FE/BE khiến hai phía lệch nhau.

### V. Audit append-only (NON-NEGOTIABLE)
Mọi hành động đổi trạng thái nghiệp vụ phải ghi `AuditLog`. Log là append-only —
không xóa, không sửa. Quyền tải/xem tệp đính kèm bám theo quyền của thực thể nguồn.

## Ràng buộc dữ liệu & định dạng

- Tiền tệ: **VND**.
- Ngày hiển thị: **dd/MM/yyyy**; giờ hiển thị theo **Asia/Ho_Chi_Minh**.
- Lưu trữ thời gian: **UTC**.
- Ánh xạ feature ↔ module **hệ thống đích** là BẮT BUỘC giữ nhất quán (xem AGENTS.md §3):
  `F01→proposal · F02→call · F03→review · F04→progress · F05→budget · F06→acceptance ·
  F07→product · F08→profile · B01→catalog · B02→report · B03→iam · B04→notification ·
  P01→workflow · P02→audit`. Mở rộng E4 (ĐH Thủy Lợi, Draft): `F09→upper-project ·
  F10→student-project · F11→applied-project · F12→activity · P03→teaching-hour`.

## Quy trình Spec-Driven (Spec Kit)

Vòng làm việc cho một feature mới hoặc thay đổi lớn:

1. `/speckit-constitution` — soát/đồng bộ hiến pháp này với AGENTS.md.
2. `/speckit-specify` — sinh đặc tả ở `specs/NNN-slug/spec.md` (xưởng làm việc của Spec Kit).
3. `/speckit-clarify` *(tùy chọn)* — hỏi để khử mơ hồ trước khi lập kế hoạch.
4. `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` *(tùy chọn)* — chỉ dùng khi
   bước sang giai đoạn thực thi code (hiện dự án ở pha docs-first, dùng khi cần).
5. Khi nội dung đã chín, **chắt lọc** spec từ `specs/NNN-*/` về `docs/features/<feature>/`
   (bản nghiệp vụ đã chốt, theo quy ước `spec.md`/`design.md`/`ui.md`/`test-plan.md`).

`specs/` = nơi quy trình SDD chạy & lưu artifact trung gian (plan/tasks/research).
`docs/features/` = nguồn sự thật nghiệp vụ đã duyệt. `docs/epics/` = lớp Epic (E0–E4) gom feature
theo vòng đời. Ba lớp **Epic → Feature → Spec** không thay thế nhau.

## Definition of Done

- **Tài liệu (pha hiện tại — docs-only):** `spec.md` có `BR-xx`/`AC-xx` rõ ràng; mỗi AC có ≥1 test case
  trong `test-plan.md`; `ui.md` map về AC; `design.md` có bảng truy vết; `status`/`updated` đã cập nhật.
- **Code (khi bước sang repo thực thi):** bám AC trong spec; có test khớp `test-plan.md`; lint & build sạch.
- Không phá ánh xạ feature↔module và các luật bất biến ở trên; PR liên kết feature/ADR liên quan.

## Governance

Hiến pháp này thể hiện các luật bất biến của repo; khi xung đột, **luật bất biến thắng**.
Nguồn canonical là [AGENTS.md](../../AGENTS.md) — mọi thay đổi nguyên tắc phải sửa ở đó trước,
kèm cập nhật ADR tương ứng trong `docs/architecture/decisions/`, rồi đồng bộ file này.
Mọi PR/review phải kiểm chứng tuân thủ; độ phức tạp phát sinh phải được giải trình.

**Version**: 1.1.0 | **Ratified**: 2026-06-12 | **Last Amended**: 2026-06-24
