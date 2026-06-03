---
title: "ADR-0003: Mô hình hội đồng & phiếu chấm dùng chung cho xét duyệt và nghiệm thu"
status: Accepted
date: 2026-06-01
deciders: "SA, PO/BA (F03, F06)"
---

# ADR-0003: Mô hình hội đồng & phiếu chấm dùng chung cho xét duyệt và nghiệm thu

## Bối cảnh
Xét duyệt đề xuất (F03) và nghiệm thu kết quả (F06) có cấu trúc gần như nhau: lập hội đồng,
phân công thành viên, chấm theo bộ tiêu chí, tổng hợp điểm, ra kết luận đạt/không đạt. Nếu mỗi
feature tự dựng mô hình riêng sẽ trùng lặp và lệch nhau.

## Quyết định
Dùng chung bộ thực thể `HoiDong`, `ThanhVienHoiDong`, `BoTieuChi`/`TieuChiDanhGia`, `DotDanhGia`,
`PhieuCham`, `DiemTieuChi`. Phân biệt mục đích bằng trường `loai = XET_DUYET | NGHIEM_THU` trên
`HoiDong`, `BoTieuChi` và `DotDanhGia`.

## Phương án đã cân nhắc
- **A — Mô hình dùng chung, phân biệt bằng `loai` (chọn):** không trùng lặp; cải tiến quy trình chấm
  áp dụng cho cả hai; báo cáo thống nhất. Nhược: cần tránh nhồi luật đặc thù vào model chung.
- **B — Hai mô hình tách riêng cho F03 và F06:** rõ ràng theo feature nhưng trùng code/dữ liệu,
  dễ phân kỳ tiêu chí và cách tính điểm.

## Hệ quả
- F03 và F06 chia sẻ màn hình chấm điểm và logic tổng hợp; khác biệt nằm ở bộ tiêu chí và ngưỡng kết luận.
- Khác biệt nghiệp vụ riêng (vd điều kiện vào nghiệm thu) đặt trong `spec.md` của từng feature, không ở model chung.
- Thống kê hội đồng/điểm số làm một lần, lọc theo `loai`.
