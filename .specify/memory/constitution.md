
# Hiến pháp Dự án: Hệ thống Quản lý Khóa học

<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0
- Modified principles: Backend/Frontend standards, Coding standards, System rules (expanded, clarified, and localized)
- Added sections: Công nghệ cốt lõi, Tiêu chuẩn lập trình, Quy tắc hệ thống
- Removed sections: None
- Templates requiring updates: ✅ plan-template.md, ✅ spec-template.md, ✅ tasks-template.md (all remain aligned)
- Follow-up TODOs: RATIFICATION_DATE to be set by project owner
-->

## 1. Công nghệ cốt lõi (Tech Stack)
- **Backend**: NestJS (TypeScript).
- **ORM**: Prisma với PostgreSQL.
- **Frontend**: ReactJS (Vite), Tailwind CSS.
- **Giao tiếp**: REST API, dùng TanStack Query (React Query) cho Frontend.

## 2. Tiêu chuẩn lập trình (Coding Standards)
- **Cấu trúc Backend**: Chia theo Module (Course, User, v.v.). Mỗi module có Controller, Service, Module file riêng.
- **Kiểm soát dữ liệu**: Bắt buộc dùng DTO (Data Transfer Object) và Class Validator để check input API.
- **Cấu trúc Frontend**: Component dạng Functional, sử dụng Hooks. Folder structure rõ ràng: `components`, `hooks`, `services`.

## 3. Quy tắc hệ thống
- Database dùng UUID làm khóa chính.
- Mọi API trả về phải có format chung: `{ "data": ..., "message": "..." }`.

## 4. Quy trình phát triển & Quản trị
- Mọi thay đổi phải qua code review, tuân thủ các tiêu chuẩn trên.
- Tài liệu phải được cập nhật cho cả backend và frontend.
- Tính năng mới/bugfix phải làm trên branch riêng, merge qua pull request, CI phải pass.
- Hiến pháp này có hiệu lực cao nhất, mọi sửa đổi cần được ghi nhận, phê duyệt và có kế hoạch chuyển đổi nếu cần.

**Version**: 1.1.0 | **Ratified**: TODO(RATIFICATION_DATE): Set by project owner | **Last Amended**: 2026-02-15
