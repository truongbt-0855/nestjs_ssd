## [2024-05-20] Bug: Prisma Connection Timeout
- **Hiện tượng**: Backend NestJS không khởi động được, báo lỗi kết nối DB.
- **Nguyên nhân**: File `.env` đang để `localhost` nhưng PostgreSQL chạy trong Docker cần dùng `host.docker.internal`.
- **Giải pháp**: Cập nhật DATABASE_URL trong .env.
- **Lưu ý**: Luôn kiểm tra môi trường chạy (Docker vs Native) trước khi config DB.