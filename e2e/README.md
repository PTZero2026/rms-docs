# E2E — Pilot ĐH Thủy Lợi

Bộ kiểm thử Playwright kiểm chứng các yêu cầu **quan sát được qua UI** trong
[`docs/guides/handover-thuy-loi.md`](../docs/guides/handover-thuy-loi.md) trên môi trường dùng thử
`https://tl-nckh.vnest.vn` (tenant `thuyloi-tenant`, bật E4).

> Repo là docs-only. Thư mục `e2e/` là **harness kiểm thử bàn giao**, không phải code sản phẩm.

## Chạy

```bash
cd e2e
npm install
npx playwright install chromium
npm test            # chạy toàn bộ (tự đăng nhập 2 role trước)
npm run report      # xem báo cáo HTML
npm run test:headed # xem trình duyệt chạy
```

Biến môi trường (tuỳ chọn): `RMS_BASE_URL`, `RMS_OTP` (mặc định `123456`).

## Tài khoản thử

| Role | Email | Ghi chú |
|---|---|---|
| admin | `tuanphamhong@gmail.com` | thấy quản trị Người dùng / Hội đồng |
| giảng viên | `tuanph@vnpay.vn` | chỉ luồng của mình |

Đăng nhập: app `/signin` (email) → Keycloak realm `thuyloi-tenant` → **OTP email** (`123456`) → app.
`tests/auth.setup.ts` đăng nhập 1 lần/role, lưu phiên vào `.auth/` (dùng lại cho mọi spec).

## Ánh xạ spec ↔ khối checklist

| Spec | Khối checklist | Kiểm |
|---|---|---|
| `01-auth-sso-otp` | C. SSO + OTP | redirect IdP đúng realm; bắt buộc bước OTP; OTP sai bị chặn; 2 role vào được |
| `02-home-b06` | G / B06 + VP-BRAND | widget trang chủ (Số liệu nhanh, Thông báo, Lối tắt); chào đúng tên; footer thương hiệu Thủy Lợi |
| `03-rbac` | F. RBAC + luật bất biến #1 | admin thấy menu quản trị; giảng viên ẩn menu **và** deep-link `/users` `/councils` bị backend từ chối ("Không đủ quyền truy cập") |
| `04-core-features` | F. Luồng lõi | route F01 đề tài, F02 đợt đăng ký, F03 hội đồng, cuộc họp render đúng; nút Tạo mới / Tạo hội đồng |
| `05-e4-teaching-hours` | A / B (VP-FEAT E4) | P03 Quy đổi giờ giảng bật cho tenant, cả admin lẫn giảng viên |

## Hạng mục checklist KHÔNG tự động hoá được (kiểm thủ công)

E2E chỉ phủ phần UI. Các mục sau thuộc nghiệp vụ/hạ tầng/cấu hình, phải nghiệm thu tay:

- **Khối A** — công thức quy đổi giờ giảng P03 (`tlu.baseHoursScieQ1`, SCIE_Q2, phân bổ vai trò): cần đối chiếu số PO chốt. E2E chỉ xác nhận trang tồn tại.
- **Khối B** — giá trị cấu hình các VP (tiêu chí, minh chứng bắt buộc, tham số): xác minh bằng dữ liệu seed.
- **Khối C** — ADR mới cho SSO Microsoft Entra ID; đồng bộ GV/SV (hiện IdP là Keycloak OTP).
- **Khối D** — số hoá 5 năm dữ liệu cũ, chất lượng migrate.
- **Khối E** — hoàn thiện tài liệu F07/F08/B02, mâu thuẫn B03 spec↔design.
- **Khối G** — backup/khôi phục, retention audit, SLA hỗ trợ.

## Công cụ khám phá (giữ lại để mở rộng test)

- `discovery.mjs <email> <label>` — chạy full flow đăng nhập, dump DOM + screenshot, lưu `state-<label>.json`.
- `probe.mjs <label> <path...>` — mở nhanh các trang bằng phiên đã lưu, dump heading/table/nút.

## Trạng thái hiện tại

26/26 test PASS trên `https://tl-nckh.vnest.vn` (mốc 2026-07-08). Nav thực tế đã phát hiện:

- Admin: Đề tài (đăng ký/danh sách/đợt), Hội đồng, Cuộc họp (tạo/danh sách), Người dùng (danh sách/yêu cầu nâng cấp), Quy đổi giờ giảng.
- Giảng viên: Đề tài (đăng ký/danh sách/đợt), Cuộc họp (danh sách), Quy đổi giờ giảng. **Không** có Người dùng / Hội đồng / Tạo cuộc họp.
