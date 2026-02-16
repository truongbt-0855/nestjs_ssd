# Implementation Plan: Quản lý khóa học với JWT Authentication

**Branch**: `001-khoa-hoc` | **Date**: 2026-02-16 | **Status**: Updated with JWT Auth Requirements  
**Spec**: [spec.md](spec.md) | **Updated**: Added comprehensive JWT authentication requirements

---

## Executive Summary

Hệ thống quản lý khóa học với xác thực JWT đầy đủ, giảng viên tạo/sửa/xóa khóa học, học viên xem khóa học xuất bản. Backend: NestJS + Prisma + PostgreSQL; Frontend: React (Vite) + Tailwind + TanStack Query.

**Key Features**:
- ✅ JWT Authentication (register/login)
- ✅ Role-based access control (INSTRUCTOR/STUDENT)
- ✅ Course CRUD with ownership validation
- ✅ Publish/Unpublish toggle
- ✅ Token refresh & expiration (1 day)
- ✅ Password hashing (bcrypt)

---

## Technical Foundation

### Stack Decisions
| Layer | Technology | Version | Why |
|-------|-----------|---------|-----|
| **Backend** | NestJS | 10+ | Modular, TypeScript, built-in auth support |
| **Database** | PostgreSQL | 15-alpine | UUID support, reliable, scalable |
| **ORM** | Prisma | 6.6.0 | Type-safe, migrations, seed support |
| **Frontend** | React | 18+ | Component-based, hooks, large ecosystem |
| **Frontend Build** | Vite | 8+ | Fast HMR, modern bundler |
| **Styling** | Tailwind CSS | v4 | Utility-first, @import syntax |
| **State Mgmt** | TanStack Query | v5 | Powerful caching, sync with server |
| **Auth** | JWT (HS256) | - | Stateless, scalable, industry standard |
| **Password** | bcrypt | 10+ rounds | Secure hashing with salt, slow by design |
| **Testing** | Jest | 29+ | Excellent TypeScript support |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Vite)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ LoginPage    │  │ AdminPages   │  │ StudentPages │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                  │                  │               │
│  ┌──────────────────────────────────────────────────┐        │
│  │         useQuery / useMutation (TanStack)        │        │
│  │  ┌────────────────────────────────────────────┐  │        │
│  │  │    auth.service.ts  (login/register)      │  │        │
│  │  │    course.service.ts (CRUD, publish)      │  │        │
│  │  └────────────────────────────────────────────┘  │        │
│  └──────────── JWT token in localStorage ──────────┘        │
└──────────────────┬─────────────────────────────────────────┘
                   │ Authorization: Bearer <token>
                   │ Content-Type: application/json
┌──────────────────▼─────────────────────────────────────────┐
│                  Backend (NestJS)                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │              AuthModule                            │    │
│  │  ├─ auth.controller.ts  (POST /auth/login)        │    │
│  │  │                       (POST /auth/register)     │    │
│  │  ├─ auth.service.ts (JWT generation, bcrypt)      │    │
│  │  ├─ jwt.strategy.ts (Token validation)            │    │
│  │  └─ jwt-auth.guard.ts (Endpoint protection)       │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │              CourseModule                          │    │
│  │  ├─ course.controller.ts (CRUD, publish)          │    │
│  │  ├─ course.service.ts (Business logic, ownership) │    │
│  │  ├─ dto/ (CreateCourse, UpdateCourse)             │    │
│  │  └─ course.module.ts                              │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Shared Services                            │    │
│  │  ├─ prisma.service.ts (DB access)                 │    │
│  │  └─ middleware/ (API response format)             │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────┬─────────────────────────────────────────┘
                   │
┌──────────────────▼─────────────────────────────────────────┐
│              PostgreSQL Database                            │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ users            │  │ courses          │               │
│  ├─ id (UUID)       │  ├─ id (UUID)       │               │
│  ├─ email (unique)  │  ├─ title           │               │
│  ├─ password        │  ├─ description     │               │
│  ├─ name            │  ├─ status (ENUM)   │               │
│  ├─ role (ENUM)     │  ├─ ownerId (FK)    │               │
│  └─ timestamps      │  └─ timestamps      │               │
│  └──────────────────┘  └──────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 0: Research & Analysis

**Goal**: Resolve all unknowns, validate technical decisions

#### Research Topics

1. **JWT Token Lifecycle in NestJS**
   - Best practices for JWT configuration in NestJS
   - Token refresh strategies (1-day expiration)
   - Error handling for expired/invalid tokens
   
2. **Password Security**
   - bcrypt salting rounds (10+ recommended)
   - Password validation strategies
   - Secure password storage patterns

3. **JWT Claims Best Practices**
   - What to include in token: `sub` (user ID), `role` (INSTRUCTOR/STUDENT)
   - Token size optimization
   - Security implications of token claims

4. **Frontend Token Management**
   - Secure localStorage usage for JWT
   - Token expiration handling on client
   - Automatic token refresh before expiration
   - XSS prevention (httpOnly cookies vs localStorage)

5. **CORS & Security**
   - CORS configuration for JWT-based APIs
   - CSRF protection strategies
   - Rate limiting for auth endpoints

6. **Testing JWT Authentication**
   - Unit testing JWT generation/validation
   - Integration testing protected endpoints
   - E2E testing login flows

---

### Phase 1: Design & Contracts

#### 1.1 Data Model (data-model.md)

**User Entity**:
```typescript
model User {
  id        String    @id @default(uuid())
  email     String    @unique
  password  String    // bcrypt hash
  name      String
  role      Role      // ENUM: INSTRUCTOR, STUDENT
  courses   Course[]  // relation
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

enum Role {
  INSTRUCTOR
  STUDENT
}
```

**Course Entity**:
```typescript
model Course {
  id          String        @id @default(uuid())
  title       String
  description String
  status      CourseStatus  // ENUM: DRAFT, PUBLISHED
  owner       User          @relation(fields: [ownerId], references: [id])
  ownerId     String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

enum CourseStatus {
  DRAFT
  PUBLISHED
}
```

#### 1.2 API Contracts (contracts/)

**Authentication Endpoints**:
```
POST /auth/register
├─ Body: { email, password, name, role }
├─ Response 201: { data: { id, email, name, role }, message: "User created" }
└─ Response 400: { message: "Email already exists" }

POST /auth/login
├─ Body: { email, password }
├─ Response 200: { 
│     data: { 
│       access_token: "JWT...",
│       user: { id, email, name, role }
│     },
│     message: "Login successful" 
│   }
└─ Response 401: { message: "Invalid credentials" }
```

**Course Endpoints**:
```
POST /courses
├─ Auth: Required (INSTRUCTOR only)
├─ Body: { title, description }
└─ Response 201: { data: { id, title, description, status, ownerId }, message: "Course created" }

GET /courses
├─ Auth: Required
└─ Response 200: { data: [{ id, title, ..., ownerId }], message: "Courses retrieved" }

GET /courses/published
├─ Auth: Optional (public or STUDENT)
└─ Response 200: { data: [{ id, title, description, ... }], message: "Published courses" }

PATCH /courses/:id/publish
├─ Auth: Required (INSTRUCTOR, ownership check)
└─ Response 200: { data: { id, status: "PUBLISHED" }, message: "Course published" }

PATCH /courses/:id/unpublish
├─ Auth: Required (INSTRUCTOR, ownership check)
└─ Response 200: { data: { id, status: "DRAFT" }, message: "Course unpublished" }
```

#### 1.3 Frontend Integration Points

**auth.service.ts**:
- `register(email, password, name, role): Promise<User>`
- `login(email, password): Promise<{token, user}>`
- `logout(): void`
- `getCurrentUser(): User | null`
- `getToken(): string | null`
- `isAuthenticated(): boolean`
- `isInstructor(): boolean`

**course.service.ts** (extend existing):
- `publish(courseId: string): Promise<Course>`
- `unpublish(courseId: string): Promise<Course>`

**ProtectedRoute Component**:
- Redirects to `/login` if `!isAuthenticated()`
- Checks role for role-based route protection

#### 1.4 Quickstart Implementation (quickstart.md)

**Quick Integration Steps**:
1. Setup JWT module in NestJS
2. Create User + Course models in Prisma
3. Run `npm run prisma:migrate`
4. Implement auth endpoints
5. Add JWT guards to course endpoints
6. Create LoginPage + auth service in frontend
7. Setup token storage in localStorage
8. Add token to request headers via axios interceptor

---

### Phase 2: Implementation Tasks

#### Backend Tasks (T001-T015)

**Authentication Module**:
- [ ] T001 `AuthModule` setup with JWT config
- [ ] T002 `User` model in Prisma (email, password, role, timestamps)
- [ ] T003 `auth.controller.ts` (POST /register, POST /login)
- [ ] T004 `auth.service.ts` (bcrypt hashing, JWT generation, validation)
- [ ] T005 `JwtStrategy` for password validation
- [ ] T006 `JwtAuthGuard` for endpoint protection
- [ ] T007 `CurrentUser` decorator to extract user from token
- [ ] T008 Add auth endpoints to E2E/integration tests

**Course Module Updates**:
- [ ] T009 Add role check guards (InstructorOnly)
- [ ] T010 Add ownership validation in service
- [ ] T011 Implement publish/unpublish endpoints
- [ ] T012 Update course routes to require JWT

#### Frontend Tasks (T016-T024)

**Authentication UI/Logic**:
- [ ] T016 Create `LoginPage.tsx`
- [ ] T017 Create `RegisterPage.tsx`
- [ ] T018 `auth.service.ts` (login, register, logout, token management)
- [ ] T019 `ProtectedRoute` component
- [ ] T020 Setup axios interceptor to add JWT to requests
- [ ] T021 Update `App.tsx` routing with login/register/protected routes
- [ ] T022 Add token expiration handling + auto-logout
- [ ] T023 Add logout button in navbar
- [ ] T024 Handle 401 errors globally

#### Testing Tasks (T025-T030)

- [ ] T025 Unit tests for JWT generation/validation
- [ ] T026 Unit tests for bcrypt hashing
- [ ] T027 Integration tests for /auth/login endpoint
- [ ] T028 Integration tests for protected course endpoints
- [ ] T029 E2E tests for full login → create course flow
- [ ] T030 E2E tests for student role accessing instructor endpoints (should fail)

---

## Technical Details

### JWT Token Configuration

```typescript
// NestJS JWT Module Config
JwtModule.register({
  secret: process.env.JWT_SECRET || 'dev-secret-key',
  signOptions: {
    expiresIn: '1d',  // 1 day = 86400 seconds
    algorithm: 'HS256'
  }
})

// Token payload structure
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",  // user ID
  "role": "INSTRUCTOR",
  "iat": 1676500000,   // issued at
  "exp": 1676586400    // expires at (1d later)
}
```

### Password Hashing

```typescript
// Frontend → Backend (HTTPS)
POST /auth/login
{ "email": "user@example.com", "password": "plaintext123" }

// Backend
bcrypt.hash(plaintext, 10) → "$2b$10$..."

// Validation
bcrypt.compare(inputPassword, storedHash) → true/false
```

### Request/Response Flow

```typescript
// Login Request
POST /auth/login
Content-Type: application/json
{ email: "instructor@example.com", password: "password" }

// Login Response
200 OK
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-...",
      "email": "instructor@example.com",
      "name": "Instructor Name",
      "role": "INSTRUCTOR"
    }
  },
  "message": "Login successful"
}

// Frontend: Save token to localStorage
localStorage.setItem("access_token", response.data.access_token);

// Subsequent Request (with JWT)
GET /courses
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

// Response
200 OK
{
  "data": [{ id: "...", title: "...", ownerId: "..." }],
  "message": "Courses retrieved"
}
```

### Error Handling

```typescript
// 401 Unauthorized (Token Invalid/Expired)
{
  "message": "Unauthorized. Please login again.",
  "error": "Unauthorized",
  "statusCode": 401
}

// 403 Forbidden (Authority Check Failed)
{
  "message": "You don't have permission to modify this course",
  "error": "Forbidden",
  "statusCode": 403
}

// 400 Bad Request (Validation Failed)
{
  "message": "Validation failed",
  "error": ["email must be an email", "password must be at least 8 characters"],
  "statusCode": 400
}
```

---

## Development Environment Setup

### Prerequisites
```bash
Node.js 18+
Docker & Docker Compose
npm 8+
```

### Quick Start

```bash
# 1. Install dependencies
npm install --workspaces

# 2. Setup environment
cp backend/.env.example backend/.env
# Edit backend/.env with:
# DATABASE_URL=postgresql://user:password@localhost:5432/course_db
# JWT_SECRET=your-super-secret-jwt-key-change-in-production

# 3. Start PostgreSQL
docker-compose up -d

# 4. Run migrations
cd backend
npm run prisma:migrate:dev

# 5. Start development servers
# Terminal 1: Backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Environment Variables

**Backend (.env)**:
```
DATABASE_URL=postgresql://user:password@localhost:5432/course_db
JWT_SECRET=super-secret-key-min-32-chars-long
JWT_EXPIRATION=1d
BCRYPT_ROUNDS=10
NODE_ENV=development
```

**Frontend (.env)**:
```
VITE_API_URL=http://localhost:3000
```

---

## Testing Strategy

### Unit Tests
- JWT token generation/validation
- bcrypt hashing verification
- Service business logic

### Integration Tests
- /auth/login endpoint with valid/invalid credentials
- Protected course endpoints with/without token
- Course ownership validation

### E2E Tests
- Full registration → login → course creation flow
- Student role cannot access instructor endpoints
- Token expiration handling

### Test Commands
```bash
# All tests
npm test

# Unit tests only
npm test -- --config jest-unit.json

# Integration tests
npm test -- --config jest-integration.json

# E2E tests (with running servers)
npm run test:e2e
```

---

## Success Criteria Checklist

- [ ] **SC-000**: 100% protected endpoints require valid JWT token
- [ ] **SC-001**: Login response < 200ms
- [ ] **SC-002**: JWT token expires after exactly 1 day
- [ ] **SC-003**: All passwords stored as bcrypt hash (no plaintext)
- [ ] **SC-004**: Login with wrong password returns generic error
- [ ] **SC-005**: STUDENT cannot access /courses/create endpoint
- [ ] **SC-006**: Instructor can only edit own courses (ownership check)
- [ ] **SC-007**: Token automatically stored in localStorage
- [ ] **SC-008**: Token automatically added to all API requests
- [ ] **SC-009**: Expired token triggers redirect to login
- [ ] **SC-010**: Logout removes token from localStorage
- [ ] **SC-011**: 95% successful task completion on first attempt
- [ ] **SC-012**: All API responses follow `{ data, message }` format

---

## Risk Management

| Risk | Impact | Mitigation |
|------|--------|-----------|
| JWT token leaked via XSS | High | Use httpOnly cookies (future), validate input, CSP headers |
| SQL injection via Prisma | High | Prisma parameterized queries prevent this |
| Weak passwords | High | Enforce 8+ char minimum, complexity rules |
| Token not refreshed | Medium | Implement refresh token endpoint (future) |
| CORS misconfiguration | Medium | Whitelist specific origin in production |

---

## Future Enhancements

- [ ] Refresh token rotation mechanism
- [ ] Email verification on registration
- [ ] Password reset flow
- [ ] 2FA (Two-Factor Authentication)
- [ ] OAuth2 social login
- [ ] API rate limiting
- [ ] Request logging & monitoring
- [ ] Token revocation blacklist
- [ ] Role-based API documentation

---

## Document Status

| Document | Status | Location |
|----------|--------|----------|
| Specification | ✅ Complete | [spec.md](spec.md) |
| Plan | ✅ Complete | This file |
| Research | ⏳ Pending | research.md |
| Data Model | ⏳ Pending | data-model.md |
| API Contracts | ⏳ Pending | contracts/ |
| Quickstart | ⏳ Pending | quickstart.md |
| Implementation | 🔄 In Progress | tasks.md + Code |
| Tests | 🔄 In Progress | tests/ |

---

**Next Steps**:
1. Generate `research.md` with JWT best practices findings
2. Create `data-model.md` with final entity definitions
3. Define API contracts in `contracts/` directory
4. Create `quickstart.md` with step-by-step implementation
5. Begin implementation tasks following task list
