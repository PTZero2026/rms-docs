---
title: "Quy đổi giờ giảng"
id: "P03"
epic: "E4"
owner: "<PO/BA phụ trách>"
status: Draft        # Draft | Review | Approved
version: 0.1
updated: 2026-06-24
---

# Quy đổi giờ giảng *(Platform / xuyên suốt)*

> **Nguồn sự thật về nghiệp vụ** của năng lực quy đổi giờ giảng. Đây là **trục xuyên suốt** của hệ
> thống theo khảo sát ĐH Thủy Lợi: mọi hoạt động khoa học được quy đổi ra **giờ giảng** cho giảng
> viên và tự động đổ về [lý lịch khoa học (F08)](../F08-ly-lich-khoa-hoc/).
>
> Quy ước tầng: file này dùng **ngôn ngữ nghiệp vụ**; mô hình dữ liệu/API ở `design.md`.

## 1. Bối cảnh & mục tiêu

- Trường quy đổi mọi hoạt động khoa học (đề tài, bài báo, hội nghị, phục vụ cộng đồng, SHTT) ra **giờ
  giảng** để tính khối lượng/định mức cho giảng viên.
- Cần một **cơ chế cấu hình công thức** quy đổi theo từng loại hoạt động (và vai trò người tham gia),
  thay vì hardcode — vì công thức do Trường quy định và **có thể thay đổi theo năm/quy chế**.
- Kết quả: mỗi sự kiện khoa học sinh ra **bản ghi giờ giảng** gắn với giảng viên, tổng hợp tự động vào
  lý lịch (F08) và phục vụ báo cáo (B02).

## 2. Phạm vi

- **Trong phạm vi:**
  - Danh mục **loại hoạt động** quy đổi và **công thức/định mức** quy đổi (cấu hình theo tenant, có hiệu lực theo kỳ/năm).
  - Tính giờ giảng cho một sự kiện hoạt động (đầu vào từ F09–F12, F07) theo công thức đang hiệu lực.
  - Phân bổ giờ giảng theo **vai trò** (chủ nhiệm/thành viên/hướng dẫn/tác giả chính…) và tỉ lệ đóng góp.
  - Ghi nhận, điều chỉnh (có lý do, có audit) và tổng hợp giờ giảng theo giảng viên/kỳ.
- **Ngoài phạm vi:**
  - Định mức lao động/khối lượng giảng dạy tổng thể của Trường (thuộc hệ thống đào tạo/HR).
  - Quyết toán thù lao theo giờ giảng (tài chính/nhân sự).

## 3. Luồng nghiệp vụ chính

1. Quản trị (BO) cấu hình **bộ công thức quy đổi** theo loại hoạt động, hiệu lực theo kỳ.
2. Một feature nguồn (F07/F09/F10/F11/F12) ghi nhận sự kiện đủ điều kiện (vd: bài báo được duyệt, đề tài
   nghiệm thu đạt, hội nghị được phê duyệt) → phát **yêu cầu quy đổi**.
3. P03 chọn công thức **đang hiệu lực**, tính số giờ, phân bổ theo vai trò → tạo **bản ghi giờ giảng**.
4. Bản ghi giờ giảng tự động hiển thị trong **lý lịch khoa học (F08)** của từng giảng viên.
5. Khi cần điều chỉnh (sai sót/đặc cách), chuyên viên sửa có lý do; thay đổi ghi `AuditLog`.

> *(Diagram chi tiết đặt ở `assets/`, nhúng Mermaid khi spec chín.)*

## 4. Business rules

| ID    | Quy tắc | Mô tả | Ghi chú |
|-------|---------|-------|---------|
| BR-01 | Công thức theo loại hoạt động | Mỗi loại hoạt động có công thức/định mức quy đổi riêng | Cấu hình ở B01/P03, không hardcode |
| BR-02 | Hiệu lực theo kỳ | Công thức có thời gian hiệu lực; sự kiện áp công thức **đang hiệu lực tại thời điểm ghi nhận** | Cần PO chốt mốc áp dụng |
| BR-03 | Phân bổ theo vai trò | Giờ giảng phân bổ theo vai trò & tỉ lệ đóng góp giữa các thành viên | Công thức phân bổ cần PO chốt |
| BR-04 | Điều kiện phát sinh | Chỉ sự kiện ở trạng thái hợp lệ (vd duyệt/nghiệm thu đạt) mới sinh giờ giảng | Mỗi feature nguồn định nghĩa "trạng thái hợp lệ" |
| BR-05 | Điều chỉnh có vết | Mọi điều chỉnh giờ giảng thủ công phải có lý do và ghi audit | Theo luật bất biến §4 (AGENTS.md) |
| BR-06 | Idempotent | Một sự kiện không bị tính giờ trùng lặp khi xử lý lại | Khóa theo nguồn sự kiện |

> *Các giá trị/công thức cụ thể (số giờ theo loại bài báo, cấp đề tài…) — **cần PO chốt với Trường** (biên bản §D).*

## 5. Dữ liệu (mức khái niệm)

- **Loại hoạt động quy đổi**: tên, nhóm, đơn vị tính.
- **Công thức/định mức quy đổi**: tham số, kỳ hiệu lực, quy tắc phân bổ theo vai trò.
- **Bản ghi giờ giảng**: giảng viên, nguồn sự kiện (loại + tham chiếu), vai trò, số giờ, kỳ, trạng thái, lý do điều chỉnh.

## 6. Acceptance criteria

- **AC-01** *(BR-01,02)* — Given có công thức đang hiệu lực cho loại hoạt động X, When một sự kiện loại X
  được ghi nhận hợp lệ, Then hệ thống tính đúng số giờ theo công thức hiệu lực.
- **AC-02** *(BR-03)* — Given sự kiện có nhiều thành viên với vai trò khác nhau, When quy đổi, Then giờ
  giảng được phân bổ theo đúng quy tắc vai trò.
- **AC-03** *(BR-04,06)* — Given một sự kiện đã được quy đổi, When xử lý lại cùng sự kiện, Then không phát sinh giờ trùng.
- **AC-04** *(BR-05)* — Given chuyên viên điều chỉnh giờ giảng, When lưu, Then thay đổi được ghi `AuditLog` kèm lý do.
- **AC-05** — Given giảng viên có các bản ghi giờ giảng, When mở lý lịch (F08), Then giờ giảng hiển thị & tổng hợp đúng theo kỳ.

## 7. Phụ thuộc & rủi ro

- **Phụ thuộc:** B01 (danh mục loại hoạt động), F08 (đích tổng hợp), B02 (báo cáo), P02 (audit); nguồn sự
  kiện F07/F09/F10/F11/F12.
- **Điểm nghiệp vụ cần PO chốt:** công thức/định mức quy đổi & quy tắc phân bổ vai trò (biên bản §D);
  mốc áp dụng khi công thức đổi giữa kỳ; xử lý hồi tố khi số hóa dữ liệu cũ 5 năm.
