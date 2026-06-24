---
title: "Đề tài sinh viên"
id: "F10"
epic: "E4"
owner: "<PO/BA phụ trách>"
status: Draft        # Draft | Review | Approved
version: 0.1
updated: 2026-06-24
---

# Đề tài sinh viên

> **Nguồn sự thật về nghiệp vụ.** Mô hình dữ liệu/API ở `design.md`.
>
> ⚠️ **Phạm vi vòng đời "dự kiến"** trong biên bản — cần PO **chốt** trước khi viết BR/AC chi tiết.

## 1. Bối cảnh & mục tiêu

- Quản lý đề tài NCKH của **sinh viên** có **giảng viên hướng dẫn**. Điểm cốt lõi: **tính giờ giảng cho
  giảng viên hướng dẫn** và đổ về lý lịch khoa học (F08).
- Sinh viên được **đồng bộ/xác nhận** từ hệ thống sinh viên (không khai lại — yêu cầu kỹ thuật biên bản §C).

## 2. Phạm vi

- **Trong phạm vi (dự kiến):** đăng ký đề tài SV, thông tin nhóm SV + GV hướng dẫn, theo dõi thực hiện,
  ghi nhận kết quả/nghiệm thu, **quy đổi giờ giảng cho GV hướng dẫn** (P03).
- **Ngoài phạm vi:** *(chờ chốt)* mức độ vòng đời đầy đủ (đề cương/hội đồng/nghiệm thu) — có thể tái dùng
  một phần mô hình F01–F06 hoặc rút gọn.

## 3. Luồng nghiệp vụ chính

1. Mở đợt / SV đăng ký đề tài có GV hướng dẫn.
2. Thực hiện & theo dõi (mức độ chi tiết **chờ chốt**).
3. Nghiệm thu/ghi nhận kết quả → **quy đổi giờ giảng cho GV hướng dẫn (P03)** → lý lịch (F08).

## 4. Business rules

| ID    | Quy tắc | Mô tả | Ghi chú |
|-------|---------|-------|---------|
| BR-01 | GV hướng dẫn bắt buộc | Mỗi đề tài SV phải gắn ≥1 giảng viên hướng dẫn | Đối tượng tính giờ giảng |
| BR-02 | SV từ đồng bộ | Thành viên SV lấy từ dữ liệu đồng bộ, xác nhận thay vì khai lại | Phụ thuộc tích hợp hệ thống SV |
| BR-03 | Giờ giảng cho GV | Giờ giảng quy đổi cho GV hướng dẫn qua P03 | Công thức ở P03 |

> *Các BR về vòng đời (đề cương/hội đồng/nghiệm thu) **bổ sung sau khi chốt phạm vi**.*

## 5. Dữ liệu (mức khái niệm)

Đề tài SV (mã, tên, nhóm sinh viên, **GV hướng dẫn**, đợt/năm học, trạng thái, kết quả, minh chứng).

## 6. Acceptance criteria

- **AC-01** *(BR-01)* — Given đề tài SV không có GV hướng dẫn, When lưu, Then bị chặn.
- **AC-02** *(BR-02)* — Given SV đã có trong dữ liệu đồng bộ, When thêm vào nhóm, Then chọn từ danh sách (không nhập tay).
- **AC-03** *(BR-03)* — Given đề tài SV hoàn thành/nghiệm thu đạt, When ghi nhận, Then GV hướng dẫn được tính giờ giảng qua P03.

## 7. Phụ thuộc & rủi ro

- **Phụ thuộc:** P03, F08, tích hợp đồng bộ SV (xem `integrations.md` — cần bổ sung), B03.
- **Điểm cần chốt (chặn):** mức độ quản lý vòng đời đề tài SV (biên bản §D); có cần kinh phí hỗ trợ không.
