---
title: "ADR-0001: Áp dụng ADR để ghi nhận quyết định kiến trúc"
status: Accepted
date: 2026-06-01
deciders: "SA, Tech lead"
---

# ADR-0001: Áp dụng ADR để ghi nhận quyết định kiến trúc

## Bối cảnh
Team lean cần lưu lại lý do của các quyết định kỹ thuật mà không tạo tài liệu nặng.

## Quyết định
Mỗi quyết định kiến trúc quan trọng được ghi thành một file ADR ngắn, đánh số tăng dần, append-only.

## Phương án đã cân nhắc
- **A — ADR file trong Git:** nhẹ, version cùng code. (chọn)
- **B — Wiki tách rời:** dễ lạc hậu, tách khỏi code.

## Hệ quả
Có lịch sử quyết định tra cứu được. Cần kỷ luật tạo ADR khi có quyết định lớn.
