---
title: "Thuật ngữ — RMS"
status: Draft
updated: 2026-06-01
---

# Thuật ngữ dùng chung

Nguồn quy chiếu tên gọi & khái niệm cho toàn bộ tài liệu. Khi một thuật ngữ trùng với
thực thể dữ liệu, cột "Thực thể" trỏ tới `../architecture/data-model.md`.

## Vòng đời & nghiệp vụ cốt lõi

| Thuật ngữ | Định nghĩa | Thực thể |
|-----------|------------|----------|
| Đề tài | Đơn vị nghiên cứu được đề xuất và quản lý xuyên suốt vòng đời trong hệ thống. | `DeTai` |
| Đợt kêu gọi | Kỳ mở nhận đề xuất, có thời gian và tiêu chí riêng. | `DotKeuGoi` |
| Đề xuất | Hành động/hồ sơ đăng ký một đề tài mới trong một đợt kêu gọi. | `DeTai` |
| Thuyết minh | Hồ sơ mô tả chi tiết đề tài khi đề xuất. | — |
| Xét duyệt | Quy trình hội đồng đánh giá đề xuất để chấp nhận/từ chối. | `HoiDong`, `PhieuCham` |
| Hội đồng | Nhóm chuyên gia đánh giá đề xuất hoặc nghiệm thu đề tài. | `HoiDong` |
| Phiếu chấm | Phiếu cho điểm/nhận xét của một thành viên hội đồng. | `PhieuCham` |
| Tiến độ | Quá trình thực hiện đề tài, theo dõi qua các báo cáo định kỳ. | `BaoCaoTienDo` |
| Báo cáo tiến độ | Báo cáo định kỳ về kết quả thực hiện đề tài. | `BaoCaoTienDo` |
| Kinh phí | Ngân sách cấp cho đề tài và các giao dịch chi/đối soát. | `GiaoDichKinhPhi` |
| Giao dịch kinh phí | Một khoản chi/thu liên quan đề tài, dùng để đối soát tài chính. | `GiaoDichKinhPhi` |
| Đối soát | So khớp giao dịch kinh phí với hệ thống tài chính ngoài. | — |
| Nghiệm thu | Quy trình hội đồng đánh giá kết quả cuối của đề tài. | `HoiDong`, `PhieuCham` |
| Sản phẩm khoa học | Bài báo, sáng chế, giải pháp… sinh ra từ đề tài. | `SanPhamKhoaHoc` |
| Lý lịch khoa học | Hồ sơ năng lực/thành tích nghiên cứu của một nhà khoa học. | `NguoiDung`, `SanPhamKhoaHoc` |
| Công bố | Việc công khai/ghi nhận sản phẩm khoa học của đề tài. | `SanPhamKhoaHoc` |

## Vai trò & người dùng

| Thuật ngữ | Định nghĩa | Mặt dùng |
|-----------|------------|----------|
| Chủ nhiệm đề tài | Nhà khoa học chịu trách nhiệm chính: nộp đề xuất, báo cáo tiến độ, kê khai sản phẩm. | FE |
| Thành viên đề tài | Nhà khoa học tham gia đề tài, xem thông tin liên quan. | FE |
| Chuyên viên QL KHCN | Cán bộ quản lý: tiếp nhận, kiểm tra, theo dõi toàn bộ vòng đời. | BO |
| Thành viên hội đồng | Chuyên gia chấm điểm khi xét duyệt và nghiệm thu. | BO |
| Quản trị hệ thống | Admin: cấu hình danh mục, quản lý người dùng & phân quyền. | BO |

Chi tiết: `personas.md`.

## Hệ thống & kiến trúc

| Thuật ngữ | Định nghĩa |
|-----------|------------|
| RMS | Research Management System — hệ thống quản lý nghiên cứu khoa học. |
| Portal người dùng (FE) | Giao diện web cho nhà khoa học. |
| BackOffice (BO) | Giao diện web quản trị cho chuyên viên/hội đồng/admin. |
| Danh mục | Dữ liệu cấu hình dùng chung (lĩnh vực, đơn vị, loại sản phẩm…). |
| Phân quyền | Cơ chế gán quyền truy cập theo vai trò. |
| SSO | Đăng nhập một lần qua hệ thống định danh nội bộ (OIDC/SAML). |
| Permission matrix | Bảng ánh xạ hành động ↔ vai trò trong một feature quản trị. |
| Audit / Nhật ký | Bản ghi các hành động quan trọng để truy vết. |

## Quy ước tài liệu

| Thuật ngữ | Định nghĩa |
|-----------|------------|
| Feature `F0x` | Tính năng hướng người dùng cuối (có thể kèm mặt quản trị). |
| Feature `B0x` | Tính năng thuần quản trị / hạ tầng dùng chung. |
| `spec.md` | Nguồn sự thật nghiệp vụ của một feature. |
| BR (Business rule) | Quy tắc nghiệp vụ trong `spec.md`. |
| AC (Acceptance criteria) | Tiêu chí chấp nhận (Given/When/Then), đầu vào cho `test-plan.md`. |
| ADR | Architecture Decision Record — ghi nhận quyết định kiến trúc. |
