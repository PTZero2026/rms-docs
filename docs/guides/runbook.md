---
title: "Runbook vận hành — RMS"
status: Draft
updated: 2026-11-24
---

# Runbook

Khi job giao tin dừng sau commit, tìm ledger theo tenant và correlation ID. QA/Ops kiểm trạng thái kênh trước khi replay bằng cùng khóa sự kiện. Nếu SMTP đã nhận thư nhưng worker mất xác nhận, đối soát message ID trước khi gửi lại. Khi IAM gián đoạn, B01 dừng truy cập được bảo vệ. Khi Redis gián đoạn, đọc cấu hình từ DB sau khi kiểm quyền.

Khi cần phục hồi, Ops dùng bản backup trong môi trường cô lập và ghi thời điểm bắt đầu/kết thúc, điểm dữ liệu khôi phục, checksum file và số hồ sơ hai tenant. N14 kiểm RPO ≤24 giờ, RTO ≤4 giờ trước khi mở pilot. [SA-05/06](../architecture/rms-v0-sa-review.md) · [Các ca kiểm vận hành](kiem-thu-rms.md)
