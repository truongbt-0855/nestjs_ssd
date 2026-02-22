# Test Report - 2026-02-22

## Scope
- Infrastructure startup and database readiness
- API business flow: auth, create course, purchase, duplicate purchase, my-courses, wallet, admin revenue
- Authorization guards by role
- Frontend route reachability

## Environment
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Docker services: PostgreSQL + Redis (running)

## Executed Checks

### 1) Route reachability
- `GET /swagger` -> `200`
- `GET /` (frontend) -> `200`
- `GET /student/courses` -> `200`
- `GET /student/my-courses` -> `200`

### 2) Core API flow
- `POST /auth/login` (admin/instructor/student) -> `201`
- `POST /courses` (instructor) -> `201`
- `POST /orders/purchase` (student) -> `201`
- Duplicate `POST /orders/purchase` same course -> `201`, message contains `đã sở hữu`
- `GET /users/my-courses` includes just-purchased course -> PASS
- `GET /users/me` wallet balance decremented exactly by course price -> PASS
- `GET /admin/revenue` totalRevenue/totalOrders increased after purchase -> PASS

### 3) Authorization guards
- Student create course -> `403`
- Instructor access admin revenue -> `403`
- Instructor purchase course endpoint -> `403`
- Anonymous access `GET /users/my-courses` -> `401`
- Admin access `GET /admin/revenue` -> `200`

## Bugs/Issues Found
1. Intermittent Prisma engine file lock on Windows (`EPERM rename query_engine...`) during generate/migrate.
2. Seed-data mismatch for happy-path purchase: student balance `1000` while seed course prices are `199000` and `299000`.

## Conclusion
- Core functional flows pass under valid balance conditions.
- Access-control guards behave correctly.
- Two environment/data-quality issues should be tracked for smoother local QA.

## Follow-up Fix Verification
- Applied Prisma safe runner (`backend/scripts/prisma-safe-runner.cjs`) and wired into backend `db:*` scripts.
- Re-ran `db:generate`/`db:migrate`/`db:seed`: Prisma lock issue now auto-retries/recovery and succeeds in observed run.
- Updated student seed wallet to `1000000` and verified purchase of `seed-course-nest-basic` succeeds.
- Side effect observed: during heavy lock recovery on Windows, runner may terminate other Node processes, so FE/BE dev servers might need restart.

## Full Sweep Re-Run (same day)

### Compile / Build Checks
- Backend TypeScript check: `npx tsc -p backend/tsconfig.json --noEmit` -> PASS
- Frontend production build: `npm run build -w frontend` -> PASS

### Runtime Route Checks
- Backend Swagger route `GET /swagger` -> `200`
- Frontend routes:
	- `/` -> `200`
	- `/student/courses` -> `200`
	- `/student/my-courses` -> `200`
	- `/instructor/courses` -> `200`

### API Full Smoke Checks
- PASS auth login 3 roles
- PASS student profile available
- PASS instructor create published course
- PASS student cannot create course
- PASS student purchase course
- PASS duplicate purchase guarded
- PASS my-courses includes purchased item
- PASS wallet decremented correctly
- PASS admin revenue endpoint ok
- PASS admin revenue guarded by role

### Additional Issue Observed During Sweep
- During lock recovery flow, frontend dev server was temporarily down and required restart before route checks.

## Stress Sweep (extended)

### API Stress
- Executed repeated business-flow smoke for 15 loops (create course + purchase + duplicate guard + ownership + wallet assertion + role guard).
- Result: `PASSED=15`, `FAILED=0`.

### Prisma Generate Stress
- Executed `db:generate` in loop (8 consecutive runs).
- Result: all 8 runs succeeded.

### Post-Stress Runtime Check
- At one point after stress phase, FE/BE were not reachable and had to be restarted.
- After restart:
	- `/swagger`, `/`, `/student/courses`, `/student/my-courses`, `/instructor/courses` all returned `200`.
	- quick smoke (`create + purchase`) passed.
