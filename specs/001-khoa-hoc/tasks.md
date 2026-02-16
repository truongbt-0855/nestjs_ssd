---

description: "Task list for feature 001-khoa-hoc (Quản lý khóa học đơn giản)"
---

# Tasks: Quản lý khóa học với JWT Authentication

**Input**: Design documents from `/specs/001-khoa-hoc/`
**Prerequisites**: plan.md ✅, spec.md ✅
**Status**: Updated 2026-02-16 - Added User Story 0 (JWT Authentication) tasks

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and monorepo structure

- [X] T001 Create monorepo structure: backend/ (NestJS), frontend/ (React) at repo root
- [X] T002 Initialize NestJS project in backend/ with Prisma, PostgreSQL config
- [X] T003 Initialize React (Vite) project in frontend/ with Tailwind CSS, TanStack Query
- [X] T004 [P] Configure linting, formatting, and pre-commit hooks for both backend/ and frontend/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure for all user stories

- [X] T005 Setup base User and Course models in backend/src/models/
- [X] T006 [P] Setup authentication (role: instructor/student) in backend/src/modules/auth/
- [X] T007 [P] Setup API routing and validation (DTO, class-validator) in backend/src/modules/
- [X] T008 Setup environment config and error handling in backend/
- [X] T009 Setup base API response format middleware in backend/src/middleware/
- [X] T010 Setup frontend routing and base layout in frontend/src/

## Phase 3: User Story 1 - Instructor manages courses (Priority: P1) 🎯 MVP

**Goal**: Giảng viên có thể tạo, sửa, xóa khóa học của mình qua giao diện quản trị

**Independent Test**: Đăng nhập với vai trò giảng viên, thực hiện tạo, sửa, xóa một khóa học và xác nhận thay đổi xuất hiện trong danh sách quản trị

- [X] T011 [P] [US1] Create Course module (controller, service, DTO, entity) in backend/src/modules/course/
- [X] T012 [P] [US1] Implement create, update, delete endpoints for Course in backend/src/modules/course/course.controller.ts
- [X] T013 [US1] Add ownership checks for Course actions in backend/src/modules/course/course.service.ts
- [X] T014 [US1] Add API contract tests for Course CRUD in backend/tests/contract/course-crud.spec.ts
- [X] T015 [P] [US1] Create Course management UI (list, create, edit, delete) in frontend/src/pages/admin/courses/
- [X] T016 [US1] Integrate Course CRUD API in frontend/src/services/course.service.ts
- [X] T017 [US1] Add form validation and error handling in frontend/src/pages/admin/courses/

---

## Phase 4: User Story 2 - Student views published courses (Priority: P2)

**Goal**: Học viên có thể xem danh sách các khóa học đã xuất bản

**Independent Test**: Truy cập giao diện học viên, xác nhận hiển thị đúng danh sách các khóa học đã xuất bản

- [X] T018 [P] [US2] Add published status to Course entity/model in backend/src/models/course.entity.ts
- [X] T019 [US2] Implement endpoint to list published courses in backend/src/modules/course/course.controller.ts
- [X] T020 [US2] Add contract/integration tests for published course listing in backend/tests/integration/course-list.spec.ts
- [X] T021 [P] [US2] Create student-facing course list UI in frontend/src/pages/courses/
- [X] T022 [US2] Integrate published course API in frontend/src/services/course.service.ts
- [X] T023 [US2] Add loading, empty, and error states in frontend/src/pages/courses/

---

## Phase 5: User Story 3 - Manage publish status (Priority: P3)

**Goal**: Giảng viên có thể chuyển đổi trạng thái xuất bản của khóa học

**Independent Test**: Giảng viên thay đổi trạng thái xuất bản, học viên chỉ nhìn thấy các khóa học đang ở trạng thái xuất bản

- [X] T024 [P] [US3] Add publish/unpublish endpoint for Course in backend/src/modules/course/course.controller.ts
- [X] T025 [US3] Implement publish status logic in backend/src/modules/course/course.service.ts
- [X] T026 [US3] Add tests for publish/unpublish logic in backend/tests/unit/course-publish.spec.ts
- [X] T027 [P] [US3] Add publish toggle UI for instructor in frontend/src/pages/admin/courses/
- [X] T028 [US3] Integrate publish toggle API in frontend/src/services/course.service.ts

---

## Phase 6: Polish & Cross-Cutting Concerns

---

## Phase 7: Documentation & Final Validation

- [ ] T046 [P] Create `DEVELOPMENT.md` with setup instructions (env, docker, database, dev servers)
- [ ] T047 [P] Create `API.md` with complete endpoint documentation (auth, courses, published)
- [ ] T048 [P] Create `backend/README.md` with backend-specific setup
- [ ] T049 [P] Create `frontend/README.md` with frontend-specific setup

---

## Phase 8: User Story 0 - Đăng nhập với JWT (Priority: P0)

**Mục tiêu**: Người dùng (giảng viên/học viên) có thể đăng nhập bằng email/mật khẩu từ seed data và nhận JWT token để sử dụng các tính năng khác

**Kiểm thử độc lập**: Đăng nhập (email/password từ seed) → Nhận JWT token → Sử dụng token trên các endpoint bảo vệ → Token hợp lệ

**Tại sao P0**: Đăng nhập là điều kiện tiên quyết để phân quyền theo vai trò và bảo vệ dữ liệu

### Backend: Xác thực JWT

- [ ] T050 [P] [US0] Cập nhật `backend/src/modules/auth/auth.service.ts`: Thêm login logic, kiểm tra email/password, sinh JWT token (claim: sub, role, exp = 1 ngày)
- [ ] T051 [P] [US0] Tạo `backend/src/modules/auth/strategies/jwt.strategy.ts`: Validate JWT token via Passport strategy
- [ ] T052 [P] [US0] Tạo `backend/src/modules/auth/guards/jwt-auth.guard.ts`: Dùng @UseGuards(JwtAuthGuard) để bảo vệ endpoint
- [ ] T053 [P] [US0] Tạo `backend/src/modules/auth/decorators/current-user.decorator.ts`: Lấy user từ JWT via @CurrentUser()
- [ ] T054 [US0] Cập nhật `backend/src/modules/auth/auth.controller.ts` - Endpoint login:
  - POST /auth/login: Nhận { email, password }, kiểm tra mật khẩu, tạo JWT, trả về { access_token, user }
- [ ] T055 [P] [US0] Cập nhật `backend/prisma/seed.ts`: Đảm bảo seed data có password hash cho users (instructor1@example.com/password, student1@example.com/password)

### Frontend: Login UI & Service

- [ ] T056 [P] [US0] Tạo `frontend/src/services/auth.service.ts` với methods:
  - login(email, password) → POST /auth/login
  - logout() → Xóa localStorage
  - getToken(), getCurrentUser(), isAuthenticated(), isInstructor()
- [ ] T057 [P] [US0] Tạo `frontend/src/pages/LoginPage.tsx`:
  - 2 input fields (Email, Password) 
  - Button submit, loading state, error message
  - Khi thành công: Lưu token vào localStorage, redirect /courses
  - Hướng dẫn: Dùng email instructor1@example.com / student1@example.com, password từ seed
- [ ] T058 [P] [US0] Tạo `frontend/src/components/ProtectedRoute.tsx`:
  - Kiểm tra isAuthenticated(), redirect /login nếu không
  - Optional: Kiểm tra role cho route cần role cụ thể
- [ ] T059 [US0] Cập nhật `frontend/src/utils/axios.ts`:
  - Interceptor: Thêm Authorization: Bearer <token> header vào tất cả requests
  - Catch 401: Xóa token, redirect /login
- [ ] T060 [US0] Cập nhật `frontend/src/App.tsx` routing:
  - Route công khai: /login
  - Route bảo vệ: /courses, /admin/courses (INSTRUCTOR only)
  - / redirect dựa vào isAuthenticated()
- [ ] T061 [P] [US0] Tạo `frontend/src/components/Navbar.tsx`:
  - Hiển thị tên user, button logout (gọi auth.logout())
  - Show/hide dựa vào isAuthenticated()

### Kiểm thử cho User Story 0

- [ ] T062 [P] [US0] Tạo `backend/tests/unit/auth.spec.ts`:
  - JWT token được tạo với claims (sub, role, exp)
  - Token hết hạn sau 1 ngày
  - Token không hợp lệ bị từ chối
- [ ] T063 [US0] Tạo `backend/tests/integration/auth.spec.ts`:
  - POST /auth/login với email/password đúng → trả JWT ✓
  - POST /auth/login email/password sai → 401 ✗
  - Endpoint bảo vệ không token → 401 ✗
  - Endpoint bảo vệ có token hợp lệ → 200 ✓

**Checkpoint**: User Story 0 hoàn thành - Người dùng có thể đăng nhập, nhận JWT, dùng trên các endpoint ✅

---

## Tóm tắt Task

**Tổng số tasks**: 63 (gồm 28 đã hoàn thành + 14 mới cho US0 Login)

**Các Phase đã hoàn thành**:
- ✅ Phase 1: Setup (T001-T004) - 4 tasks
- ✅ Phase 2: Foundational (T005-T010) - 6 tasks
- ✅ Phase 3: User Story 1 - CRUD khóa học (T011-T017) - 7 tasks
- ✅ Phase 4: User Story 2 - Xem khóa học xuất bản (T018-T023) - 6 tasks
- ✅ Phase 5: User Story 3 - Publish toggle (T024-T028) - 5 tasks

**Những task mới**:
- Phase 7: Documentation (T046-T049) - 4 tasks
- **🆕 Phase 8: User Story 0 - Đăng nhập JWT (T050-T063)** - 14 NEW tasks ← **Chèn vào cuối**

---

## Thứ tự thực hiện

1. Setup (Phase 1) → Foundational (Phase 2)
2. US1-3 (Phase 3-5) - Đã hoàn thành ✅
3. **US0 - Đăng nhập (Phase 8)** - Task mới, thêm JWT login vào hệ thống hiện tại
4. Documentation (Phase 7)
