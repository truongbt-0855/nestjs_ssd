---

description: "Task list for feature 001-khoa-hoc (Quản lý khóa học đơn giản)"
---

# Tasks: Quản lý khóa học đơn giản

**Input**: Design documents from `/specs/001-khoa-hoc/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

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
- [ ] T027 [P] [US3] Add publish toggle UI for instructor in frontend/src/pages/admin/courses/
- [ ] T028 [US3] Integrate publish toggle API in frontend/src/services/course.service.ts

---

## Phase N: Polish & Cross-Cutting Concerns


---

## Phase N2: Seed & Mock Data (Pre-final)

**Purpose**: Tạo dữ liệu mẫu cho backend (Prisma) để test đủ các tính năng, seed đầy đủ các bảng (User, Course, ...)

- [X] T034 [P] Seed/mock data cho backend (Prisma) đủ các bảng để test API và tính năng (User, Course, ...)

---


---

## Dependencies & Execution Order

- Setup (Phase 1) → Foundational (Phase 2) → User Stories (Phase 3-5, in priority order)
- User stories can be developed/tested independently after foundational phase
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
