# Tài liệu — Hệ thống Quản lý Nghiên cứu Khoa học (RMS)

Repo tài liệu phát triển phần mềm theo mô hình **docs-as-code**: tài liệu là Markdown,
sống cùng Git, review qua merge request, cập nhật chung PR với code.

## Đọc từ đâu

| Bạn là | Bắt đầu ở |
|--------|-----------|
| Người mới | `product/vision.md` → `product/glossary.md` |
| PO / BA   | `product/` rồi vào `features/<feature>/spec.md` |
| SA / DEV  | `architecture/` và `architecture/decisions/` (ADR) |
| TEST      | `features/<feature>/test-plan.md` (bám theo AC trong `spec.md`) |

## Cấu trúc

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
