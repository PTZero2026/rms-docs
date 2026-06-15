---
title: "E0 — Nền tảng (Platform)"
id: "E0"
status: Draft
updated: 2026-06-12
---

# E0 — Nền tảng (Platform)

> Epic nền tảng: hạ tầng nghiệp vụ & kỹ thuật mà **mọi epic khác phụ thuộc**. Làm sớm/song song với E1.
> Nguồn sự thật nghiệp vụ ở từng `spec.md`; file này định nghĩa phạm vi & phụ thuộc của Epic.

## Mục tiêu (outcome)
Người dùng đăng nhập & được phân quyền; danh mục dùng chung sẵn sàng; mọi chuyển trạng thái đi qua
workflow engine và được ghi audit; thông báo gửi được theo sự kiện. Đây là điều kiện cần để E1–E3 chạy.

## Pha
Now (B01, B03 + nền tảng P01, P02) · xuyên suốt (B04, P02).

## Feature thành phần
| Mã | Feature | Module | Vai trò trong Epic |
|---|---|---|---|
| [B03](../features/B03-quan-ly-nguoi-dung/) | Quản lý người dùng & RBAC | `iam` | Tài khoản, vai trò, quyền `MODULE.ACTION`, data scoping |
| [B01](../features/B01-danh-muc-cau-hinh/) | Danh mục & cấu hình | `catalog` | Cây đơn vị/lĩnh vực, loại SP, tham số, bộ tiêu chí, mẫu biểu |
| [B04](../features/B04-thong-bao/) | Thông báo | `notification` | Gửi in-app/email/SMS theo `eventType`; hàng đợi, retry |
| [P01](../features/P01-workflow-engine/) | Workflow engine | workflow (kernel dùng chung) | Vòng đời `ResearchProject` động per-tenant + `statusSemantic` |
| [P02](../features/P02-audit/) | Audit | `audit` | Nhật ký append-only, actor mở rộng (HUMAN/SYSTEM/AI) |

## Năng lực nền (Platform specs)
P01 & P02 là **spec nền do Kiến trúc/DEV sở hữu** (không phải feature CRUD như B-series) — đã tách thành spec riêng:
- **[P01 Workflow engine](../features/P01-workflow-engine/)** — engine 3 tầng cấu hình động per-tenant
  ([ADR-0007](../architecture/decisions/0007-workflow-engine-dong-per-tenant.md)). **Dependency cứng của F01–F06.**
- **[P02 Audit](../features/P02-audit/)** — `AuditLog` append-only, actor mở rộng
  ([ADR-0010](../architecture/decisions/0010-chuan-du-lieu-cho-ai-tham-gia.md)). **Dependency cứng của mọi feature đổi trạng thái.**

## Phụ thuộc
- **Epic**: không (là nền).
- **ADR**: [0005 SSO & RBAC](../architecture/decisions/0005-sso-va-rbac.md) ·
  [0008 Keycloak email-OTP](../architecture/decisions/0008-keycloak-idp-dang-nhap-email-otp.md) ·
  [0007 Workflow engine](../architecture/decisions/0007-workflow-engine-dong-per-tenant.md) ·
  [0010 Chuẩn dữ liệu cho AI](../architecture/decisions/0010-chuan-du-lieu-cho-ai-tham-gia.md).

## Open questions
- Phạm vi B04 tối thiểu cho E1 (những sự kiện nào cần thông báo trước).
- Danh mục guard/effect khởi điểm & tập `statusSemantic` chuẩn cho P01 (chốt cùng PO/BA F01–F06).
- *(Đã chốt: workflow engine & audit tách thành spec riêng [P01](../features/P01-workflow-engine/) / [P02](../features/P02-audit/).)*

## Định nghĩa hoàn thành (Exit criteria)
- [ ] Đăng nhập email-OTP + RBAC kiểm tra ở backend cho mọi API (B03).
- [ ] Danh mục lõi (đơn vị, lĩnh vực, loại SP, tiêu chí, mẫu biểu) tạo & dùng được (B01).
- [ ] [P01](../features/P01-workflow-engine/) chạy được 1 vòng đời mẫu + ghi lịch sử chuyển bước.
- [ ] [P02](../features/P02-audit/) ghi `AuditLog` append-only cho hành động đổi trạng thái.
- [ ] B04 gửi được ít nhất kênh in-app + email theo `eventType`.
