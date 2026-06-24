---
title: "Dự án phục vụ sản xuất"
id: "F11"
epic: "E4"
owner: "<PO/BA phụ trách>"
status: Draft        # Draft | Review | Approved
version: 0.1
updated: 2026-06-24
---

# Dự án phục vụ sản xuất

> **Nguồn sự thật về nghiệp vụ.** Mô hình dữ liệu/API ở `design.md`.

## 1. Bối cảnh & mục tiêu

- Các **viện** thuộc Trường thực hiện **dự án phục vụ sản xuất**, thường **liên kết với công ty bên
  ngoài**. Cần quản lý thông tin cốt lõi: **tên dự án, thành viên, kinh phí**.
- Mục tiêu: ghi nhận hoạt động phục vụ sản xuất, gắn về đơn vị/viện & thành viên, quy đổi giờ giảng (P03).

## 2. Phạm vi

- **Trong phạm vi:** kê khai dự án (tên, đơn vị/viện chủ trì, **đối tác/công ty ngoài**, thành viên & vai
  trò, kinh phí, thời gian), minh chứng (hợp đồng/biên bản), quy đổi giờ giảng.
- **Ngoài phạm vi:** *(chờ chốt)* quản lý dự toán/giải ngân chi tiết — phụ thuộc quyết định "phạm vi kinh
  phí" (biên bản §D); mặc định **chỉ ghi nhận**.

## 3. Luồng nghiệp vụ chính

1. Viện/chuyên viên kê khai dự án + đối tác ngoài + thành viên + kinh phí.
2. Chuyên viên QLKH xác nhận; đính kèm hợp đồng/minh chứng.
3. Ghi nhận kết quả → quy đổi giờ giảng (P03) → lý lịch (F08).

## 4. Business rules

| ID    | Quy tắc | Mô tả | Ghi chú |
|-------|---------|-------|---------|
| BR-01 | Gắn đơn vị/viện | Mỗi dự án thuộc một đơn vị/viện chủ trì | Từ danh mục đơn vị (B01) |
| BR-02 | Đối tác ngoài | Cho phép ghi nhận công ty/đối tác bên ngoài liên kết | Danh mục đối tác cần PO chốt |
| BR-03 | Giờ giảng theo vai trò | Thành viên được quy đổi giờ giảng qua P03 | Công thức ở P03 |

## 5. Dữ liệu (mức khái niệm)

Dự án phục vụ sản xuất (tên, đơn vị/viện, đối tác ngoài, thành viên & vai trò, kinh phí, thời gian, kết quả, minh chứng).

## 6. Acceptance criteria

- **AC-01** *(BR-01)* — Given kê khai dự án, When lưu mà thiếu đơn vị chủ trì, Then bị chặn.
- **AC-02** *(BR-02)* — Given dự án liên kết công ty ngoài, When kê khai, Then ghi nhận được thông tin đối tác.
- **AC-03** *(BR-03)* — Given dự án có kết quả, When ghi nhận, Then thành viên được tính giờ giảng qua P03.

## 7. Phụ thuộc & rủi ro

- **Phụ thuộc:** P03, F08, B01 (đơn vị/viện), B03; (tùy chọn) F05 nếu quản kinh phí chi tiết.
- **Điểm cần chốt:** phạm vi kinh phí (ghi nhận vs dự toán/giải ngân); danh mục đối tác ngoài.
