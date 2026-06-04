# packages/ — Code dùng chung (lý do chính để monorepo)

| Package | Trách nhiệm |
|---|---|
| `api-contracts/` | OpenAPI + type sinh ra. **Nguồn hợp đồng API duy nhất** — FE và BE đều import từ đây, sửa một chỗ. |
| `ui/` | Design system dùng chung `fe-portal` + `bo-admin`. |
| `domain-types/` | Enum/model dùng chung (vd trạng thái `ResearchProject`, mã vai trò). |
| `config/` | eslint / tsconfig / prettier dùng chung toàn workspace. |

Quy tắc: không gõ tay type API lệch giữa FE/BE — luôn sinh từ `api-contracts`.
