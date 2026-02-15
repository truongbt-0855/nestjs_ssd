
# Implementation Plan: Quản lý khóa học đơn giản

**Branch**: `001-khoa-hoc` | **Date**: 2026-02-15 | **Spec**: [specs/001-khoa-hoc/spec.md](specs/001-khoa-hoc/spec.md)
**Input**: Feature specification from `/specs/001-khoa-hoc/spec.md`


Hệ thống quản lý khóa học cho phép người dùng đăng nhập (giảng viên/học viên), giảng viên tạo/sửa/xóa khóa học, học viên xem danh sách khóa học đã xuất bản. Backend sử dụng NestJS (TypeScript), Prisma, PostgreSQL; frontend dùng React (Vite), Tailwind CSS, TanStack Query. Kiến trúc chia module rõ ràng (có module auth cho login), API trả về format chuẩn, kiểm soát quyền sở hữu và trạng thái xuất bản.


## Technical Context

**Language/Version**: TypeScript (NestJS 10+), React 18+, Node.js 18+
**Primary Dependencies**: NestJS, Prisma, PostgreSQL, React, Vite, Tailwind CSS, TanStack Query, JWT
**Storage**: PostgreSQL (UUID primary key)
**Testing**: Jest (backend), React Testing Library (frontend)
**Target Platform**: Web (modern browsers, Node.js server)
**Project Type**: web (monorepo: backend + frontend)
**Performance Goals**: CRUD thao tác < 1s, danh sách khóa học cập nhật trạng thái xuất bản < 5s
**Constraints**: API trả về format `{ "data": ..., "message": "..." }`, kiểm soát quyền sở hữu, phân quyền instructor/student, tất cả chức năng chính yêu cầu xác thực đăng nhập
**Scale/Scope**: MVP, 2 vai trò (giảng viên, học viên), 1 bảng chính (Course), 1 bảng User, chức năng login/auth, tối đa vài nghìn bản ghi

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

- Backend code MUST use NestJS (strict TypeScript), Prisma, and PostgreSQL.
- Frontend code MUST use React (Vite), Tailwind CSS, and TanStack Query.
- Modular architecture required for backend (each feature as a module).
- Functional components and hooks required for frontend.
- Folder structure MUST separate `backend` and `frontend` (monorepo style).
- Filenames MUST be kebab-case; Classes/Components MUST be PascalCase.
- All code and PRs MUST be reviewed for compliance with these standards.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```


**Structure Decision**: Sử dụng cấu trúc monorepo với hai thư mục chính:
- `backend/`: NestJS, chia module (course, user, auth, ...), có `src/models/`, `src/services/`, `src/api/`, `src/modules/auth/`, `tests/`
- `frontend/`: React (Vite), chia rõ `src/components/`, `src/pages/`, `src/services/`, `src/pages/login/`, `tests/`
Tuân thủ chuẩn đặt tên (kebab-case cho file, PascalCase cho class/component). Module auth (backend) và login UI (frontend) là bắt buộc.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
