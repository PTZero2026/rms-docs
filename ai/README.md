# ai/ — Tài sản cho LLM / agent

Phần cốt lõi của "AI-first": biến tri thức dự án thành dạng agent tiêu thụ được.

| Thư mục | Nội dung | Ghi chú |
|---|---|---|
| `context/` | Bản **máy-đọc** (JSON/YAML) trích từ `docs/features/*/spec.md` | Để agent truy hồi acceptance criteria có cấu trúc. Cần quy trình giữ đồng bộ với Markdown nguồn. |
| `prompts/` | Prompt mẫu theo loại task (scaffold module, gen migration, viết test…) | Tái dùng, version hóa. |
| `rules/` | Coding rule per-module/per-app cho agent | Bổ sung cho luật bất biến ở `AGENTS.md §4`. |
| `evals/` | Bộ kiểm thử chất lượng output AI | Vd: code sinh ra có bám AC trong spec không. |

> `docs/features/` vẫn là nguồn sự thật của con người. `ai/context/` là **dẫn xuất** — không sửa tay
> lệch khỏi nguồn; sinh lại bằng script trong `scripts/`.
