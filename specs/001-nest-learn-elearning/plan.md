# Implementation Plan: Nest-Learn E-Learning Core

**Branch**: `001-nest-learn-elearning` | **Date**: 2026-02-21 | **Spec**: /specs/001-nest-learn-elearning/spec.md  
**Input**: Feature specification from `/specs/001-nest-learn-elearning/spec.md`

## Summary

Build a monorepo E-Learning system where Backend (NestJS) handles business logic, auth, database access, events, and queue workloads; Frontend (Next.js App Router + Tailwind + Lucide) consumes REST APIs only. Core flows include instructor course publishing, student wallet-based purchase + course access, event-driven post-purchase processing (email/video pipeline), and admin revenue statistics.

## Technical Context

**Language/Version**: TypeScript 5.x (strict)  
**Primary Dependencies**: NestJS, Passport JWT, Prisma, @nestjs/bullmq, @nestjs/event-emitter, Next.js App Router, Tailwind CSS, Lucide Icons  
**Storage**: PostgreSQL (Docker), Redis (Docker)  
**Testing**: Jest (backend), integration/API tests for modules and purchase transaction flow  
**Target Platform**: Web (Node.js backend + browser frontend)  
**Project Type**: Monorepo web application (backend + frontend + optional shared package)  
**Performance Goals**: Purchase completion <60s (p95), cursor pagination stable at high dataset sizes, background job reliability >=99%  
**Constraints**: Prisma + PostgreSQL only; money flow in Prisma Interactive Transaction; centralized ExceptionFilter; REST+Swagger contracts; frontend via API URL from .env  
**Scale/Scope**: 3 seeded roles (Admin/Instructor/Student), course/lesson/order/media/notification/admin dashboard domains

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- `Architecture Gate`: PASS — Backend scoped by NestJS modules per domain.
- `Data Gate`: PASS — Prisma + PostgreSQL only.
- `Typing Gate`: PASS — Strict TypeScript, DTO-first API contracts, Promise<T> signatures.
- `Monetary Safety Gate`: PASS — Order/payment uses Prisma Interactive Transactions.
- `Error Handling Gate`: PASS — Errors routed via ExceptionFilter.
- `Frontend Gate`: PASS — Tailwind styling; Next.js App Router with SSR-capable routes.

## Project Structure

### Documentation (this feature)

```text
specs/001-nest-learn-elearning/
├── plan.md
├── spec.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── courses/
│   │   ├── lessons/
│   │   ├── orders/
│   │   ├── media/
│   │   └── notifications/
│   ├── common/
│   └── prisma/
└── prisma/

frontend/
├── app/
├── components/
├── lib/
└── styles/

packages/
└── shared-types/   # optional DTO/interface sharing

docker-compose.yml  # root-level Postgres + Redis
```

**Structure Decision**: Use monorepo with dedicated `backend` and `frontend` projects and optional `packages/shared-types` for shared contracts.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
