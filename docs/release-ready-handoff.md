# Release-Ready Handoff (Local QA)

## 1) Runbook chuẩn

### Chuẩn bị hạ tầng và dữ liệu
```bash
docker compose up -d
npm install
npm run db:generate -w backend
npm run db:migrate -w backend
npm run db:seed -w backend
```

### Chạy app
```bash
npm run dev:backend
npm run dev:frontend
```

### Build/compile checks
```bash
npx tsc -p backend/tsconfig.json --noEmit
npm run build -w frontend
```

## 2) Smoke checklist bắt buộc

### Route checks
- Backend Swagger: `http://localhost:8000/swagger` -> kỳ vọng `200`
- Frontend root: `http://localhost:3000/` -> kỳ vọng `200`
- Student courses: `http://localhost:3000/student/courses` -> kỳ vọng `200`
- Student purchased courses: `http://localhost:3000/student/my-courses` -> kỳ vọng `200`
- Instructor courses: `http://localhost:3000/instructor/courses` -> kỳ vọng `200`

### API business checks
- `POST /auth/login` cho `admin/instructor/student` -> `201`
- Instructor tạo course published -> `201`
- Student mua course -> `201`
- Student mua lại cùng course -> `201` + message chứa `đã sở hữu`
- `GET /users/my-courses` chứa course vừa mua
- `GET /users/me` balance giảm đúng theo price
- `GET /admin/revenue` tăng tổng doanh thu/số đơn sau purchase

### Guard checks
- Student gọi `POST /courses` -> `403`
- Instructor gọi `GET /admin/revenue` -> `403`
- Instructor gọi `POST /orders/purchase` -> `403`
- Anonymous gọi `GET /users/my-courses` -> `401`

## 3) Trạng thái hiện tại (đã xác nhận)
- Full sweep compile/build: PASS
- Full API smoke: PASS
- Stress API (15 loops): PASS 15/15
- Stress Prisma generate (8 runs): PASS 8/8

## 4) Known caveats
- Windows có thể gặp lock Prisma engine (`EPERM rename query_engine...`).
- Đã có safe runner tại `backend/scripts/prisma-safe-runner.cjs` để retry/recovery tự động.
- Side effect có thể xảy ra khi recovery lock nặng: một số process Node (BE/FE dev server) bị dừng và cần start lại.

## 5) Khi cần recover nhanh
```bash
npm run dev:backend
npm run dev:frontend
```

Nếu vẫn gặp lock kéo dài, đóng các terminal Node cũ rồi chạy lại:
```bash
npm run db:generate -w backend
npm run db:migrate -w backend
```
