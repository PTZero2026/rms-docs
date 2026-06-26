---
title: "Đề tài cấp trên — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "<BA/Designer>"
status: Draft
updated: 2026-06-26
---

# Đề tài cấp trên — Giao diện

> Khung mẫu — hoàn thiện sau khi chốt spec. Luật nghiệp vụ → `./spec.md`.

## 1. Đối tượng & phân quyền
- **Giảng viên/Chuyên viên:** kê khai đầu mục & **gửi duyệt**. **Chuyên viên QLKH:** **phê duyệt / trả lại**.

| Hành động | Quyền | Chuyên viên | Giảng viên |
|---|---|:--:|:--:|
| Kê khai/sửa | `UPPERPROJECT.EDIT` | ✓ | ✓ (của mình) |
| Gửi duyệt | `UPPERPROJECT.EDIT` | ✓ | ✓ (của mình) |
| Phê duyệt / Trả lại | `UPPERPROJECT.APPROVE` | ✓ | – |

## 2. Vị trí trên menu (IA)
**Mục menu riêng** — không gộp với "Đề xuất đề tài" (F01). Đề tài cấp trên là **entity riêng**
(`UpperProject`), mô hình *đầu mục* khác hẳn full lifecycle F01–F06, và là feature E4 bật/tắt per-tenant.

Nhóm **NCKH / Đề tài**:
- *Đề xuất & quản lý đề tài* (F01–F06) — đề tài cấp cơ sở, full lifecycle
- **→ Đề tài cấp trên (F09)** — kê khai đầu mục *(mục riêng)*
- Đề tài sinh viên (F10) · Dự án phục vụ sản xuất (F11) · Hoạt động khoa học (F12)

## 3. Danh sách màn hình
| Mã MH | Tên màn hình | Mục đích |
|---|---|---|
| MH-01 | Danh sách & kê khai đề tài cấp trên | Quản lý đầu mục, trạng thái duyệt (Nháp/Chờ duyệt/Đã duyệt), gửi duyệt |
| MH-02 | Chi tiết & phê duyệt | Xem minh chứng, **phê duyệt/Trả lại** (kèm lý do), ghi nhận kết quả, xem giờ giảng phát sinh |

## 4. Form kê khai đầu mục (MH-01)
Gom theo nhóm; (✓) = bắt buộc, (○) = tùy chọn.

| Nhóm | Trường | BB | Nguồn / điều khiển |
|---|---|:--:|---|
| **Định danh** | Tên đề tài | ✓ | text |
| | Mã đề tài cấp trên | ○ | text — mã do cơ quan cấp trên cấp |
| | Cấp | ✓ | select `RESEARCH_TOPIC_CATEGORY` (lọc `tier=UPPER`) |
| | Cơ quan chủ trì cấp trên | ✓ | select danh mục `MANAGING_BODY` (B01) |
| | Lĩnh vực/chuyên ngành | ○ | tree-select `ResearchField` |
| **Nhân sự** | Chủ nhiệm | ✓ | picker `User` |
| | Thành viên (vai trò + tỉ lệ đóng góp) | ✓ | bảng động → đầu vào phân bổ giờ P03 |
| | Đơn vị chủ trì phía Trường | ○ | tree-select `Unit` |
| **Thời gian / KP** | Thời gian bắt đầu – kết thúc | ✓ | date range |
| | Kinh phí tổng | ○ | VND — *tham khảo, không đối soát* |
| **Kết quả / MC** | Kết quả | ○ | text — cập nhật khi hoàn thành |
| | Minh chứng (đính kèm + chọn **loại**) | * | upload `Attachment` + select `EVIDENCE_TYPE` |
| **Trạng thái** | Trạng thái duyệt / lý do trả lại | – | hệ thống quản, không nhập tay |

(*) Minh chứng bắt buộc **theo cấu hình** `requiredEvidence` của cấp × giai đoạn — form chỉ chặn khi **gửi
duyệt/duyệt**, không chặn khi lưu nháp. Loại còn thiếu hiển thị rõ.

## 5. Phê duyệt (MH-02)
Chuyên viên QLKH xem chi tiết + minh chứng → **Duyệt** (chặn nếu thiếu minh chứng bắt buộc, AC-02) hoặc
**Trả lại** kèm lý do (AC-03). Sau khi Đã duyệt: hiển thị **giờ giảng phát sinh** (P03) theo từng thành viên.

## 6. Liên kết AC
Map MH ↔ AC trong `spec.md`: MH-01 ↔ AC-01,03; MH-02 ↔ AC-02,04,05,06.
