# Monorepo Quickstart

## 1) Khởi động hạ tầng

```bash
docker compose up -d
```

## 2) Cài dependencies

```bash
npm install
```

## 3) Generate Prisma client + migrate + seed

```bash
npm run db:generate -w backend
npm run db:migrate -w backend
npm run db:seed -w backend
```

## 4) Chạy Backend và Frontend

```bash
npm run dev:backend
npm run dev:frontend
```

## 5) Truy cập Swagger

- URL: `http://localhost:8000/swagger`

## 6) Kiểm tra các route frontend

- Student courses: `http://localhost:3000/student/courses`
- Student purchased courses: `http://localhost:3000/student/my-courses`
- Instructor courses: `http://localhost:3000/instructor/courses`
- Admin revenue: `http://localhost:3000/admin/revenue`
