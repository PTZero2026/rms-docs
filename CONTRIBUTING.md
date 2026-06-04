# Quy ước đóng góp tài liệu

## Nguyên tắc

1. **Một nguồn sự thật mỗi feature.** Luật nghiệp vụ chỉ nằm trong `spec.md`. `frontend.md`,
   `backoffice.md`, `test-plan.md` trỏ về `spec.md`, không chép lại luật.
2. **Đủ dùng, không thừa.** Mục nào trống thì xóa. Tài liệu một feature đơn giản có thể chỉ là `spec.md`.
3. **Diagram bằng Mermaid** (text, diff được). Chỉ dùng ảnh khi buộc phải vẽ phức tạp; đặt trong `assets/`.

## Vòng đời tài liệu (frontmatter `status`)

`Draft` → `Review` → `Approved`. Đổi trạng thái trong frontmatter, không tạo thư mục `draft/` riêng — Git giữ lịch sử.

## Đặt tên

- Thư mục feature: `F0x-name-khong-dau` (người dùng) hoặc `B0x-name-khong-dau` (quản trị).
- File: chữ thường, gạch nối. ADR: `docs/architecture/decisions/NNNN-name-quyet-dinh.md`, đánh số tăng dần.

## Quy trình

- Tài liệu sửa **chung PR với code** của feature tương ứng. Reviewer duyệt cả hai.
- Thay đổi luật trong `spec.md` cần ít nhất 1 reviewer là PO hoặc BA.
- Quyết định kiến trúc quan trọng → tạo một ADR (dùng `docs/templates/adr.md`).

## Definition of Done (tài liệu)

- [ ] `spec.md` có Business rules và Acceptance criteria rõ ràng.
- [ ] Mỗi AC có ít nhất 1 test case trong `test-plan.md`.
- [ ] Màn hình trong `frontend.md` / `backoffice.md` map được về AC.
- [ ] `backoffice.md` có Permission matrix (nếu có mặt quản trị).
- [ ] `status` và `updated` trong frontmatter đã cập nhật.
