---
title: "Dự án phục vụ sản xuất — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "<BA/Designer>"
status: Draft
updated: 2026-06-26
---

# Dự án phục vụ sản xuất — Giao diện

> Khung mẫu — hoàn thiện sau khi chốt spec. Luật nghiệp vụ → `./spec.md`.

## 1. Đối tượng & phân quyền
- **Giảng viên/Viện/Chuyên viên:** kê khai dự án, đối tác, thành viên, kinh phí tổng và minh chứng.
  **Chuyên viên QLKH:** duyệt/trả lại/thu hồi và xác nhận kết quả.

| Hành động | Quyền | Chuyên viên QLKH | Chuyên viên viện | Giảng viên |
|---|---|:--:|:--:|:--:|
| Xem danh sách | `APPLIEDPROJECT.VIEW` | ✓ | ✓ (theo đơn vị) | ✓ (của mình) |
| Kê khai/sửa nháp | `APPLIEDPROJECT.EDIT` | ✓ | ✓ | ✓ (của mình) |
| Gửi duyệt | `APPLIEDPROJECT.SUBMIT` | ✓ | ✓ | ✓ (của mình) |
| Duyệt / Trả lại / Thu hồi | `APPLIEDPROJECT.APPROVE` | ✓ | – | – |

## 2. Vị trí trên menu (IA)

Nhóm **NCKH / Hoạt động mở rộng**:
- Đề tài cấp trên (F09)
- Đề tài sinh viên (F10)
- **Dự án phục vụ sản xuất (F11)**
- Hoạt động khoa học & minh chứng (F12)

## 3. Danh sách màn hình
| Mã MH | Tên màn hình | Mục đích |
|---|---|---|
| MH-01 | Danh sách dự án | Lọc theo đơn vị/viện, trạng thái, đối tác, năm; thao tác tạo mới/gửi duyệt |
| MH-02 | Form kê khai dự án | Nhập thông tin dự án, đối tác ngoài, thành viên, kinh phí tổng, minh chứng |
| MH-03 | Chi tiết & phê duyệt | Xem đầy đủ hồ sơ; QLKH duyệt/trả lại/thu hồi; xem audit và giờ giảng phát sinh |
| MH-04 | Cập nhật kết quả | Ghi kết quả, biên bản nghiệm thu/bàn giao và minh chứng hoàn thành |

## 4. Form kê khai dự án (MH-02)

Gom theo nhóm; (✓) = bắt buộc, (○) = tùy chọn.

| Nhóm | Trường | BB | Nguồn / điều khiển |
|---|---|:--:|---|
| **Định danh** | Tên dự án | ✓ | text |
| | Mã/hợp đồng dự án | ○ | text |
| | Đơn vị/viện chủ trì | ✓ | tree-select `Unit` |
| | Chủ nhiệm/người phụ trách | ✓ | picker `User` |
| **Đối tác** | Đối tác/công ty ngoài | ✓ | select/quick-create `EXTERNAL_PARTNER` |
| | Mã số thuế/thông tin liên hệ | ○ | theo hồ sơ đối tác |
| **Nhân sự** | Thành viên | ✓ | bảng động: người tham gia, vai trò, tỉ lệ đóng góp |
| **Thời gian / kinh phí** | Thời gian bắt đầu – kết thúc | ✓ | date range |
| | Kinh phí hợp đồng/tổng kinh phí | ○ | VND; mức ghi nhận, không nhập dòng giải ngân |
| **Minh chứng** | Hợp đồng/phụ lục/biên bản | * | upload `Attachment` + select `EVIDENCE_TYPE` |
| **Trạng thái** | Trạng thái duyệt / lý do trả lại | – | hệ thống quản |

(*) Minh chứng bắt buộc theo cấu hình `requiredEvidence`; form cho lưu nháp thiếu minh chứng nhưng chặn ở
bước gửi duyệt/duyệt khi thiếu loại bắt buộc.

## 5. Phê duyệt & kết quả (MH-03/MH-04)

- QLKH xem chi tiết hồ sơ và minh chứng, sau đó **Duyệt** hoặc **Trả lại** kèm lý do.
- Khi dự án đã duyệt, màn hình chi tiết hiển thị block **Giờ giảng phát sinh** từ P03 theo thành viên.
- Nếu tenant chọn mốc `ON_RESULT_APPROVED`, giờ giảng chỉ phát sinh sau khi kết quả/nghiệm thu được QLKH xác nhận.
- Lịch sử trạng thái/audit hiển thị cho người có quyền, phục vụ kiểm tra sau này.

## 6. Liên kết AC

| Màn hình | AC liên quan |
|---|---|
| MH-01 | AC-01, AC-02, AC-05 |
| MH-02 | AC-01, AC-02, AC-03, AC-04 |
| MH-03 | AC-04, AC-05, AC-06, AC-07 |
| MH-04 | AC-04, AC-07 |
