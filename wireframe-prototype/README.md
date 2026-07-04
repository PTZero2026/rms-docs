# RMS Wireframe Prototype — bản demo trình bày với DEV

Bản mẫu HTML/JS/CSS tĩnh (không build, không backend) mô phỏng RMS cho tenant pilot
**ĐH Thủy Lợi (TLU)**. Mục đích: **trình bày luồng nghiệp vụ với DEV** — mỗi màn hình gắn
panel **📋 Đặc tả cho DEV** ánh xạ UI ↔ `spec.md` (trạng thái · hành động × vai trò · business rule).

> ⚠ Dữ liệu trong prototype là **mô phỏng**, không phải dữ liệu thật.
> Nguồn sự thật nghiệp vụ vẫn là `docs/features/<mã>/spec.md` (xem [AGENTS.md](../AGENTS.md)).

## Chạy
Mở `index.html` bằng trình duyệt (double-click hoặc Live Server). Không cần cài đặt gì.
Cần Internet để tải font Inter + Feather Icons qua CDN.

## Cách demo (gợi ý kịch bản)
1. **Đổi "Góc nhìn (Role)"** trên topbar: `Quản trị viên` · `Giảng viên` · `Sinh viên`
   → menu bên trái đổi theo quyền (minh họa RBAC — [ADR-0009](../docs/architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md): một web app, phân quyền ở backend).
2. **Trang chủ (B06)**: quick actions + số liệu; đọc panel DEV về read-only & ẩn/hiện widget theo tenant.
3. **Vòng đời đề tài** — demo xuyên suốt qua các "đề tài mẫu":
   `[Nghiên cứu A]`→Đề xuất (F01) · `[B]`→Xét duyệt (F03) · `[C]`→Thực hiện (F04) ·
   `[D]`→Kinh phí (F05) · `[E]`→Nghiệm thu (F06). **Click một dòng** để xem *Lifecycle Stepper*
   nhảy đúng bước + Nhật ký AuditLog.
4. **Panel 📋 Đặc tả cho DEV** ở cuối mỗi màn: trạng thái (enum), hành động × vai trò, business rule ảnh hưởng UI.
5. **Form nhập liệu chi tiết** (bối cảnh giảng viên TLU — dữ liệu điền sẵn để trình bày):
   - **F01 — Đăng ký đề xuất đề tài** (nút "Tạo đề xuất mới", hoặc role Giảng viên → *Đề tài của tôi* → "Đăng ký Đề xuất"):
     form **5 bước** bấm qua lại được — Thông tin chung → Thành viên → Thuyết minh → Dự toán → Xem lại & Nộp
     (kèm checklist điều kiện nộp BR-01/02).
   - **Khai báo (role Giảng viên → nhóm "Khai báo thành tích NCKH"):**
     **F07** Sản phẩm KHCN (bài báo SCIE, tỷ lệ đóng góp) · **F09** Đề tài cấp trên ·
     **F12** Hoạt động khoa học · **F10** Hướng dẫn đề tài sinh viên (nhóm SV + xác nhận GVHD).
   - Các form đều gắn cột "Tỷ lệ đóng góp / vai trò" là đầu vào cho **P03 quy đổi giờ giảng** và **F08 lý lịch**.

## Ánh xạ feature ↔ module backend (hệ thống đích — [AGENTS.md §3](../AGENTS.md))
| Nhóm | Feature trong prototype | Module đích |
|---|---|---|
| E1 Tiếp nhận–Xét duyệt | F02 Kỳ nhận đề xuất · F01 Đề xuất · F03 Xét duyệt HĐ | `call` · `proposal` · `review` |
| E2 Thực hiện–Nghiệm thu | F04 Tiến độ · F05 Kinh phí · F06 Nghiệm thu | `progress` · `budget` · `acceptance` |
| E3 Đầu ra–Báo cáo | F07 Sản phẩm · F08 Lý lịch · (B02 Báo cáo) | `product` · `profile` · `report` |
| E0 Nền tảng | B03 Người dùng · B01 Cấu hình · B06 Trang chủ | `iam` · `catalog` · `home` |
| E4 Mở rộng *(optional, bật/tắt per-tenant)* | F09 · F10 · F11 · F12 · P03 | `upper/student/applied/activity-project` · `teaching-hour` |

## Khoảng trống / cần chốt với PO–BA trước khi DEV hiện thực
- **F07 Sản phẩm KHCN**: `spec.md` & `ui.md` hiện là **template rỗng** — panel DEV đang suy luận từ
  feature tham chiếu. Cần điền: danh mục phân loại, enum duyệt, ma trận quyền, quy tắc duyệt.
- **E4 (F09/F10/F11/F12/P03)**: năng lực **optional, bật/tắt theo tenant**
  ([ADR-0012](../docs/architecture/decisions/0012-ranh-gioi-loi-vs-cau-hinh-tenant.md), trạng thái Draft).
  F09/F11/F12 chưa chốt enum vòng đời — cần PO xác nhận scope tenant TLU.
- **B03**: `spec.md` là v0.4 (bám code: `UserType` cố định, single-role) nhưng `ui.md` còn v0.2
  (mô tả role động — đã bị spec loại bỏ). Dựng UI theo **v0.4**.

## Quy ước UI đã phản ánh trong prototype
- Badge trạng thái theo enum từng feature (xanh/vàng/đỏ/xám/xanh dương).
- Ngày `dd/MM/yyyy`, tiền VND nhóm nghìn, giờ Asia/Ho_Chi_Minh (luật bất biến [AGENTS.md §4](../AGENTS.md)).
- Mọi hành động đổi trạng thái → ghi **AuditLog** (append-only) — minh họa ở khối Nhật ký màn chi tiết.
- **Chưa** minh họa (đề xuất bổ sung vòng sau): trạng thái *Đang tải (skeleton) / Rỗng / Lỗi + Thử lại*;
  form nhiều bước F01 (stepper nhập liệu); màn chấm điểm ScoreSheet F03/F06.

## Cấu trúc file
```
wireframe-prototype/
├── index.html   # khung layout (topbar, sidebar, content, modal)
├── script.js    # menu theo role · mockDB + đặc tả DEV từng feature · render bảng/chi tiết/stepper
├── style.css    # style wireframe + .dev-panel (panel đặc tả cho DEV)
└── README.md    # tài liệu này
```
