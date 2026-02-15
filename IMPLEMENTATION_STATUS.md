# Implementation Status: Quản lý khóa học đơn giản (Course Management System)

**Status**: ✅ **MVP COMPLETE**  
**Date**: February 16, 2026  
**Repository**: 001-khoa-hoc branch

---

## Feature Summary

A simple course management system built with **NestJS** (Backend) and **React/Vite** (Frontend) that enables instructors to manage courses and students to view published courses.

### Tech Stack
- **Backend**: NestJS 10+, Prisma ORM 6.6.0, PostgreSQL 15-alpine
- **Frontend**: React 18+, Vite, TanStack Query v5, Tailwind CSS v4
- **Testing**: Jest, Supertest
- **Authentication**: JWT with role-based access control (Instructor/Student)

---

## Implemented Features

### ✅ User Story 0 - User Authentication (P0)
- [X] User login with email/password
- [X] JWT token generation and validation
- [X] Role-based access control (Instructor/Student)
- [X] Protected routes and endpoints
- Status: **COMPLETE**

### ✅ User Story 1 - Instructor Course Management (P1) - MVP Core
- [X] **Create** new courses with title and description
- [X] **Read** course list (authenticated instructors only)
- [X] **Update** course information (ownership validation)
- [X] **Delete** courses (ownership validation)
- [X] Instructor-only admin dashboard
- [X] Form validation and error handling
- [X] API contract tests (course-crud.spec.ts)
- Status: **COMPLETE**

### ✅ User Story 2 - Student Course Discovery (P2)
- [X] List published courses (public/student access)
- [X] Display course details (title, description, status, dates)
- [X] Loading and empty states
- [X] Error handling
- [X] Integration tests (course-list.spec.ts)
- Status: **COMPLETE**

### ✅ User Story 3 - Manage Publish Status (P3)
- [X] Publish/Unpublish endpoints (PATCH /courses/:id/publish|unpublish)
- [X] Status toggle logic in service layer
- [X] Frontend publish toggle buttons
- [X] Frontend API integration
- [X] UI feedback (loading states, disabled buttons)
- [X] Unit tests (8/8 passing)
- Status: **COMPLETE**

---

## Architecture Overview

### Backend Structure
```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/              # Authentication & JWT
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── strategies/jwt.strategy.ts
│   │   └── course/             # Course management
│   │       ├── course.controller.ts
│   │       ├── course.service.ts
│   │       ├── dto/
│   │       └── course.module.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   └── course.model.ts
│   ├── middleware/
│   │   └── api-response-format.middleware.ts
│   ├── services/
│   │   └── prisma.service.ts
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma           # Database schema
├── tests/
│   ├── unit/course-publish.spec.ts
│   └── integration/course-list.spec.ts
└── jest-unit.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── pages/
│   │   ├── admin/courses/AdminCoursesPage.tsx
│   │   ├── courses/CoursesPage.tsx
│   │   └── HomePage.tsx
│   ├── components/
│   │   ├── CourseList.tsx
│   │   ├── CourseForm.tsx
│   │   └── BaseLayout.tsx
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── course.service.ts
│   ├── App.tsx
│   └── main.tsx
└── tailwind.config.js
```

---

## API Endpoints

### Authentication
- `POST /auth/login` - User login (returns JWT token)
- `POST /auth/register` - User registration

### Course Management (Instructor)
- `POST /courses` - Create course
- `GET /courses` - List user's courses
- `GET /courses/:id` - Get course details
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course
- `PATCH /courses/:id/publish` - Publish course
- `PATCH /courses/:id/unpublish` - Unpublish course

### Course Browsing (Student)
- `GET /courses/published` - List published courses

### Response Format
All endpoints return standardized response:
```json
{
  "data": { /* response data */ },
  "message": "Success/Error message"
}
```

---

## Database Schema

### Users Table
- `id` (UUID, primary key)
- `email` (unique)
- `password` (hashed)
- `name`
- `role` (ENUM: INSTRUCTOR, STUDENT)
- `createdAt`, `updatedAt`

### Courses Table
- `id` (UUID, primary key)
- `title`
- `description`
- `status` (ENUM: DRAFT, PUBLISHED)
- `ownerId` (foreign key → Users)
- `createdAt`, `updatedAt`

---

## Test Coverage

### Unit Tests
- ✅ Course publish/unpublish logic (8/8 passing)
  - Publishing draft courses
  - Unpublishing published courses
  - Ownership validation
  - Error handling
  - State toggle transitions

### Integration Tests
- Course CRUD operations
- Published course listing
- API response format validation

### Test Commands
```bash
# All tests
npm test

# Unit tests only
npm test -- --config jest-unit.json

# Integration tests only
npm test -- --config jest-integration.json
```

---

## Seed Data

Comprehensive test data included via `backend/prisma/seed.ts`:
- **2 Instructors**
  - instructor1@example.com / instructor2@example.com
  - Password: password (use for local testing)
  
- **2 Students**
  - student1@example.com / student2@example.com
  - Password: password (use for local testing)
  
- **7 Courses**
  - 5 Published courses (visible to students)
  - 2 Draft courses (visible to instructor only)
  - Mix of course lengths and topics

**Seed command**:
```bash
npm run seed
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for PostgreSQL)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install --workspaces

# Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start PostgreSQL
docker-compose up -d

# Run database migrations
cd backend && npm run prisma:migrate

# Seed database (optional)
cd backend && npm run seed
```

### Running the Application
```bash
# Terminal 1: Backend (NestJS)
cd backend
npm run start:dev    # Runs on http://localhost:3000

# Terminal 2: Frontend (Vite)
cd frontend
npm run dev          # Runs on http://localhost:5173 (or 5174 if port in use)
```

### Testing
```bash
cd backend
npm test -- --config jest-unit.json   # Unit tests
npm test -- --config jest-integration.json  # Integration tests
```

---

## User Flows

### Instructor Flow
1. Register/Login as Instructor
2. Navigate to "Course Management" dashboard
3. Create course:
   - Click "+ Create New Course"
   - Fill in title & description
   - Save course (auto-sets status to DRAFT)
4. Manage courses:
   - **Edit**: Click "Edit" button, modify details, save
   - **Publish**: Click "Publish" button to make visible to students
   - **Unpublish**: Click "Unpublish" to hide from students
   - **Delete**: Click "Delete" button with confirmation
5. View course list filtered by own courses

### Student Flow
1. Register/Login as Student
2. Navigate to "Browse Courses" page
3. View only PUBLISHED courses
4. See course details (title, description, dates)
5. No ability to create/edit/delete courses

---

## Known Limitations & Future Enhancements

### Current Limitations
- [ ] No course content/materials (future feature)
- [ ] No student enrollment/registration (future feature)
- [ ] No search/filtering (future feature)
- [ ] No pagination (future feature)
- [ ] No course categories/tags (future feature)

### Potential Enhancements
- [ ] E2E tests (Cypress/Playwright)
- [ ] Course enrollment system
- [ ] Student progress tracking
- [ ] Course ratings/reviews
- [ ] Search and filtering
- [ ] Pagination for large course lists
- [ ] Course categories and tags
- [ ] Bulk course operations
- [ ] Export/import courses
- [ ] Analytics dashboard

---

## Development Notes

### Key Design Decisions
1. **UUID for primary keys**: Follows modern best practices for distributed systems
2. **JWT authentication**: Stateless auth suitable for REST APIs
3. **Role-based access control**: Simple but effective authorization model
4. **Service layer ownership checks**: Ensures users can only modify their own data
5. **Standard API response format**: Consistent response structure across all endpoints

### Error Handling
- Ownership validation before all modify operations
- Graceful error messages displayed to users
- Proper HTTP status codes (404 for not found, 403 for forbidden, etc.)

### Code Standards
- TypeScript strict mode enabled
- ESLint + Prettier configured for both backend/frontend
- Consistent naming conventions throughout
- Type-safe DTO validation

---

## Git Commits

Latest commits:
- `ca1f53c` - t028: complete api integration for publish/unpublish
- `9232f72` - t027: add publish/unpublish toggle UI for instructor courses
- `50f5035` - t026: add unit tests for publish/unpublish endpoints (8/8 tests passing)
- (and more in commit history covering T001-T025, T034)

---

## Status Summary

| Phase | Feature | Status | Tests |
|-------|---------|--------|-------|
| Setup | Project Structure | ✅ DONE | N/A |
| Foundation | Auth, Models, Config | ✅ DONE | N/A |
| US1 | Instructor Course Management | ✅ DONE | ✅ Contract Tests |
| US2 | Student View Published | ✅ DONE | ✅ Integration Tests |
| US3 | Publish Status Toggle | ✅ DONE | ✅ 8/8 Unit Tests |
| Polish | Additional Features | 🔄 OPEN | — |

**All MVP requirements COMPLETE and TESTED ✅**

---

## Contact & Support

For questions or issues with the implementation:
1. Check error logs in terminal output
2. Verify database is running: `docker ps | grep postgres`
3. Check API response in browser DevTools network tab
4. Review inline code comments for implementation details
