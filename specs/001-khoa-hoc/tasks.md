# Tasks: Quản lý khóa học với JWT Authentication

**Input**: Design documents from `/specs/001-khoa-hoc/`
**Prerequisites**: plan.md ✅, spec.md ✅
**Status**: Generated from plan.md + spec.md on 2026-02-16

**Feature Branch**: `001-khoa-hoc`

---

## Task Format Reference

Each task follows: `- [ ] [TaskID] [P?] [Story?] Description with file path`

| Component | Example |
|-----------|---------|
| **Checkbox** | `- [ ]` |
| **Task ID** | `T001`, `T002`, etc. |
| **[P]** | Parallelizable (optional) |
| **[Story]** | `[US0]`, `[US1]`, `[US2]`, `[US3]` (optional, only for user story phases) |
| **Description** | Clear action with exact file path |

---

## Phase 1: Setup & Infrastructure

**Goal**: Initialize project structure and dependencies

- [ ] T001 Create `/backend` and `/frontend` directory structure with `src/`, `tests/`, config files
- [ ] T002 [P] Initialize `backend/package.json` with NestJS, Prisma, JWT, bcrypt dependencies
- [ ] T003 [P] Initialize `frontend/package.json` with React, Vite, TanStack Query, Tailwind CSS dependencies
- [ ] T004 [P] Setup `backend/tsconfig.json` with strict TypeScript checking
- [ ] T005 [P] Setup `frontend/tsconfig.json` with React and Vite config
- [ ] T006 [P] Create `backend/.env.example` with `DATABASE_URL`, `JWT_SECRET`, `BCRYPT_ROUNDS`
- [ ] T007 [P] Create `frontend/.env.example` with `VITE_API_URL`
- [ ] T008 [P] Configure `backend/jest.config.ts` for unit and integration tests
- [ ] T009 Create `backend/docker-compose.yml` with PostgreSQL 15 service
- [ ] T010 Create `.gitignore` entries for `node_modules/`, `.env`, `.env.local`, `dist/`, `build/`

---

## Phase 2: Foundational Infrastructure (Blocking Prerequisites)

**Goal**: Core backend/frontend infrastructure that must be complete before user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & ORM

- [ ] T011 [P] Create `backend/prisma/schema.prisma` with User and Course models (DRAFT - fields only, no relations yet)
- [ ] T012 [P] Setup `backend/src/prisma.service.ts` for database connection management
- [ ] T013 Create and run `backend/prisma/migrations/init` database migration
- [ ] T014 [P] Create `backend/src/common/filters/all-exceptions.filter.ts` for global error handling
- [ ] T015 [P] Create `backend/src/middleware/api-response-format.middleware.ts` to format all responses as `{ data, message }`

### NestJS Core Modules

- [ ] T016 [P] Create `backend/src/app.module.ts` root application module with imports for all feature modules
- [ ] T017 [P] Create `backend/src/main.ts` entry point with middleware and global exception filter setup
- [ ] T018 [P] Setup `backend/nest-cli.json` configuration for module generation

### Frontend Core Structure

- [ ] T019 [P] Create `frontend/src/App.tsx` root component with routing structure
- [ ] T020 [P] Create `frontend/src/main.tsx` Vite entry point
- [ ] T021 [P] Create `frontend/vite.config.ts` with React and API proxy configuration
- [ ] T022 [P] Create `frontend/tailwind.config.js` for Tailwind CSS styling
- [ ] T023 [P] Create `frontend/src/index.css` with Tailwind imports

### API & HTTP Configuration

- [ ] T024 [P] Create `frontend/src/utils/axios.ts` with axios instance (JWT token will be added in US0)
- [ ] T025 [P] Create `frontend/src/types/common.ts` with API response types and User/Course interfaces

**Checkpoint**: Foundation ready - User Story 0 (Registration & Login) can now begin

---

## Phase 3: User Story 0 - Registration & Login with JWT (Priority: P0)

**Goal**: Users can register, login with email/password, receive JWT token for authenticated operations

**Independent Test**: Complete user flow - register new user → login → receive JWT token → use token on protected endpoint → token expires/logout

**Why P0**: Authentication is prerequisite for all other features (role-based access, course ownership, etc.)

### Backend: User Model & Auth Infrastructure

- [ ] T026 [P] [US0] Update `backend/prisma/schema.prisma`: Add `User` model with id, email (unique), password, name, role (ENUM), timestamps
- [ ] T027 [P] [US0] Create `backend/src/modules/auth/auth.module.ts` with JwtModule and PassportModule imports
- [ ] T028 [P] [US0] Create `backend/src/modules/auth/dto/register.dto.ts` with email, password, name, role validation rules
- [ ] T029 [P] [US0] Create `backend/src/modules/auth/dto/login.dto.ts` with email, password validation rules
- [ ] T030 [US0] Create `backend/src/modules/auth/auth.service.ts` with:
  - `register(email, password, name, role)`: Hash password with bcrypt (rounds: 10), create user, return user object
  - `login(email, password)`: Find user, compare password with bcrypt, generate JWT token with `sub`, `role`, `expiresIn: 1d`
  - `validateJwt(token)`: Verify JWT signature and expiration
  - `hashPassword(plain)`: bcrypt.hash(plain, 10)
  - `comparePassword(plain, hash)`: bcrypt.compare(plain, hash)
- [ ] T031 [US0] Create `backend/src/modules/auth/strategies/jwt.strategy.ts` with JwtStrategy for token validation
- [ ] T032 [US0] Create `backend/src/modules/auth/guards/jwt-auth.guard.ts` for @UseGuards(JwtAuthGuard) on endpoints
- [ ] T033 [P] [US0] Create `backend/src/modules/auth/decorators/current-user.decorator.ts` to extract user from JWT payload via @CurrentUser()
- [ ] T034 [US0] Create `backend/src/modules/auth/auth.controller.ts` with:
  - `POST /auth/register`: Accept RegisterDto, call auth.service.register(), return { data: user, message: "User created" }
  - `POST /auth/login`: Accept LoginDto, call auth.service.login(), return { data: { access_token, user }, message: "Login successful" }

### Database Migration & Seed Data

- [ ] T035 Create and run `backend/prisma/migrations/add_user_model` to add User table to database
- [ ] T036 [P] [US0] Create `backend/prisma/seed.ts` with test users:
  - instructor1@example.com / password (role: INSTRUCTOR)
  - instructor2@example.com / password (role: INSTRUCTOR)
  - student1@example.com / password (role: STUDENT)
  - student2@example.com / password (role: STUDENT)

### Frontend: Authentication UI & Service

- [ ] T037 [P] [US0] Create `frontend/src/services/auth.service.ts` with methods:
  - `register(email, password, name, role): Promise<{ user, token }>`
  - `login(email, password): Promise<{ user, token }>`
  - `logout(): void` - clears localStorage
  - `getToken(): string | null` - from localStorage
  - `getCurrentUser(): User | null` - from localStorage
  - `isAuthenticated(): boolean`
  - `isInstructor(): boolean`
- [ ] T038 [P] [US0] Create `frontend/src/pages/RegisterPage.tsx` with form fields:
  - Email (text input, required, email validation)
  - Password (password input, required, min 8 chars)
  - Name (text input, required)
  - Role selector (INSTRUCTOR / STUDENT radio buttons)
  - Submit button, loading state, error messages
  - Success: Save token to localStorage, redirect to /courses
- [ ] T039 [P] [US0] Create `frontend/src/pages/LoginPage.tsx` with form fields:
  - Email (text input, required, email validation)
  - Password (password input, required)
  - Submit button, loading state, error messages
  - Success: Save token to localStorage, redirect to dashboard (courses if STUDENT, admin if INSTRUCTOR)
- [ ] T040 [P] [US0] Create `frontend/src/components/ProtectedRoute.tsx` component:
  - Check `isAuthenticated()` from auth.service
  - If false: redirect to `/login`
  - If true: render wrapped component
  - Optional: Check role if role-specific route
- [ ] T041 [US0] Update `frontend/src/utils/axios.ts` to add JWT token to all requests:
  - axios interceptor on request: add `Authorization: Bearer <token>` header
  - axios interceptor on response: catch 401 errors and clear token/redirect to login
- [ ] T042 [US0] Update `frontend/src/App.tsx` with routing:
  - Public routes: `/login` (LoginPage), `/register` (RegisterPage)
  - Protected routes: `/courses` (courses list), `/admin/courses` (admin dashboard, INSTRUCTOR only)
  - Home route `/` redirects to `/login` if not authenticated, `/courses` if authenticated
- [ ] T043 [P] [US0] Create `frontend/src/components/Navbar.tsx` with:
  - Display current user name
  - "Logout" button that calls `auth.logout()` and redirects to `/login`
  - Show/hide based on `isAuthenticated()`

### Testing for User Story 0

- [ ] T044 [P] [US0] Create `backend/tests/unit/auth.spec.ts` with unit tests:
  - `hashPassword()` generates valid bcrypt hash
  - `comparePassword()` validates correct/incorrect passwords
  - JWT token generation includes `sub`, `role`, `exp` claims
  - JWT token with invalid signature is rejected
- [ ] T045 [US0] Create `backend/tests/integration/auth.spec.ts` with integration tests:
  - `POST /auth/register` with valid data creates user successfully
  - `POST /auth/register` with duplicate email returns 400
  - `POST /auth/login` with valid credentials returns JWT token
  - `POST /auth/login` with invalid password returns 401
  - Protected endpoint without token returns 401
  - Protected endpoint with valid token succeeds

**Checkpoint**: User Story 0 complete - Users can register, login, receive JWT token. All endpoints protected with JWT guards.

---

## Phase 4: User Story 1 - Instructor Course Management (Priority: P1)

**Goal**: Instructors can create, read, update, delete their own courses through admin dashboard

**Independent Test**: Login as instructor → Create course → See in list → Edit title → Delete → Verify gone

**Why P1**: Core feature delivery - allows instructors to manage course content

### Backend: Course Model & Service

- [ ] T046 [P] [US1] Update `backend/prisma/schema.prisma`: Add `Course` model with id, title, description, status (ENUM: DRAFT/PUBLISHED), ownerId (relation to User), timestamps
- [ ] T047 [P] [US1] Create `backend/src/modules/course/course.module.ts` as NestJS module importing CourseService
- [ ] T048 [P] [US1] Create `backend/src/modules/course/dto/create-course.dto.ts` with title, description validation
- [ ] T049 [P] [US1] Create `backend/src/modules/course/dto/update-course.dto.ts` with optional title, description
- [ ] T050 [US1] Create `backend/src/modules/course/course.service.ts` with methods:
  - `create(title, description, ownerId)`: Create course with status=DRAFT, return course
  - `findAll(ownerId)`: Get all courses for instructor (ownership check via ownerId)
  - `findById(id)`: Get single course (return full data with owner)
  - `update(id, ownerId, data)`: Update title/description (ownership check)
  - `delete(id, ownerId)`: Delete course (ownership check)
  - `updateStatus(id, ownerId, status)`: Update status to DRAFT/PUBLISHED (will be used in US3)
- [ ] T051 [US1] Create `backend/src/modules/course/course.controller.ts` with endpoints:
  - `POST /courses` @UseGuards(JwtAuthGuard) @Post() create() - for INSTRUCTOR only
  - `GET /courses` @UseGuards(JwtAuthGuard) @Get() findAll() - return user's courses
  - `GET /courses/:id` @UseGuards(JwtAuthGuard) @Get(':id') findById()
  - `PUT /courses/:id` @UseGuards(JwtAuthGuard) @Put(':id') update() - ownership check
  - `DELETE /courses/:id` @UseGuards(JwtAuthGuard) @Delete(':id') delete() - ownership check
- [ ] T052 [P] [US1] Create `backend/src/modules/course/guards/instructor-only.guard.ts` to enforce role=INSTRUCTOR on course write endpoints

### Database Migration

- [ ] T053 Create and run `backend/prisma/migrations/add_course_model` to add Course table with ownerId FK to users

### Frontend: Admin Dashboard for Instructors

- [ ] T054 [P] [US1] Create `frontend/src/services/course.service.ts` with methods:
  - `getAll()`: GET /courses - for instructor listing
  - `getById(id)`: GET /courses/:id
  - `create(title, description)`: POST /courses
  - `update(id, title, description)`: PUT /courses/:id
  - `delete(id)`: DELETE /courses/:id
  - (US3 additions: `publish(id)`: PATCH /courses/:id/publish, `unpublish(id)`: PATCH /courses/:id/unpublish)
- [ ] T055 [P] [US1] Create `frontend/src/pages/admin/courses/AdminCoursesPage.tsx`:
  - List of courses with columns: Title, Description, Status, Actions
  - Create Course button → form modal with title, description inputs
  - Edit button → form modal to update title/description
  - Delete button → confirmation dialog
  - Loading states, error messages, success notifications
  - Integration with TanStack Query (useQuery, useMutation)
- [ ] T056 [P] [US1] Create `frontend/src/components/CourseForm.tsx` reusable form:
  - Title input (required, min 5 chars)
  - Description textarea (required, min 10 chars)
  - Submit/Cancel buttons
  - Validation errors display
  - Loading state on submit
- [ ] T057 [US1] Update `frontend/src/App.tsx` routing:
  - Add `/admin/courses` route with ProtectedRoute (INSTRUCTOR only)
  - Add `/admin` redirect to `/admin/courses` for instructors

### Testing for User Story 1

- [ ] T058 [P] [US1] Create `backend/tests/unit/course.service.spec.ts`:
  - Course creation with valid data succeeds
  - Course update only works for owner
  - Non-owner cannot update course (ownership check fails)
  - Course deletion only works for owner
- [ ] T059 [US1] Create `backend/tests/integration/course.controller.spec.ts`:
  - POST /courses creates course (INSTRUCTOR with JWT)
  - GET /courses returns only user's courses
  - PUT /courses/:id updates only own courses
  - DELETE /courses/:id deletes only own courses
  - Non-INSTRUCTOR role cannot POST /courses (returns 403)

**Checkpoint**: User Story 1 complete - Instructors can fully manage their courses (CRUD).

---

## Phase 5: User Story 2 - Student Views Published Courses (Priority: P2)

**Goal**: Students can view list of published courses from all instructors

**Independent Test**: Login as student → See list of published courses only → Cannot see DRAFT courses

**Why P2**: Enables core student experience - viewing available courses

### Backend: Public Course Listing Endpoint

- [ ] T060 [US2] Update `backend/src/modules/course/course.service.ts`:
  - `findPublished()`: Get all courses where status=PUBLISHED (no ownership check, public data)
- [ ] T061 [US2] Add endpoint to `backend/src/modules/course/course.controller.ts`:
  - `GET /courses/published` (no @UseGuards needed, public) - returns { data: coursesList, message: "Published courses" }

### Frontend: Student Courses View

- [ ] T062 [P] [US2] Update `frontend/src/services/course.service.ts`:
  - `getPublished()`: GET /courses/published (no auth required)
- [ ] T063 [P] [US2] Create `frontend/src/pages/CoursesPage.tsx` (student view):
  - List published courses in cards (Title, Description, Instructor info)
  - No edit/delete buttons (read-only view)
  - Loading skeleton, empty state message
  - TanStack Query integration (useQuery)
- [ ] T064 [US2] Update `frontend/src/App.tsx` routing:
  - Public route `/courses` for published courses (visible to STUDENT)
  - Navbar shows different nav for STUDENT (Courses, Profile, Logout) vs INSTRUCTOR (My Courses, Admin, Logout)

### Testing for User Story 2

- [ ] T065 [P] [US2] Create `backend/tests/unit/course.service.spec.ts` (addition):
  - `findPublished()` returns only PUBLISHED courses
  - `findPublished()` excludes DRAFT courses
- [ ] T066 [US2] Create `backend/tests/integration/course.spec.ts` (addition):
  - GET /courses/published returns all PUBLISHED courses (no auth required)
  - STUDENT can GET /courses/published (read-only)
  - DRAFT courses are never returned in published list

**Checkpoint**: User Story 2 complete - Students can view published courses.

---

## Phase 6: User Story 3 - Publish/Unpublish Status Toggle (Priority: P3)

**Goal**: Instructors can toggle course publish status to control student visibility

**Independent Test**: Instructor publish course → Students see it → Instructor unpublish → Students no longer see it

**Why P3**: Provides control mechanism; less critical than core course management

### Backend: Publish/Unpublish Endpoints

- [ ] T067 [US3] Add endpoints to `backend/src/modules/course/course.controller.ts`:
  - `PATCH /courses/:id/publish` @UseGuards(JwtAuthGuard) - ownership check, sets status=PUBLISHED
  - `PATCH /courses/:id/unpublish` @UseGuards(JwtAuthGuard) - ownership check, sets status=DRAFT
  - Both return { data: updatedCourse, message: "Course [published|unpublished]" }

### Frontend: Publish Toggle UI

- [ ] T068 [P] [US3] Update `frontend/src/services/course.service.ts`:
  - `publish(courseId)`: PATCH /courses/:courseId/publish
  - `unpublish(courseId)`: PATCH /courses/:courseId/unpublish
- [ ] T069 [P] [US3] Update `frontend/src/pages/admin/courses/AdminCoursesPage.tsx`:
  - Add Status column showing DRAFT / PUBLISHED badge
  - Add "Publish" button for DRAFT courses
  - Add "Unpublish" button for PUBLISHED courses
  - Mutation handlers with loading/error states
  - Real-time status updates after toggle

### Testing for User Story 3

- [ ] T070 [P] [US3] Create `backend/tests/unit/course-publish.spec.ts`:
  - `updateStatus()` changes status from DRAFT to PUBLISHED
  - `updateStatus()` changes status from PUBLISHED to DRAFT
  - Ownership check fails for non-owner
- [ ] T071 [US3] Create `backend/tests/integration/course-publish.spec.ts`:
  - PATCH /courses/:id/publish only works for owner
  - PATCH /courses/:id/unpublish only works for owner
  - Published course appears in GET /courses/published
  - Unpublished course disappears from GET /courses/published

**Checkpoint**: User Story 3 complete - Instructor publish toggle works end-to-end.

---

## Phase 7: Testing & Polish (Cross-Cutting Concerns)

**Goal**: Comprehensive testing, documentation, performance optimization

### E2E Tests

- [ ] T072 [P] Create `backend/tests/e2e/full-flow.spec.ts`:
  - Register new instructor → Create course → Student login → View published course → Instructor unpublish → Student list updates
  - Register new student → Try to create course (403 Forbidden) → View courses (200 OK)
- [ ] T073 Create `frontend/tests/e2e/auth-flow.spec.ts`:
  - Register flow: fill form → submit → redirected to courses page, token in localStorage
  - Login flow: enter credentials → submit → redirected to dashboard, axios has auth header

### API Contract Tests

- [ ] T074 [P] Create `backend/tests/contract/auth-contracts.spec.ts`:
  - Verify all auth endpoints match response schema from plan.md
  - POST /auth/register: 201 with { data: { id, email, name, role }, message }
  - POST /auth/login: 200 with { data: { access_token, user }, message }
- [ ] T075 [P] Create `backend/tests/contract/course-contracts.spec.ts`:
  - Verify all course endpoints match response format
  - All responses follow { data, message } structure

### Frontend Component Tests

- [ ] T076 [P] Create `frontend/tests/components/LoginPage.spec.tsx`:
  - Form renders with email, password fields
  - Submit calls auth.login()
  - Success redirects to /courses
  - Error displays message
- [ ] T077 [P] Create `frontend/tests/components/ProtectedRoute.spec.tsx`:
  - Redirects to /login if not authenticated
  - Renders component if authenticated
  - Checks role for INSTRUCTOR-only routes

### Documentation

- [ ] T078 [P] Create `DEVELOPMENT.md` with:
  - Setup instructions (clone, install, env vars, docker-compose, database)
  - Running dev servers (backend, frontend)
  - Running tests (unit, integration, e2e)
  - Code style guide (kebab-case files, PascalCase classes)
- [ ] T079 [P] Create `API.md` with complete endpoint documentation:
  - All endpoints (auth, courses, published)
  - Request/response examples
  - Error codes and meanings
  - Required headers (Authorization)
- [ ] T080 [P] Create `backend/README.md` with backend-specific setup
- [ ] T081 [P] Create `frontend/README.md` with frontend-specific setup

### Performance & Security

- [ ] T082 [P] Add request logging to `backend/src/middleware/api-response-format.middleware.ts`:
  - Log request method, path, response status, duration
  - Use pino or winston logger
- [ ] T083 [P] Configure CORS in `backend/src/main.ts`:
  - Allow frontend origin in development
  - Set restrictive CORS headers for production
- [ ] T084 [P] Add input validation to all DTOs using class-validator:
  - email must be valid email
  - password min 8 chars, max 128 chars
  - title min 5, max 200 chars
  - description min 10, max 2000 chars

### Seed Data & Demo

- [ ] T085 Create comprehensive `backend/prisma/seed.ts` data:
  - 2 instructors with 3-4 courses each (mix DRAFT/PUBLISHED)
  - 2 students
  - At least 7 courses total for testing

### Final Validation

- [ ] T086 Verify all tasks from Phase 1-6 are complete and passing
- [ ] T087 Run full test suite: `npm test` (all unit, integration, e2e tests pass)
- [ ] T088 Build both backend and frontend: `npm run build` in both directories
- [ ] T089 Run servers locally and manually test all user flows
- [ ] T090 Commit all code and create pull request for review

**Checkpoint**: All features complete, tested, documented, ready for production.

---

## Dependency Graph

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) - BLOCKING
    ↓
Phase 3 (US0: Registration & Login) - REQUIRED for all other stories
    ├─→ Phase 4 (US1: CRUD) - Depends on Auth ✓
    ├─→ Phase 5 (US2: View Published) - Depends on Auth + CRUD ✓
    └─→ Phase 6 (US3: Publish Toggle) - Depends on Auth + CRUD ✓
    ↓
Phase 7 (Testing & Polish) - After all stories complete
```

---

## Parallel Execution Opportunities

### Backend (These can run in parallel):
- **T002-T010** (Setup): All independent initial setup
- **T026-T033** (US0 Backend): All auth infrastructure (different files)
- **T048-T049** (US1 DTOs): Can run parallel with auth tasks
- **T074-T075** (Contract tests): Parallel after endpoints exist

### Frontend (These can run in parallel):
- **T037-T042** (US0 Frontend): All login/auth UI (independent components)
- **T054-T056** (US1 Frontend): Dashboard and form (independent above auth)
- **T076-T077** (Component tests): Parallel test writing

---

## Success Criteria Checklist

- [ ] ✅ All 90 tasks completed and committed
- [ ] ✅ Unit tests: 100% auth.service and course.service covered
- [ ] ✅ Integration tests: All endpoints (auth, CRUD, publish, published) tested
- [ ] ✅ E2E tests: Full user flows work end-to-end
- [ ] ✅ Frontend: All routes protected, JWT stored/sent automatically
- [ ] ✅ Backend: All responses follow { data, message } format
- [ ] ✅ Database: User + Course models with proper relations and migrations
- [ ] ✅ Security: Passwords hashed, JWT tokens validated, ownership checks enforced
- [ ] ✅ Performance: Login < 200ms, list < 5s, token valid 1 day
- [ ] ✅ Documentation: DEVELOPMENT.md, API.md, README files created

---

## Implementation Status

| Phase | Status | Tasks | Completion |
|-------|--------|-------|-----------|
| Phase 1: Setup | Not Started | T001-T010 | 0/10 |
| Phase 2: Foundational | Not Started | T011-T025 | 0/15 |
| Phase 3: US0 Auth | Not Started | T026-T045 | 0/20 |
| Phase 4: US1 CRUD | Not Started | T046-T059 | 0/14 |
| Phase 5: US2 Read | Not Started | T060-T066 | 0/7 |
| Phase 6: US3 Publish | Not Started | T067-T071 | 0/5 |
| Phase 7: Testing & Polish | Not Started | T072-T090 | 0/19 |
| **TOTAL** | **Not Started** | **T001-T090** | **0/90** |

---

**Generated**: 2026-02-16 from plan.md + spec.md
**Feature Branch**: `001-khoa-hoc`
**Next Step**: Begin Phase 1 setup tasks (or Phase 3 if infrastructure already exists)
