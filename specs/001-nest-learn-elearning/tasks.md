# Tasks: Nest-Learn E-Learning Core

**Input**: Tài liệu thiết kế từ `/specs/001-nest-learn-elearning/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required)

**Tests**: Spec hiện tại không bắt buộc TDD, nên danh sách tập trung implementation + kiểm thử tích hợp theo phase.

## Phase 1: Setup Docker (Postgres, Redis), Prisma Schema, và Seed data

**Mục tiêu**: Hoàn thiện nền tảng chạy local và data nền cho 3 role

- [ ] T001 Cấu hình NPM workspaces ở root in package.json
- [ ] T002 Tạo docker compose quản lý Postgres + Redis tại root in docker-compose.yml
- [ ] T003 [P] Khai báo biến môi trường backend cho DB/Redis/JWT in backend/.env.example
- [ ] T004 [P] Khai báo biến môi trường frontend cho API URL in frontend/.env.example
- [ ] T005 Cấu hình datasource Prisma PostgreSQL in backend/prisma/schema.prisma
- [ ] T006 Tạo migration khởi tạo schema nền in backend/prisma/migrations/202602210001_init/migration.sql
- [ ] T007 Viết seed 3 tài khoản mẫu Admin/Instructor/Student idempotent in backend/prisma/seed.ts
- [ ] T008 Tích hợp lệnh migrate + seed vào script backend in backend/package.json

---

## Phase 2: Core Modules (Auth, Users) với JWT và Guards

**Mục tiêu**: Xây dựng lớp xác thực/ủy quyền và user profile làm nền cho các module nghiệp vụ

- [ ] T009 Tạo AuthModule và UsersModule theo module-based architecture in backend/src/modules/auth/auth.module.ts
- [ ] T010 Cài đặt JWT strategy với Passport in backend/src/modules/auth/strategies/jwt.strategy.ts
- [ ] T011 Cài đặt JwtAuthGuard và role guard cơ bản in backend/src/modules/auth/guards/jwt-auth.guard.ts
- [ ] T012 [P] Tạo decorator lấy current user từ request in backend/src/modules/auth/decorators/current-user.decorator.ts
- [ ] T013 Tạo DTO đăng nhập/refresh token in backend/src/modules/auth/dto/login.dto.ts
- [ ] T014 Triển khai auth service phát hành/kiểm tra token in backend/src/modules/auth/auth.service.ts
- [ ] T015 Triển khai auth controller + Swagger bearer config in backend/src/modules/auth/auth.controller.ts
- [ ] T016 Triển khai users service lấy hồ sơ + vai trò + ví người dùng in backend/src/modules/users/users.service.ts
- [ ] T017 Triển khai users controller endpoint profile in backend/src/modules/users/users.controller.ts
- [ ] T018 Cấu hình ExceptionFilter global cho toàn bộ backend in backend/src/common/filters/http-exception.filter.ts

---

## Phase 3: Course & Lesson Modules (CRUD & Cursor Pagination)

**Mục tiêu**: Instructor quản lý khóa học/bài học, danh sách lớn dùng cursor pagination

- [ ] T019 [US2] Mở rộng model Course và Lesson in backend/prisma/schema.prisma
- [ ] T020 [US2] Tạo DTO CRUD Course và DTO query cursor in backend/src/modules/courses/dto/course.dto.ts
- [ ] T021 [US2] Tạo DTO CRUD Lesson và DTO query cursor in backend/src/modules/lessons/dto/lesson.dto.ts
- [ ] T022 [US2] Tạo utility cursor pagination dùng chung in backend/src/common/pagination/cursor-pagination.dto.ts
- [ ] T023 [US2] Triển khai course service CRUD + cursor listing in backend/src/modules/courses/courses.service.ts
- [ ] T024 [US2] Triển khai lesson service CRUD + cursor listing in backend/src/modules/lessons/lessons.service.ts
- [ ] T025 [US2] Triển khai course controller + tài liệu Swagger in backend/src/modules/courses/courses.controller.ts
- [ ] T026 [US2] Triển khai lesson controller + tài liệu Swagger in backend/src/modules/lessons/lessons.controller.ts
- [ ] T027 [P] [US2] Tạo trang dashboard instructor quản lý khóa học in frontend/app/(instructor)/courses/page.tsx
- [ ] T028 [P] [US2] Tạo trang quản lý lesson theo course in frontend/app/(instructor)/courses/[courseId]/lessons/page.tsx

---

## Phase 4: Order Module với Transaction và Event Emitter

**Mục tiêu**: Student mua khóa học bằng ví an toàn, dùng Prisma interactive transaction và event-driven

- [ ] T029 [US1] Mở rộng model Wallet, Enrollment, PurchaseTransaction in backend/prisma/schema.prisma
- [ ] T030 [US1] Tạo DTO mua khóa học và phản hồi giao dịch in backend/src/modules/orders/dto/purchase-course.dto.ts
- [ ] T031 [US1] Tạo helper giao dịch tiền bằng Prisma Interactive Transactions in backend/src/common/prisma/prisma-transaction.service.ts
- [ ] T032 [US1] Triển khai order service xử lý trừ ví + tạo enrollment in backend/src/modules/orders/orders.service.ts
- [ ] T033 [US1] Triển khai order controller endpoint mua khóa học + Swagger docs in backend/src/modules/orders/orders.controller.ts
- [ ] T034 [US1] Khởi tạo EventEmitter module và event PurchaseCompleted in backend/src/common/events/events.module.ts
- [ ] T035 [US1] Phát event PurchaseCompleted sau commit transaction in backend/src/modules/orders/events/purchase-completed.event.ts
- [ ] T036 [P] [US1] Tạo trang student mua khóa học bằng ví in frontend/app/(student)/courses/page.tsx
- [ ] T037 [P] [US1] Tạo trang student xem khóa học đã mua in frontend/app/(student)/my-courses/[courseId]/page.tsx

---

## Phase 5: Media/Notification với BullMQ

**Mục tiêu**: Xử lý tác vụ nền gửi email và nén video qua Redis queue

- [ ] T038 [US3] Cấu hình BullMQ kết nối Redis in backend/src/common/queue/queue.module.ts
- [ ] T039 [US3] Tạo notifications module producer enqueue email job in backend/src/modules/notifications/notifications.service.ts
- [ ] T040 [US3] Tạo notifications processor consumer + idempotency in backend/src/modules/notifications/notifications.processor.ts
- [ ] T041 [US3] Tạo media module producer enqueue video compression job in backend/src/modules/media/media.service.ts
- [ ] T042 [US3] Tạo media processor consumer + retry strategy in backend/src/modules/media/media.processor.ts
- [ ] T043 [US3] Gắn listener PurchaseCompleted để kích hoạt email job in backend/src/modules/orders/listeners/purchase-completed.listener.ts
- [ ] T044 [US3] Gắn listener LessonVideoUploaded để kích hoạt media job in backend/src/modules/lessons/listeners/lesson-video-uploaded.listener.ts
- [ ] T045 [US3] Tạo service tổng hợp doanh thu admin in backend/src/modules/admin/admin-revenue.service.ts
- [ ] T046 [US3] Tạo admin revenue controller endpoint + Swagger docs in backend/src/modules/admin/admin.controller.ts

---

## Phase 6: Frontend Dashboard & Swagger Integration

**Mục tiêu**: Hoàn thiện dashboard frontend theo role và đồng bộ tài liệu API cho tích hợp FE-BE

- [ ] T047 Tạo API client frontend dùng API URL từ .env in frontend/lib/api-client.ts
- [ ] T048 [P] Tạo dashboard admin hiển thị doanh thu in frontend/app/(admin)/revenue/page.tsx
- [ ] T049 [P] Tạo component trạng thái job nền (email/media) in frontend/components/job-status-card.tsx
- [ ] T050 Chuẩn hóa Swagger bootstrap, tags, examples in backend/src/main.ts
- [ ] T051 [P] Tạo package shared types cho DTO/interface dùng chung in packages/shared-types/src/index.ts
- [ ] T052 Cập nhật quickstart chạy monorepo (docker, migrate, seed, run FE/BE) in docs/monorepo-quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: Bắt đầu ngay
- **Phase 2**: Phụ thuộc hoàn tất Phase 1
- **Phase 3**: Phụ thuộc hoàn tất Phase 2
- **Phase 4**: Phụ thuộc hoàn tất Phase 2 (và dùng model từ Phase 1)
- **Phase 5**: Phụ thuộc hoàn tất Phase 4 (cần event PurchaseCompleted)
- **Phase 6**: Phụ thuộc hoàn tất các phase trước đó

### User Story Dependencies

- **US1 (P1)**: Phase 4, phụ thuộc nền tảng Auth/Users
- **US2 (P2)**: Phase 3, độc lập tương đối với US1
- **US3 (P3)**: Phase 5, phụ thuộc event từ US1 và dữ liệu lesson/course từ US2

### Dependency Graph

```text
Phase 1 -> Phase 2
Phase 2 -> Phase 3 (US2)
Phase 2 -> Phase 4 (US1)
Phase 3 + Phase 4 -> Phase 5 (US3)
Phase 5 -> Phase 6
```

### Parallel Opportunities

- **Phase 1**: T003, T004 chạy song song
- **Phase 2**: T012 chạy song song sau T010-T011
- **Phase 3**: T027, T028 chạy song song sau T025-T026
- **Phase 4**: T036, T037 chạy song song sau T033
- **Phase 5**: T040 và T042 có thể phát triển song song sau T038
- **Phase 6**: T048, T049, T051 chạy song song

---

## Ví dụ chạy song song theo User Story

### US1

```bash
Task: "T036 [US1] Tạo trang student mua khóa học bằng ví in frontend/app/(student)/courses/page.tsx"
Task: "T037 [US1] Tạo trang student xem khóa học đã mua in frontend/app/(student)/my-courses/[courseId]/page.tsx"
```

### US2

```bash
Task: "T027 [US2] Tạo trang dashboard instructor quản lý khóa học in frontend/app/(instructor)/courses/page.tsx"
Task: "T028 [US2] Tạo trang quản lý lesson theo course in frontend/app/(instructor)/courses/[courseId]/lessons/page.tsx"
```

### US3

```bash
Task: "T040 [US3] Tạo notifications processor consumer + idempotency in backend/src/modules/notifications/notifications.processor.ts"
Task: "T042 [US3] Tạo media processor consumer + retry strategy in backend/src/modules/media/media.processor.ts"
```

---

## Implementation Strategy

### MVP First

1. Hoàn tất Phase 1 + Phase 2
2. Hoàn tất Phase 4 (US1 - luồng mua học bằng ví)
3. Validate end-to-end luồng Student mua khóa học và truy cập bài học

### Incremental Delivery

1. Thêm Phase 3 để Instructor quản lý nội dung
2. Thêm Phase 5 để tự động hóa nền bằng BullMQ + EventEmitter
3. Hoàn thiện Phase 6 để đồng bộ dashboard frontend và Swagger integration
