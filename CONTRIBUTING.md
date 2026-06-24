# Quy ước đóng góp tài liệu

## Nguyên tắc

1. **Một nguồn sự thật mỗi feature.** Luật nghiệp vụ chỉ nằm trong `spec.md`. `design.md` (kỹ thuật),
   `ui.md` (giao diện), `test-plan.md` (kiểm thử) trỏ về `spec.md` qua mã `BR-xx`/`AC-xx`, không chép lại luật.
2. **Đủ dùng, không thừa.** Mục nào trống thì xóa. Tài liệu một feature đơn giản có thể chỉ là `spec.md`.
3. **Diagram bằng Mermaid** (text, diff được). Chỉ dùng ảnh khi buộc phải vẽ phức tạp; đặt trong `assets/`.

## Vòng đời tài liệu (frontmatter `status`)

`Draft` → `Review` → `Approved`. Đổi trạng thái trong frontmatter, không tạo thư mục `draft/` riêng — Git giữ lịch sử.

## Đặt tên

- Thư mục feature: `F0x-name-khong-dau` (người dùng), `B0x-name-khong-dau` (quản trị) hoặc `P0x-name-khong-dau` (năng lực nền).
- File: chữ thường, gạch nối. ADR: `docs/architecture/decisions/NNNN-name-quyet-dinh.md`, đánh số tăng dần.

## Quy trình

- Repo **thuần tài liệu**: PR chỉ chứa thay đổi tài liệu (code ở repo riêng — [ADR-0011](docs/architecture/decisions/0011-tach-code-quay-ve-docs-only.md)).
- Thay đổi luật trong `spec.md` cần ít nhất 1 reviewer là PO hoặc BA.
- Quyết định kiến trúc quan trọng → tạo một ADR (dùng `docs/templates/adr.md`).

## Definition of Done (tài liệu)

- [ ] `spec.md` có Business rules và Acceptance criteria rõ ràng.
- [ ] Mỗi AC có ít nhất 1 test case trong `test-plan.md`.
- [ ] Màn hình trong `ui.md` map được về AC; `design.md` có bảng truy vết `BR/AC → hiện thực`.
- [ ] `ui.md` có Permission matrix (nếu có mặt quản trị).
- [ ] `status` và `updated` trong frontmatter đã cập nhật.
