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

---

## Phase 3: User Story 0 - User Registration & Login with JWT (Priority: P0) 🆕

**Goal**: Users can register, login with email/password, receive JWT token for authenticated operations

**Independent Test**: Register user → Login → Receive JWT token → Use token on protected endpoints → Token expires/logout

**Why P0**: Authentication is prerequisite for all other user stories (role-based access, course ownership, etc.)

### Backend: User Model & Auth Infrastructure

- [ ] T029 [P] [US0] Update `backend/src/modules/auth/auth.service.ts`: Add bcrypt password hashing and JWT generation (sub, role, exp claims)
- [ ] T030 [P] [US0] Create `backend/src/modules/auth/strategies/jwt.strategy.ts`: Implement JwtStrategy for token validation via Passport
- [ ] T031 [P] [US0] Create `backend/src/modules/auth/guards/jwt-auth.guard.ts`: Add @UseGuards(JwtAuthGuard) for endpoint protection
- [ ] T032 [P] [US0] Create `backend/src/modules/auth/decorators/current-user.decorator.ts`: Extract user from JWT payload via @CurrentUser()
- [ ] T033 [US0] Update `backend/src/modules/auth/auth.controller.ts`:
  - POST /auth/register: Accept { email, password, name, role }, hash password, create user
  - POST /auth/login: Accept { email, password }, compare password, generate JWT token, return { access_token, user }
- [ ] T034 [P] [US0] Update `backend/prisma/schema.prisma`: Add password field to User model
- [ ] T035 Create and run `backend/prisma/migrations/add_password_to_user` migration
- [ ] T036 [P] [US0] Update `backend/prisma/seed.ts`: Add hashed passwords to test users (instructor1/2, student1/2)

### Frontend: Authentication UI & Service

- [ ] T037 [P] [US0] Create `frontend/src/services/auth.service.ts` with methods:
  - register(email, password, name, role)
  - login(email, password)
  - logout(): Clear localStorage
  - getToken(), getCurrentUser(), isAuthenticated(), isInstructor()
- [ ] T038 [P] [US0] Create `frontend/src/pages/LoginPage.tsx`:
  - Email, password input fields with validation
  - Submit button, loading state, error messages
  - Success: Save token to localStorage, redirect to /courses
- [ ] T039 [P] [US0] Create `frontend/src/pages/RegisterPage.tsx`:
  - Email, password, name, role selector with validation
  - Submit button, loading state, error messages
  - Success: Save token, redirect to /courses
- [ ] T040 [P] [US0] Create `frontend/src/components/ProtectedRoute.tsx`:
  - Check isAuthenticated(), redirect to /login if false
  - Optional: Check role for role-specific routes
- [ ] T041 [US0] Update `frontend/src/utils/axios.ts`:
  - Add JWT token to Authorization header on all requests (interceptor)
  - Catch 401 errors, clear token, redirect to /login
- [ ] T042 [US0] Update `frontend/src/App.tsx` routing:
  - Public routes: /login, /register
  - Protected routes: /courses, /admin/courses (INSTRUCTOR only)
  - Home / redirects based on authentication status
- [ ] T043 [P] [US0] Create `frontend/src/components/Navbar.tsx`:
  - Display user name, logout button
  - Show/hide based on isAuthenticated()

### Testing for User Story 0

- [ ] T044 [P] [US0] Create `backend/tests/unit/auth.spec.ts`:
  - hashPassword() generates bcrypt hash
  - comparePassword() validates correct/incorrect passwords
  - JWT token includes sub, role, exp claims
  - Invalid JWT signature rejected
- [ ] T045 [US0] Create `backend/tests/integration/auth.spec.ts`:
  - POST /auth/register creates user successfully
  - POST /auth/register duplicate email returns 400
  - POST /auth/login valid credentials returns JWT
  - POST /auth/login invalid password returns 401
  - Protected endpoints without token return 401
  - Protected endpoints with valid token succeed

**Checkpoint**: User Story 0 complete - Users can register/login with JWT ✅

---

## Phase 4: User Story 1 - Instructor manages courses (Priority: P1) 🎯 MVP

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

## Phase 5: User Story 2 - Student views published courses (Priority: P2)

**Goal**: Học viên có thể xem danh sách các khóa học đã xuất bản

**Independent Test**: Truy cập giao diện học viên, xác nhận hiển thị đúng danh sách các khóa học đã xuất bản

- [X] T018 [P] [US2] Add published status to Course entity/model in backend/src/models/course.entity.ts
- [X] T019 [US2] Implement endpoint to list published courses in backend/src/modules/course/course.controller.ts
- [X] T020 [US2] Add contract/integration tests for published course listing in backend/tests/integration/course-list.spec.ts
- [X] T021 [P] [US2] Create student-facing course list UI in frontend/src/pages/courses/
- [X] T022 [US2] Integrate published course API in frontend/src/services/course.service.ts
- [X] T023 [US2] Add loading, empty, and error states in frontend/src/pages/courses/

---

## Phase 6: User Story 3 - Manage publish status (Priority: P3)

**Goal**: Giảng viên có thể chuyển đổi trạng thái xuất bản của khóa học

**Independent Test**: Giảng viên thay đổi trạng thái xuất bản, học viên chỉ nhìn thấy các khóa học đang ở trạng thái xuất bản

- [X] T024 [P] [US3] Add publish/unpublish endpoint for Course in backend/src/modules/course/course.controller.ts
- [X] T025 [US3] Implement publish status logic in backend/src/modules/course/course.service.ts
- [X] T026 [US3] Add tests for publish/unpublish logic in backend/tests/unit/course-publish.spec.ts
- [X] T027 [P] [US3] Add publish toggle UI for instructor in frontend/src/pages/admin/courses/
- [X] T028 [US3] Integrate publish toggle API in frontend/src/services/course.service.ts

---

## Phase 7: Polish & Cross-Cutting Concerns

---

## Phase 8: Documentation & Final Validation

- [ ] T046 [P] Create `DEVELOPMENT.md` with setup instructions (env, docker, database, dev servers)
- [ ] T047 [P] Create `API.md` with complete endpoint documentation (auth, courses, published)
- [ ] T048 [P] Create `backend/README.md` with backend-specific setup
- [ ] T049 [P] Create `frontend/README.md` with frontend-specific setup

---

## Summary

**Total Tasks**: 49 (including all 3 completed phases + new US0 + US1-3 + docs)

**Completed Phases**:
- ✅ Phase 1: Setup (T001-T004) - 4 tasks
- ✅ Phase 2: Foundational (T005-T010) - 6 tasks
- **🆕 Phase 3: User Story 0 - JWT Auth (T029-T045)** - 17 NEW tasks
- ✅ Phase 4: User Story 1 - CRUD (T011-T017) - 7 tasks
- ✅ Phase 5: User Story 2 - Student View (T018-T023) - 6 tasks
- ✅ Phase 6: User Story 3 - Publish (T024-T028) - 5 tasks

**New Tasks**: T029-T049 (21 new tasks total)

---

## Dependencies & Execution Order

- Setup (Phase 1) → Foundational (Phase 2) → User Story 0 (Phase 3) → User Stories 1-3 (Phases 4-6)
- **IMPORTANT**: US0 (Authentication) must be completed before US1-3 can work properly
- User stories will still work with basic auth, but JWT protection should be added
- Polish phase after all user stories complete

## Parallel Execution Examples

- T003, T004 (linting, formatting) can run in parallel
- T006, T007 (auth, routing) can run in parallel
- T011, T012, T015 (backend/frontend for US1) can run in parallel
- T018, T021 (backend/frontend for US2) can run in parallel
- T024, T027 (backend/frontend for US3) can run in parallel

## Implementation Strategy

- MVP: Hoàn thành US1 (CRUD khóa học cho giảng viên) trước, kiểm thử độc lập
- Sau đó phát triển US2, US3, mỗi user story đều có thể kiểm thử và triển khai độc lập
