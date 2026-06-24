---
title: "E4 — Hoạt động khoa học mở rộng & Quy đổi giờ giảng"
id: "E4"
status: Draft
updated: 2026-06-24
source: "docs/epics/BienBan_TongHop_NCKH_ThuyLoi.md"
---

# E4 — Hoạt động khoa học mở rộng & Quy đổi giờ giảng

> Epic này gom **phạm vi mở rộng** phát sinh từ khảo sát **ĐH Thủy Lợi**
> (xem [biên bản](BienBan_TongHop_NCKH_ThuyLoi.md)). Khác với E1–E3 (vòng đời đề tài *cấp cơ sở*),
> E4 phủ các **loại hoạt động khoa học khác** (đề tài cấp trên, đề tài SV, dự án sản xuất,
> hội nghị/cộng đồng/SHTT) và **trục xuyên suốt mới: quy đổi giờ giảng** đổ về lý lịch khoa học.

## Mục tiêu (outcome)
Mọi hoạt động khoa học của giảng viên (đề tài mọi cấp, bài báo, hội nghị, phục vụ cộng đồng, SHTT)
được **ghi nhận, phê duyệt/cấp kinh phí khi cần, và quy đổi ra giờ giảng** — tự động tổng hợp vào
**lý lịch khoa học** (F08).

## Pha
Later (sau khi vòng đời cốt lõi E1–E2 ổn định) — *phụ thuộc chốt phạm vi với Trường*.

## Feature thành phần
| Mã | Feature | Module (đề xuất) | Vai trò trong Epic |
|---|---|---|---|
| [P03](../features/P03-quy-doi-gio-giang/) | Quy đổi giờ giảng *(Platform/xuyên suốt)* | `teaching-hour` | Engine + cấu hình công thức quy đổi theo loại hoạt động; nguồn nuôi F08 |
| [F09](../features/F09-de-tai-cap-tren/) | Đề tài cấp trên (Tỉnh/Bộ/Nhà nước) | `upper-project` | Quản lý **đầu mục** (không full lifecycle): đầu mục, thời gian, kết quả, giờ giảng |
| [F10](../features/F10-de-tai-sinh-vien/) | Đề tài sinh viên | `student-project` | Vòng đời đề tài SV; tính giờ giảng cho GV hướng dẫn |
| [F11](../features/F11-du-an-phuc-vu-san-xuat/) | Dự án phục vụ sản xuất | `applied-project` | Dự án thuộc viện, liên kết công ty ngoài: tên/thành viên/kinh phí |
| [F12](../features/F12-hoat-dong-khoa-hoc/) | Hoạt động khoa học & minh chứng | `activity` | **Gộp** Hội nghị/Hội thảo + Phục vụ cộng đồng + SHTT (quy trình chung) |

> **Liên quan E3 (mở rộng, không thuộc E4):** Công bố/bài báo (build-out [F07](../features/F07-san-pham-khoa-hoc/)
> với 2 luồng độc lập/thuộc đề tài + phê duyệt & cấp kinh phí + link đề tài↔bài) và build-out
> [F08](../features/F08-ly-lich-khoa-hoc/) (tự tổng hợp + trích template + ký xác nhận). E4 *cấp dữ liệu*
> giờ giảng cho F08.

## Phụ thuộc
- **Epic:** E0 (RBAC, danh mục, workflow, audit, thông báo); tái dùng mô hình **Cuộc họp/Hội đồng** (F03)
  và **Kinh phí** (F05) cho các hoạt động cần phê duyệt/cấp kinh phí.
- **Tích hợp mới (xem mục Open questions):** SSO Microsoft Entra ID; đồng bộ GV/SV; số hóa dữ liệu 5 năm.

## Open questions (chặn, cần chốt với Trường — từ biên bản §D)
- **Công thức quy đổi giờ giảng** cho từng loại hoạt động (đề tài/bài báo/hội nghị/cộng đồng/SHTT) — chặn P03.
- **Phạm vi vòng đời đề tài SV** ("dự kiến" trong biên bản) — chặn F10.
- **Cơ chế link tự động đề tài ↔ bài báo** — chặn build-out F07.
- **Phạm vi quản lý kinh phí** cho hoạt động (chỉ ghi nhận hay dự toán/giải ngân) — ảnh hưởng F11/F12.
- **SSO Microsoft Entra ID** vs ADR-0008 (Keycloak email-OTP) — cần **ADR mới** (federate Entra / Keycloak làm broker).
- **Đồng bộ GV/SV** từ HR/hệ thống sinh viên theo cơ chế "xác nhận, không khai lại" — cần bổ sung `integrations.md`.
- **Số hóa dữ liệu cũ 5 năm** — cần feature/công cụ import (khác migrate code repo cũ ở `migration-coverage.md`).

## Định nghĩa hoàn thành (Exit criteria)
- [ ] P03 cấu hình được công thức quy đổi & tính ra giờ giảng cho từng sự kiện hoạt động.
- [ ] F09–F12 ghi nhận đúng từng loại hoạt động và phát sinh sự kiện giờ giảng.
- [ ] Giờ giảng tự động tổng hợp vào lý lịch khoa học (F08).
- [ ] Quyết định & (nếu chốt) triển khai SSO Microsoft, đồng bộ GV/SV, số hóa 5 năm.
