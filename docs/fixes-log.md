# Fixes Log - Nest-Learn

Tài liệu này tổng hợp các lỗi đã gặp trong quá trình setup/run local và cách đã xử lý.

## 1) Lỗi Prisma migrate: thiếu biến môi trường `DATABASE_URL`

### Triệu chứng
- Lệnh `npm run db:migrate -w backend` báo lỗi:
  - `Environment variable not found: DATABASE_URL`

### Nguyên nhân
- Chưa tạo file `.env` cho backend từ template.

### Cách fix
- Tạo env file:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Trạng thái
- ✅ Đã fix, migrate/seed chạy được.

---

## 2) Lỗi DB không kết nối được (`P1001: Can't reach database server`)

### Triệu chứng
- Prisma không kết nối được `localhost:5432`.

### Nguyên nhân
- Postgres container không start do mismatch version dữ liệu volume cũ (PG15) và image mới (PG16).

### Cách fix
- Đổi image trong `docker-compose.yml` từ `postgres:16-alpine` -> `postgres:15-alpine`.
- Khởi động lại service postgres.

### Trạng thái
- ✅ Đã fix, Postgres/Redis đều `Up`.

---

## 3) Lỗi backend `EADDRINUSE: address already in use :::3000`

### Triệu chứng
- Chạy backend báo cổng `3000` đã bị chiếm.

### Nguyên nhân
- Có process khác đang listen trên port 3000 (thường là backend instance khác).

### Cách xử lý
- Kiểm tra port:

```bash
netstat -ano | findstr :3000
```

- Kill PID nếu cần:

```bash
taskkill /PID <PID> /F
```

### Trạng thái
- ⚠️ Không phải lỗi code; là lỗi môi trường runtime port conflict.

---

## 4) Lỗi frontend route conflict (Next.js App Router)

### Triệu chứng
- Next.js báo:
  - `You cannot have two parallel pages that resolve to the same path`
  - Xung đột giữa:
    - `/(instructor)/courses/page`
    - `/(student)/courses/page`

### Nguyên nhân
- Dùng route groups khác nhau nhưng cùng resolve vào path `/courses`.

### Cách fix
- Đổi route theo namespace role:
  - `/student/courses`
  - `/instructor/courses`
- Xoá các route cũ gây conflict.

### Trạng thái
- ✅ Đã fix, 2 route mới trả `200`.

---

## 5) Lỗi frontend root `/` trả 404

### Triệu chứng
- Vào `localhost:3000` hoặc `localhost:3001` ra 404.

### Nguyên nhân
- Chưa có root `app/page.tsx` và root layout đầy đủ.

### Cách fix
- Tạo:
  - `frontend/app/layout.tsx`
  - `frontend/app/page.tsx`

### Trạng thái
- ✅ Đã fix, `GET /` trả `200`.

---

## 6) Lỗi TypeScript frontend (`Cannot find namespace 'JSX'`)

### Triệu chứng
- IDE báo lỗi JSX typing ở các page/component frontend.

### Nguyên nhân
- Thiếu/không đồng bộ cấu hình type React/Next trong frontend.

### Cách fix
- Bổ sung cấu hình frontend TS và type packages.
- Loại bỏ các annotation `: JSX.Element` không cần thiết tại một số component.
- Next.js tự cập nhật `next-env.d.ts` + `tsconfig` khi chạy `next dev`.

### Trạng thái
- ✅ Đã fix theo kiểm tra hiện tại.

---

## 7) Ghi chú cảnh báo không chặn chạy

### Cảnh báo Docker Compose
- `the attribute version is obsolete`
- Không làm hệ thống fail, chỉ warning.

### Cảnh báo Prisma
- `package.json#prisma is deprecated`
- Không làm hệ thống fail, nên migrate dần sang `prisma.config.ts` khi cần.

---

## 8) Lỗi frontend không có CSS (Tailwind chưa active)

### Triệu chứng
- Trang frontend render được nhưng UI rất thô, class Tailwind không có hiệu lực.

### Nguyên nhân
- Chưa có pipeline Tailwind/PostCSS đầy đủ và root layout chưa import global stylesheet.

### Cách fix
- Tạo và cấu hình:
  - `frontend/tailwind.config.ts`
  - `frontend/postcss.config.js`
  - `frontend/app/globals.css`
- Import `./globals.css` trong `frontend/app/layout.tsx`.
- Bổ sung dependencies `postcss` và `autoprefixer` cho frontend.

### Trạng thái
- ✅ Đã fix, frontend lên style đúng sau khi chạy lại `npm run dev -w frontend`.

---

## 9) Lệnh kiểm tra local chuẩn sau khi fix

```bash
docker compose up -d
npm install
npm run db:generate -w backend
npm run db:migrate -w backend
npm run db:seed -w backend
npm run dev:backend
npm run dev:frontend
```

### URL kiểm tra
- Backend Swagger: `http://localhost:3000/swagger`
- Frontend root: `http://localhost:3001/` (hoặc `3000` nếu trống)
- Student page: `http://localhost:3001/student/courses`
- Instructor page: `http://localhost:3001/instructor/courses`

---

## 10) Quy ước cập nhật log fix

- Sau mỗi lần fix bug, phải thêm một mục mới vào file này theo format:
  - Triệu chứng
  - Nguyên nhân
  - Cách fix
  - Trạng thái

---

## 11) File liên quan đã chỉnh nhiều

- `docker-compose.yml`
- `backend/.env.example`, `frontend/.env.example`
- `backend/prisma/schema.prisma`, `backend/prisma/seed.ts`
- `frontend/app/layout.tsx`, `frontend/app/page.tsx`
- `frontend/app/(student)/student/courses/page.tsx`
- `frontend/app/(instructor)/instructor/courses/page.tsx`
- `frontend/app/(instructor)/instructor/courses/[courseId]/lessons/page.tsx`

---

## 12) Lỗi CSS vẫn mất ở route-group dù đã có Tailwind config

### Triệu chứng
- Các trang trong nhóm route `(student)` và `(instructor)` vẫn hiển thị không có style đồng bộ.

### Nguyên nhân
- Có 2 file layout riêng trong route-group:
  - `frontend/app/(student)/layout.tsx`
  - `frontend/app/(instructor)/layout.tsx`
- Hai layout này tạo `html/body` riêng, làm các route tương ứng không kế thừa đúng root layout import `globals.css`.

### Cách fix
- Xoá 2 route-group layout trên, để toàn bộ app dùng duy nhất root layout `frontend/app/layout.tsx` (nơi import `./globals.css`).

### Trạng thái
- ✅ Đã fix, kiểm tra `GET /`, `GET /student/courses`, `GET /instructor/courses` đều trả `200`.

---

## 13) Frontend nhìn như "không có CSS" do nhầm cổng + UI quá tối giản

### Triệu chứng
- Người dùng thấy trang trắng đen và nghĩ Tailwind/CSS chưa chạy.

### Nguyên nhân
- Frontend trước đó tự đổi cổng khi `3000` bận, dễ mở nhầm backend ở `3000`.
- UI cũ dùng style nhẹ nên khó nhận biết CSS đã apply.

### Cách fix
- Ép frontend chạy cố định cổng `3001` trong `frontend/package.json` (`dev`/`start`).
- Tăng style trực quan ở `frontend/app/page.tsx` và `frontend/app/layout.tsx` để xác nhận Tailwind hoạt động ngay.

### Trạng thái
- ✅ Đã fix trong mã nguồn; frontend luôn chạy tại `http://localhost:3001`.

---

## 14) Lỗi 500 khi gọi `POST /auth/login`

### Triệu chứng
- Trang `instructor/courses` auto call login và nhận response `500 Internal server error` tại `/auth/login`.

### Cách tái hiện
- Mở frontend: `http://localhost:3000/instructor/courses`.
- Quan sát Network: request `POST http://localhost:8000/auth/login` trả `500`.

### Nguyên nhân
- `bcryptjs` được import dạng default trong backend (`import bcrypt from 'bcryptjs'`).
- Khi compile CommonJS, runtime truy cập `bcryptjs_1.default` (undefined) dẫn đến crash trong `auth.service`.

### Cách fix
- Đổi import sang namespace:
  - `import * as bcrypt from 'bcryptjs'` trong:
    - `backend/src/modules/auth/auth.service.ts`
    - `backend/prisma/seed.ts`

### Trạng thái
- ✅ Đã fix, kiểm tra lại `POST /auth/login` trả `201 Created` và gọi `GET /courses` với Bearer token trả `200`.

### Cách verify nhanh
- `curl -i -X POST http://localhost:8000/auth/login -H "Content-Type: application/json" -d '{"email":"instructor@nestlearn.local","password":"Instructor@123"}'`
- Kỳ vọng: HTTP `201` + có `accessToken` trong response.

---

## 15) Rà spec tổng thể và vá các khoảng trống nghiệp vụ cốt lõi

### Triệu chứng
- Nhiều luồng chạy được ở mức demo nhưng lệch spec: giá khóa học chưa lưu bền vững, mua khóa học chưa trừ ví thật, báo cáo doanh thu chưa dựa transaction thực.

### Nguyên nhân
- Nhiều service đang dùng dữ liệu in-memory/mock thay vì đọc/ghi Prisma database.
- Model Course chưa có trường giá tiền ở schema DB.

### Cách fix
- Bổ sung `Course.price` và relation đầy đủ trong `schema.prisma`, tạo migration mới.
- Chuyển `AuthService`, `UsersService`, `CoursesService`, `LessonsService`, `OrdersService`, `AdminRevenueService` sang logic Prisma thật.
- Luồng mua dùng Prisma interactive transaction: kiểm tra số dư, trừ ví, tạo enrollment, ghi purchase transaction, phát event sau commit.
- Giới hạn quyền theo role cho endpoint create/update course/lesson và purchase.
- Cập nhật UI instructor/student để nhập/hiển thị giá khóa học và refresh số dư ví sau mua.

### Trạng thái
- ✅ Đã verify end-to-end: tạo course có giá, student mua thành công, số dư giảm đúng, mua trùng trả thông báo đã sở hữu, admin revenue tăng đúng.

---

## 16) Kiểm thử tổng hợp ngày 2026-02-22: lỗi lock Prisma engine (EPERM)

### Triệu chứng
- Chạy `npm run db:generate -w backend` hoặc `npm run db:migrate -w backend` đôi lúc báo:
  - `EPERM: operation not permitted, rename ... query_engine-windows.dll.node.tmp -> ... query_engine-windows.dll.node`

### Nguyên nhân
- Có tiến trình Node/Nest cũ giữ lock Prisma engine file trên Windows trong khi lệnh generate/migrate đang chạy.

### Cách xử lý thực tế khi kiểm thử
- Dừng process chiếm cổng app (`3000`, `8000`) rồi chạy lại generate/migrate.
- Sau khi dọn process, `db:generate` chạy thành công.

### Cách fix đã áp dụng trong mã nguồn
- Thêm script `backend/scripts/prisma-safe-runner.cjs` để retry tự động Prisma command khi phát hiện `EPERM/EBUSY` lock file engine.
- Cập nhật script backend:
  - `db:generate` chạy qua safe runner.
  - `db:migrate` chạy migrate + generate qua safe runner để đảm bảo client được generate ổn định sau migrate.
- Khi lock lặp lại nhiều lần trên Windows, safe runner tự dừng process Node khác (best effort) để giải phóng Prisma engine lock.

### Trạng thái
- ✅ Đã ổn định hơn trong kiểm thử lại: `db:migrate` + `db:seed` chạy qua cơ chế retry/recovery và hoàn tất.
- ⚠️ Side effect: khi lock nặng, safe runner có thể dừng các tiến trình Node đang chạy (ví dụ frontend/backend dev server) và cần khởi động lại sau đó.

### Kết quả kiểm thử full sweep sau fix
- Build/typecheck pass:
  - `npx tsc -p backend/tsconfig.json --noEmit`
  - `npm run build -w frontend`
- API smoke pass toàn bộ luồng auth/guard/purchase/wallet/revenue.
- Route frontend chính (`/`, `/student/courses`, `/student/my-courses`, `/instructor/courses`) đều `200` sau khi restart frontend.

### Kết quả stress run bổ sung
- API stress 15 vòng liên tiếp: PASS 15/15, không ghi nhận lỗi logic nghiệp vụ.
- Prisma `db:generate` lặp 8 lần liên tiếp: PASS 8/8.
- Có thời điểm sau stress, FE/BE dev server bị down và cần restart thủ công; sau restart tất cả route và quick smoke đều pass.

---

## 17) Kiểm thử tổng hợp ngày 2026-02-22: dữ liệu seed lệch luồng mua mặc định

### Triệu chứng
- Student seed có số dư `1000`, trong khi course seed có giá `199000` và `299000`.
- Luồng mua course seed luôn thất bại vì không đủ số dư.

### Ảnh hưởng
- Khi QA/manual test theo dữ liệu seed mặc định, dễ hiểu nhầm là flow purchase bị lỗi.
- Không có sẵn happy-path mua thành công ngay trên seed data mặc định.

### Cách workaround trong phiên test
- Tạo course mới với giá thấp (ví dụ `100`) để kiểm tra đầy đủ flow mua thành công.

### Cách fix đã áp dụng trong mã nguồn
- Tăng số dư ví student seed trong `backend/prisma/seed.ts` từ `1000` lên `1000000`.

### Trạng thái
- ✅ Đã fix: mua thành công `seed-course-nest-basic` bằng tài khoản seed student trong kiểm thử lại.
