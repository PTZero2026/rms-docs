---
title: "ADR-0009: Hợp nhất một web app điều hướng theo phân quyền (thay hai SPA)"
status: Accepted
date: 2026-06-09
deciders: "SA, Tech lead, PO"
supersedes: "0002-kien-truc-hai-mat-mot-backend"
---

# ADR-0009: Hợp nhất một web app điều hướng theo phân quyền

> **Supersede [ADR-0002](0002-kien-truc-hai-mat-mot-backend.md)** ở phần *tầng giao diện*.
> Phần "một backend modular monolith, một CSDL" của ADR-0002 **vẫn giữ nguyên hiệu lực**.

## Bối cảnh
ADR-0002 chọn **hai SPA giao diện riêng** (Portal FE cho nhà khoa học, BackOffice BO cho quản
trị/hội đồng) trên cùng một backend. Thực tế triển khai cho thấy:
- Nghiệp vụ xoay quanh một thực thể trung tâm `ResearchProject`; nhiều vai trò cùng nhìn vào một
  hồ sơ ở các giai đoạn khác nhau — biên giới FE/BO không trùng với biên giới nghiệp vụ.
- RBAC đã là lằn ranh truy cập thật sự (xem [ADR-0005](0005-sso-va-rbac.md)); duy trì hai SPA chỉ
  nhân đôi chi phí routing, build, design-system và điều hướng mà không thêm bảo mật.
- Một người dùng có thể kiêm nhiều vai trò (vừa chủ nhiệm, vừa thành viên hội đồng) — hai cổng tách
  buộc họ đăng nhập/chuyển qua lại giữa hai app.

## Quyết định
Hợp nhất thành **một web app duy nhất**. Mọi đối tượng đăng nhập cùng một nơi; chức năng và màn hình
hiển thị **theo phân quyền (RBAC)**. Không còn hai SPA tách biệt.

- Điều hướng (menu, route, nút hành động) render động theo `Permission` của người dùng.
- Cùng một thực thể có thể hiển thị "góc nhìn" khác nhau theo vai trò, nhưng trong **một** ứng dụng.
- Phân quyền vẫn được kiểm tra ở backend cho mọi API; UI chỉ ẩn/hiện — không phải lớp bảo vệ.

## Phương án đã cân nhắc
- **A — Một web app điều hướng theo quyền (chọn):** một nguồn điều hướng, một design-system, hỗ trợ
  người dùng đa vai trò tự nhiên; giảm chi phí build/vận hành. Nhược: cần kỷ luật phân quyền UI chặt
  để tránh rò rỉ màn hình không thuộc vai trò.
- **B — Giữ hai SPA (ADR-0002):** tách biệt rõ "mặt" người dùng, nhưng trùng lặp hạ tầng FE và gây ma
  sát cho người dùng đa vai trò; biên giới FE/BO không khớp biên giới nghiệp vụ.
- **C — Một app nhưng tách build theo vai trò lúc đăng nhập:** phức tạp hóa pipeline mà không lợi ích
  rõ so với điều hướng theo quyền ở runtime.

## Hệ quả
- **Backend & dữ liệu không đổi:** modular monolith, một CSDL, domain service vòng đời dùng chung,
  RBAC, audit — giữ nguyên. Đây thuần túy là hợp nhất tầng trình bày.
- `apps/fe-portal` + `apps/bo-admin` hợp nhất thành **một app web** (`apps/web`); `packages/ui` vẫn
  dùng chung.
- Tài liệu UI mỗi feature gộp `frontend.md` + `backoffice.md` thành **`ui.md`** mô tả màn hình kèm
  vai trò/quyền nào thấy gì.
- Cần **kiểm thử phân quyền UI** kỹ: người dùng chỉ thấy đúng màn hình/hành động theo quyền; backend
  vẫn chặn thật. Tham chiếu ma trận quyền trong `ui.md` từng feature.
- Luật bất biến §1 trong [AGENTS.md](../../../AGENTS.md) ("FE/BO chỉ ẩn/hiện theo quyền") giữ nguyên,
  diễn đạt lại theo một app.
