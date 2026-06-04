---
title: "ADR-0002: Kiến trúc hai mặt giao diện trên một backend (modular monolith)"
status: Accepted
date: 2026-06-01
deciders: "SA, Tech lead, PO"
---

# ADR-0002: Kiến trúc hai mặt giao diện trên một backend (modular monolith)

## Bối cảnh
RMS phục vụ hai nhóm rất khác nhau: nhà khoa học (Portal FE) và quản trị/hội đồng (BackOffice BO).
Cùng thao tác trên một thực thể trung tâm `ResearchProject` và vòng đời liên tục xuyên feature, cần transaction
nhất quán. Đội ngũ ở quy mô lean.

## Quyết định
Dùng **một backend modular monolith** (chia module theo feature) phục vụ **hai SPA giao diện** (FE, BO),
chung một CSDL quan hệ. Không tách microservices ở giai đoạn đầu.

## Phương án đã cân nhắc
- **A — Monolith module hóa, 2 FE (chọn):** transaction xuyên feature đơn giản, một nguồn dữ liệu,
  triển khai/vận hành nhẹ; ranh giới module giữ khả năng tách sau. Nhược: cần kỷ luật giữ ranh giới module.
- **B — Microservices theo feature:** mở rộng độc lập nhưng chi phí phân tán (saga, eventual consistency,
  vận hành) không tương xứng quy mô hiện tại.
- **C — Hai backend tách rời cho FE và BO:** dễ lệch dữ liệu, trùng logic vòng đời — đi ngược nguyên tắc "một nguồn sự thật".

## Hệ quả
- Logic vòng đời `ResearchProject` tập trung ở domain service dùng chung, mọi feature gọi qua đó.
- Phân quyền là lằn ranh chính giữa FE và BO, không phải hai hệ thống tách biệt.
- Phải duy trì ranh giới module rõ để có thể tách service khi tải tăng.
