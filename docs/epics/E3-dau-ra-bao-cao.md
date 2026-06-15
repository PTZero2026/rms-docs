---
title: "E3 — Đầu ra, Lý lịch & Báo cáo"
id: "E3"
status: Draft
updated: 2026-06-12
---

# E3 — Đầu ra, Lý lịch & Báo cáo

## Mục tiêu (outcome)
Khai thác đầu ra & dữ liệu tích lũy: **sản phẩm khoa học gắn về đề tài nguồn, lý lịch nhà khoa học
tổng hợp, báo cáo thống kê xuyên tổ chức, và công khai nội dung được phép**.

## Pha
Later.

## Feature thành phần
| Mã | Feature | Module | Vai trò trong Epic |
|---|---|---|---|
| [F07](../features/F07-san-pham-khoa-hoc/) | Sản phẩm khoa học | `product` | Kê khai sản phẩm, gắn đề tài nguồn & tác giả, minh chứng |
| [F08](../features/F08-ly-lich-khoa-hoc/) | Lý lịch khoa học | `profile` | Khung nhìn tổng hợp User + sản phẩm + vai trò trong đề tài |
| [B02](../features/B02-bao-cao-thong-ke/) | Báo cáo & thống kê | `report` | Dashboard, lọc, drill-down, export; dùng `statusSemantic` xuyên tổ chức |
| ◌ Cổng công khai | *(chưa có mã)* | — | Hiển thị công khai nội dung được phép (tóm tắt đề tài, sản phẩm công bố) |

## Phụ thuộc
- **Epic**: E0; *dữ liệu* sinh ra ở E1–E2.
- **ADR**: [0007 statusSemantic](../architecture/decisions/0007-workflow-engine-dong-per-tenant.md) (báo cáo xuyên tổ chức) ·
  [0010 Chuẩn dữ liệu cho AI](../architecture/decisions/0010-chuan-du-lieu-cho-ai-tham-gia.md) (phân loại dữ liệu nhạy cảm khi công khai).
- **Nội bộ**: F08 tổng hợp từ F01/F07/B03; B02 cần dữ liệu vòng đời + kinh phí + hội đồng.

## Open questions
- **F07, F08, B02 còn khung mẫu** — cần PO/BA điền đầy đủ (Bối cảnh/Luồng/BR/AC/Dữ liệu).
- **Cổng công khai**: tách thành feature `B05` (có spec/ui/test riêng) hay giữ mục epic-level? Cần quyết định.
- Ranh giới dữ liệu PUBLIC vs INTERNAL khi công khai (theo `dataClassification`).

## Định nghĩa hoàn thành (Exit criteria)
- [ ] Kê khai sản phẩm & gắn về đề tài nguồn; chuyên viên duyệt (F07).
- [ ] Lý lịch khoa học tổng hợp đúng từ đề tài + sản phẩm (F08).
- [ ] Báo cáo xuyên tổ chức dùng `statusSemantic`; export & kiểm soát dữ liệu nhạy cảm (B02).
- [ ] Quyết định & (nếu chọn) triển khai cổng công khai chỉ hiển thị dữ liệu được phép.
