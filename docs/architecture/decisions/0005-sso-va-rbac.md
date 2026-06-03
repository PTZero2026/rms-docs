---
title: "ADR-0005: Xác thực qua SSO, phân quyền RBAC quản lý nội bộ"
status: Accepted
date: 2026-06-01
deciders: "SA, Tech lead, PO/BA (B03)"
---

# ADR-0005: Xác thực qua SSO, phân quyền RBAC quản lý nội bộ

## Bối cảnh
Hệ thống nội bộ bệnh viện/cơ sở y tế thường đã có hệ thống định danh tập trung. Người dùng RMS gồm
nhiều vai trò với quyền khác nhau (chủ nhiệm, thành viên, chuyên viên, hội đồng, admin) và cần kiểm
soát chặt phạm vi dữ liệu.

## Quyết định
- **Xác thực** bằng SSO nội bộ (OIDC ưu tiên, hỗ trợ SAML); RMS không tự quản mật khẩu trừ tài khoản
  nội bộ dự phòng.
- **Phân quyền** bằng RBAC do RMS quản lý: quyền nguyên tử `MODULE.HANH_DONG` → gom vào `VaiTro` → gán `NguoiDung`.
  Kiểm tra quyền bắt buộc ở backend cho mọi API.

## Phương án đã cân nhắc
- **A — SSO chứng thực + RBAC nội bộ (chọn):** tận dụng định danh sẵn có, nhưng RMS chủ động về vai trò
  nghiệp vụ đặc thù KHCN mà SSO không biết.
- **B — Lấy cả quyền từ SSO/IdP:** phụ thuộc IdP mô hình hóa vai trò KHCN — thường không có, kém linh hoạt.
- **C — Tự quản cả định danh lẫn quyền:** trùng hệ thống định danh tổ chức, tăng rủi ro bảo mật.

## Hệ quả
- B03 quản lý vòng đời vai trò/quyền; SSO chỉ ánh xạ danh tính (claim email).
- Phạm vi dữ liệu (data scoping) theo vai trò: chủ nhiệm thấy đề tài của mình, chuyên viên theo đơn vị/đợt.
- FE/BO chỉ ẩn/hiện theo quyền; backend là lớp thực thi quyền duy nhất.
