# apps/ — Ứng dụng chạy được

Ba mặt triển khai theo [ADR-0002](../docs/architecture/decisions/0002-kien-truc-hai-mat-mot-backend.md)
(hai giao diện, một backend):

| App | Vai trò | Người dùng |
|---|---|---|
| `fe-portal/` | SPA Portal | Nhà khoa học (chủ nhiệm, thành viên) |
| `bo-admin/` | SPA BackOffice | Chuyên viên QL KHCN, hội đồng, admin |
| `backend/` | Modular monolith + CSDL | Toàn bộ domain logic |

## backend/src/modules/
Mỗi module ↔ một feature tài liệu (xem bảng ánh xạ trong [AGENTS.md §3](../AGENTS.md)).
Module giao tiếp qua interface rõ ràng; thực thể dùng chung định nghĩa ở
[data-model.md](../docs/architecture/data-model.md). Logic vòng đời `ResearchProject` tập trung, không rải ở màn hình.
