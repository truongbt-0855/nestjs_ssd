# Nest-Learn

Hệ thống E-Learning theo mô hình **monorepo** gồm Backend + Frontend.

## 1) Mô tả nghiệp vụ

Nest-Learn phục vụ 3 vai trò chính:

- **Admin**
  - Xem dashboard doanh thu.
- **Instructor**
  - Tạo khóa học.
  - Quản lý nhiều bài học video trong một khóa học.
- **Student**
  - Có ví tiền (`Balance`).
  - Mua khóa học bằng ví.
  - Sau khi mua thành công được mở quyền truy cập bài học.

Luồng nghiệp vụ chính:

1. Instructor tạo và cập nhật khóa học/bài học.
2. Student chọn khóa học và thanh toán bằng ví.
3. Hệ thống xử lý giao dịch qua backend.
4. Sau khi thanh toán thành công, hệ thống phát event để kích hoạt xử lý nền (email, media jobs).
5. Admin theo dõi doanh thu qua dashboard.

## 2) Kiến trúc & công nghệ

### Backend
- NestJS (module-based)
- Passport JWT
- Prisma ORM
- PostgreSQL (Docker)
- BullMQ + Redis
- Event Emitter
- Swagger cho REST API

### Frontend
- Next.js (App Router)
- Tailwind CSS
- Lucide Icons

### Monorepo
- NPM Workspaces
- Cấu trúc chính:
  - `backend/`
  - `frontend/`
  - `packages/shared-types/`

## 3) Cách chạy dự án

### Bước 1: Khởi động hạ tầng (Postgres + Redis)

```bash
docker compose up -d
```

### Bước 2: Cài dependencies

```bash
npm install
```

### Bước 3: Generate Prisma client + migrate + seed

```bash
npm run db:generate -w backend
npm run db:migrate -w backend
npm run db:seed -w backend
```

### Bước 4: Chạy backend và frontend

```bash
npm run dev:backend
npm run dev:frontend
```

### Bước 5: Mở Swagger

- URL: `http://localhost:8000/swagger`

### Bước 6: Kiểm tra nhanh các màn hình chính

- Student courses: `http://localhost:3000/student/courses`
- Student purchased courses: `http://localhost:3000/student/my-courses`
- Instructor courses: `http://localhost:3000/instructor/courses`
- Admin revenue: `http://localhost:3000/admin/revenue`

## 4) Tài khoản seed mặc định

- Admin: `admin@nestlearn.local` / `Admin@123`
- Instructor: `instructor@nestlearn.local` / `Instructor@123`
- Student: `student@nestlearn.local` / `Student@123` (seed ví mặc định: `1000000`)

## 5) Scripts thường dùng

### Root
- `npm run dev:backend`
- `npm run dev:frontend`
- `npm run db:migrate`
- `npm run db:seed`

### Backend
- `npm run start:dev -w backend`
- `npm run db:generate -w backend`
- `npm run db:migrate -w backend`
- `npm run db:seed -w backend`

## 6) Ghi chú

- Frontend **không** truy cập trực tiếp database, chỉ gọi REST API backend qua biến môi trường `.env`.
- `docker-compose.yml` đặt ở root để quản lý chung Postgres và Redis.
- Mặc định local: Frontend chạy cổng `3000`, Backend chạy cổng `8000`.
- Checklist handoff release-ready: [docs/release-ready-handoff.md](docs/release-ready-handoff.md)
