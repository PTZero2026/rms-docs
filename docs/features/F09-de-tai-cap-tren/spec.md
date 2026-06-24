---
title: "Đề tài cấp trên (Tỉnh/Bộ/Nhà nước)"
id: "F09"
epic: "E4"
owner: "<PO/BA phụ trách>"
status: Draft        # Draft | Review | Approved
version: 0.1
updated: 2026-06-24
---

# Đề tài cấp trên (Tỉnh / Bộ / Nhà nước)

> **Nguồn sự thật về nghiệp vụ.** Mô hình dữ liệu/API ở `design.md`.

## 1. Bối cảnh & mục tiêu

- Trường tham gia các đề tài **cấp Tỉnh/Bộ/Nhà nước** do cơ quan cấp trên chủ trì quy trình. RMS **không**
  quản lý full lifecycle (đề cương → hội đồng → nghiệm thu nội bộ) như đề tài cấp cơ sở; chỉ **quản lý
  đầu mục**: ghi nhận thông tin, thời gian, kết quả và **tính giờ giảng** cho giảng viên tham gia.
- Mục tiêu: có bức tranh đầy đủ về hoạt động NCKH của Trường ở mọi cấp và đổ giờ giảng về lý lịch (F08).

## 2. Phạm vi

- **Trong phạm vi:** kê khai đầu mục đề tài (mã, tên, cấp, cơ quan chủ trì, chủ nhiệm, thành viên, thời
  gian bắt đầu/kết thúc, kinh phí tổng — nếu có), cập nhật **kết quả**, đính kèm minh chứng, quy đổi giờ giảng (P03).
- **Ngoài phạm vi:** vòng đời phê duyệt/nghiệm thu nội bộ (do cơ quan cấp trên thực hiện); đối soát kinh phí chi tiết.

## 3. Luồng nghiệp vụ chính

1. Giảng viên/chuyên viên **kê khai đầu mục** đề tài cấp trên + minh chứng.
2. Chuyên viên QLKH **xác nhận** thông tin.
3. Cập nhật **kết quả** khi đề tài hoàn thành → **quy đổi giờ giảng (P03)** → tổng hợp vào lý lịch (F08).

## 4. Business rules

| ID    | Quy tắc | Mô tả | Ghi chú |
|-------|---------|-------|---------|
| BR-01 | Quản lý đầu mục | Chỉ quản lý thông tin/đầu mục & kết quả, không chạy vòng đời nội bộ | Phân biệt với F01–F06 |
| BR-02 | Minh chứng bắt buộc | Phải có minh chứng (quyết định/hợp đồng cấp trên) để xác nhận | Loại minh chứng cần PO chốt |
| BR-03 | Giờ giảng theo cấp | Giờ giảng quy đổi theo cấp đề tài & vai trò qua P03 | Công thức ở P03 |

## 5. Dữ liệu (mức khái niệm)

Đề tài cấp trên (mã, tên, **cấp**: Tỉnh/Bộ/Nhà nước, cơ quan chủ trì, chủ nhiệm, thành viên & vai trò,
thời gian, kinh phí tổng, kết quả, minh chứng đính kèm).

## 6. Acceptance criteria

- **AC-01** *(BR-01)* — Given chuyên viên kê khai đề tài cấp Bộ, When lưu, Then đề tài được ghi nhận dạng đầu mục (không yêu cầu bước hội đồng nội bộ).
- **AC-02** *(BR-02)* — Given thiếu minh chứng, When xác nhận, Then hệ thống chặn và yêu cầu bổ sung.
- **AC-03** *(BR-03)* — Given đề tài có kết quả hoàn thành, When ghi nhận, Then phát sinh giờ giảng cho thành viên qua P03.

## 7. Phụ thuộc & rủi ro

- **Phụ thuộc:** P03 (giờ giảng), F08 (lý lịch), B01 (danh mục cấp/cơ quan), B03 (vai trò).
- **Điểm cần chốt:** danh mục cấp & loại minh chứng; có cần theo dõi kinh phí cấp trên không (mặc định **không**).
