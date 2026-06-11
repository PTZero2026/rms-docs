---
title: "<Tên feature>"
id: "<F0x | B0x>"
owner: "<PO/BA phụ trách>"
status: Draft        # Draft | Review | Approved
version: 0.1
updated: 2026-06-01
---

# <Tên feature>

> **Nguồn sự thật về nghiệp vụ** của feature — do **PO/BA sở hữu và duyệt**. Mọi luật, dữ liệu,
> tiêu chí nghiệm thu nằm ở đây.
>
> **Quy ước tầng (quan trọng):** file này viết bằng **ngôn ngữ nghiệp vụ** — *cái gì* và *tại sao*.
> Không đưa tên trường CSDL, ràng buộc kỹ thuật (`unique`, `ON DELETE …`), kiểu dữ liệu hay tên API
> vào đây; phần *làm thế nào* nằm ở [`design.md`](./design.md) (DEV sở hữu). Trạng thái nghiệp vụ
> được phép nêu bằng nhãn tiếng Việt (vd "Nháp", "Đã nộp"); ánh xạ sang enum kỹ thuật để ở `design.md`.
>
> Tài liệu liên quan: `ui.md` (giao diện) và `test-plan.md` (kiểm thử) đều trỏ ngược về file này.

## 1. Bối cảnh & mục tiêu

Vì sao cần feature này, giải quyết vấn đề gì, ai dùng. Kết quả mong đợi (1–3 gạch đầu dòng).

## 2. Phạm vi

- **Trong phạm vi:** ...
- **Ngoài phạm vi:** ...

## 3. Luồng nghiệp vụ chính

Mô tả luồng không phụ thuộc giao diện (diagram đặt ở `assets/`, nhúng bằng Mermaid).

## 4. Business rules

Viết bằng ngôn ngữ nghiệp vụ (vì sao có luật, áp dụng khi nào). Cách hiện thực (constraint, validate)
thuộc `design.md` và được truy vết qua chính `BR-xx` này.

| ID    | Quy tắc | Mô tả | Ghi chú |
|-------|---------|-------|---------|
| BR-01 | ...     | ...   | ...     |

## 5. Dữ liệu (mức khái niệm)

Các **đối tượng nghiệp vụ** feature đụng tới và thông tin quan trọng của chúng, bằng ngôn ngữ người
dùng (vd "đề tài", "thành viên", "tài liệu đính kèm"). Mô hình bảng/trường/ràng buộc → `design.md §2`
và `../../architecture/data-model.md`.

## 6. Acceptance criteria

Viết theo Given / When / Then bằng ngôn ngữ nghiệp vụ — đây là đầu vào trực tiếp cho `test-plan.md`.
Mỗi AC nên trỏ về `BR-xx` liên quan. Khẳng định mức field (vd giá trị enum cụ thể) để ở `test-plan.md`.

- **AC-01** — Given ... When ... Then ...
- **AC-02** — ...

## 7. Phụ thuộc & rủi ro

Feature/hệ thống liên quan, giả định, **điểm nghiệp vụ cần PO chốt** (khác với "điểm kỹ thuật cần chốt"
ở `design.md §5`).
