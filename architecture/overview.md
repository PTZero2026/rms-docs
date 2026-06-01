---
title: "Kiến trúc tổng quan — RMS"
status: Draft
updated: 2026-06-01
---

# Kiến trúc tổng quan

## Context
Hệ thống RMS gồm 2 mặt: **Portal người dùng (FE)** cho nhà khoa học và **BackOffice (BO)** cho quản trị/hội đồng, dùng chung một backend và CSDL.

## Container (rút gọn)
- FE Portal (web) ── API ──> Backend service ── ── > Database
- BO Admin (web)  ── API ──>      ^                 |
- Tích hợp ngoài: xem `integrations.md`.

> Vẽ sơ đồ C4 bằng Mermaid và nhúng tại đây khi cần.
