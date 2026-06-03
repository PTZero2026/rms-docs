# infra/ — Hạ tầng dưới dạng mã

IaC và môi trường chạy cho các thành phần ở [overview.md §2](../docs/architecture/overview.md):
PostgreSQL, object storage (S3/MinIO), job scheduler, reverse proxy/BFF.

Gợi ý nội dung: `docker-compose.yml` cho dev local, manifest k8s/helm cho triển khai,
cấu hình môi trường. Khớp quy trình ở [guides/release-process.md](../docs/guides/release-process.md).
