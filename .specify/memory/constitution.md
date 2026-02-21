<!--
Sync Impact Report
- Version change: 0.0.0-template → 1.0.0
- Modified principles:
	- Template Principle 1 → I. NestJS Module-First Architecture
	- Template Principle 2 → II. Prisma + PostgreSQL Only
	- Template Principle 3 → III. Strict TypeScript API Contracts
	- Template Principle 4 → IV. Monetary Safety via Interactive Transactions
	- Template Principle 5 → V. Centralized Error Handling & SSR UI Discipline
- Added sections:
	- Technical Standards & Constraints
	- Development Workflow & Quality Gates
- Removed sections:
	- None
- Templates requiring updates:
	- ✅ .specify/templates/plan-template.md
	- ✅ .specify/templates/spec-template.md
	- ✅ .specify/templates/tasks-template.md
	- ⚠ pending: .specify/templates/commands/*.md (directory not present)
	- ⚠ pending: README.md, docs/quickstart.md (files not present)
- Follow-up TODOs:
	- None
-->

# NestJS SSD Constitution

## Core Principles

### I. NestJS Module-First Architecture
Mọi backend service MUST được tổ chức theo kiến trúc module-based của NestJS. Tính năng mới
MUST được đặt trong module rõ ràng (controller, service, provider, DTO liên quan), không dùng
cấu trúc file phẳng hoặc trộn tầng kiến trúc. Rationale: module boundary tạo khả năng mở rộng,
kiểm thử độc lập, và giảm coupling giữa miền nghiệp vụ.

### II. Prisma + PostgreSQL Only
Tầng truy cập dữ liệu MUST chỉ dùng Prisma với PostgreSQL. TypeORM, Sequelize, hoặc ORM/driver
thay thế cho domain persistence MUST NOT được đưa vào codebase. Rationale: đồng nhất công cụ
tránh phân mảnh migration/runtime behavior và đơn giản hóa vận hành.

### III. Strict TypeScript API Contracts
Codebase MUST chạy ở chế độ Strict TypeScript. Mọi API endpoint MUST dùng DTO cho input/output,
và chữ ký service/controller async MUST khai báo kiểu trả về tường minh dạng Promise<T>.
Rationale: hợp đồng kiểu chặt giúp phát hiện lỗi sớm và giữ API nhất quán giữa các team.

### IV. Monetary Safety via Interactive Transactions
Mọi nghiệp vụ tiền tệ/thanh toán MUST thực thi trong Prisma Interactive Transactions; cập nhật
số dư, trạng thái thanh toán, và ledger liên quan MUST nằm trong cùng transaction scope. Bất kỳ
flow tiền tệ nào không dùng interactive transaction được xem là vi phạm nghiêm trọng. Rationale:
đảm bảo tính nguyên tử và nhất quán dữ liệu tài chính.

### V. Centralized Error Handling & SSR UI Discipline
Toàn bộ lỗi ứng dụng backend MUST đi qua ExceptionFilter tập trung; controller MUST NOT chứa
try-catch tùy tiện để nuốt hoặc phân tán xử lý lỗi. Ở frontend, style MUST dùng Tailwind CSS;
nếu dùng Next.js thì rendering strategy MUST dùng Server Side Rendering cho các trang nghiệp vụ.
Rationale: xử lý lỗi tập trung tăng khả năng quan sát, còn SSR + Tailwind giữ UX nhất quán và
đáp ứng yêu cầu kiến trúc hiển thị.

## Technical Standards & Constraints

- Backend framework MUST là NestJS và theo module boundary rõ ràng theo domain.
- Data access MUST dùng Prisma schema, migration, và client thống nhất trong backend.
- Mọi endpoint MUST có DTO class riêng cho request/response khi có payload.
- Service methods bất đồng bộ MUST khai báo Promise<T> tường minh, không để inferred any.
- Các giao dịch thanh toán MUST có test chứng minh rollback khi lỗi giữa chừng.
- Frontend MUST dùng Tailwind tokens/config hiện hữu; không trộn framework CSS khác.
- Với Next.js, trang cần dữ liệu thời gian thực nghiệp vụ MUST dùng SSR thay vì chỉ CSR.

## Development Workflow & Quality Gates

- Plan/Spec/Tasks MUST chứa mục kiểm tra tuân thủ 5 nguyên tắc cốt lõi trước khi implement.
- Pull request MUST nêu rõ module bị tác động, DTO thêm/sửa, và transaction boundary nếu có tiền.
- Code review MUST từ chối thay đổi vi phạm ORM policy, transaction policy, hoặc error policy.
- Trước merge, nhóm phát triển MUST xác nhận backend errors đi qua ExceptionFilter và type strict
	không bị nới lỏng trong tsconfig.
- Mọi exception đối với hiến pháp MUST được ghi thành amendment, không xử lý bằng thỏa thuận miệng.

## Governance

Constitution này có hiệu lực cao hơn các hướng dẫn phát triển khác trong repository. Đề xuất sửa
đổi MUST đi kèm phạm vi ảnh hưởng, lý do nghiệp vụ/kỹ thuật, và kế hoạch chuyển đổi.

- Amendment Process: thay đổi MUST được phê duyệt qua PR có ít nhất 1 reviewer chịu trách nhiệm
	kiến trúc backend và 1 reviewer chịu trách nhiệm dữ liệu nếu liên quan persistence/tài chính.
- Versioning Policy (SemVer):
	- MAJOR khi xóa/định nghĩa lại nguyên tắc theo cách không tương thích ngược.
	- MINOR khi thêm nguyên tắc hoặc mở rộng bắt buộc làm thay đổi quy trình thực thi.
	- PATCH khi chỉ làm rõ câu chữ, sửa diễn đạt, hoặc chỉnh phi ngữ nghĩa.
- Compliance Review: mọi PR MUST có checklist tuân thủ hiến pháp; release review định kỳ MUST
	kiểm tra ngẫu nhiên module backend, Prisma transaction flow, DTO coverage, và ExceptionFilter.

**Version**: 1.0.0 | **Ratified**: 2026-02-21 | **Last Amended**: 2026-02-21
