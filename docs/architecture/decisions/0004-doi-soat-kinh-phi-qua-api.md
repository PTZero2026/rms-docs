---
title: "ADR-0004: Đối soát kinh phí qua tích hợp, không thay thế kế toán"
status: Accepted
date: 2026-06-01
deciders: "SA, PO/BA (F05), đại diện Tài chính"
---

# ADR-0004: Đối soát kinh phí qua tích hợp, không thay thế kế toán

## Bối cảnh
Đề tài có kinh phí cần theo dõi (cấp, chi theo khoản mục). Tổ chức đã có hệ thống tài chính/kế toán
là sổ cái chính thức. RMS không nên trở thành hệ thống kế toán thứ hai gây lệch số liệu.

## Quyết định
RMS **theo dõi** dự toán và giao dịch kinh phí ở mức đề tài, rồi **đối soát** với hệ thống tài chính
qua tích hợp. Sổ cái thật vẫn ở hệ thống tài chính; RMS chỉ phản ánh và phát hiện chênh lệch.

## Phương án đã cân nhắc
- **A — Theo dõi + đối soát qua API/file (chọn):** giữ một nguồn sự thật tài chính; RMS gắn chi tiêu
  với đề tài để quản lý KHCN. Nhược: phụ thuộc chất lượng tích hợp.
- **B — RMS tự hạch toán đầy đủ:** trùng vai trò kế toán, rủi ro lệch số, ngoài phạm vi sản phẩm.
- **C — Không quản kinh phí trong RMS:** mất khả năng gắn chi tiêu với tiến độ/nghiệm thu đề tài.

## Hệ quả
- `GiaoDichKinhPhi.trangThaiDoiSoat` (`KHOP`/`LECH`/`CHUA_DOI_SOAT`) là kết quả đối soát định kỳ.
- Có cơ chế đối soát thủ công (nhập file) khi chưa có API — degrade chấp nhận được.
- Đóng đề tài (`HOAN_THANH`) yêu cầu quyết toán không còn giao dịch `LECH` tồn đọng.
