
# Feature Specification: Quản lý khóa học đơn giản

**Feature Branch**: `001-khoa-hoc`  
**Created**: 2026-02-15  
**Status**: Draft  
**Input**: User description: "Hệ thống quản lý khóa học đơn giản: cho phép giảng viên tạo, sửa, xóa khóa học; học viên có thể xem danh sách khóa học đã xuất bản"

## User Scenarios & Testing *(mandatory)*

**Constitution Compliance:**
- Backend user stories MUST target NestJS modules, Prisma, and PostgreSQL.
- Frontend user stories MUST target React (Vite), Tailwind CSS, and TanStack Query.
- Folder structure and naming conventions MUST be followed (see constitution).

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->



### User Story 0 - User Registration & Login with JWT (Priority: Priority: P0)

Người dùng (giảng viên/học viên) có thể đăng ký tài khoản mới và đăng nhập vào hệ thống bằng email/mật khẩu, nhận JWT token để sử dụng các chức năng phù hợp với vai trò.

**Why this priority**: Đăng nhập với JWT là điều kiện tiên quyết để phân quyền dựa trên role (INSTRUCTOR/STUDENT) và bảo vệ dữ liệu, đảm bảo chỉ người dùng hợp lệ mới truy cập được chức năng quản lý hoặc xem khóa học.

**Independent Test**: 
- Người dùng đăng ký tài khoản mới thành công
- Đăng nhập thành công với tài khoản hợp lệ nhận được JWT token
- Thất bại với tài khoản/mật khẩu sai
- Sử dụng JWT token để truy cập endpoints bảo vệ
- Token hết hạn hoặc không hợp lệ bị từ chối truy cập

**Acceptance Scenarios**:
1. **Given** người dùng chưa có tài khoản, **When** đăng ký với email/mật khẩu/role, **Then** tài khoản được tạo thành công.
2. **Given** người dùng có tài khoản hợp lệ, **When** đăng nhập, **Then** nhận được JWT token có thể dùng để truy cập các chức năng phù hợp với vai trò.
3. **Given** người dùng nhập sai email hoặc mật khẩu, **When** đăng nhập, **Then** nhận được thông báo lỗi "Invalid credentials".
4. **Given** token JWT hợp lệ, **When** gửi request kèm `Authorization: Bearer <token>`, **Then** API trả về dữ liệu đúng theo vai trò.
5. **Given** token JWT không hợp lệ/hết hạn, **When** gửi request, **Then** API từ chối với mã 401 Unauthorized.
6. **Given** chưa đăng nhập (không có token), **When** truy cập endpoint bảo vệ, **Then** bị chuyển hướng tới trang login hoặc trả về 401.

Giảng viên có thể tạo mới, chỉnh sửa, và xóa khóa học của mình thông qua giao diện quản trị.

**Why this priority**: Đây là chức năng cốt lõi để hệ thống có thể có dữ liệu khóa học và phục vụ mục tiêu quản lý.

**Independent Test**: Đăng nhập với vai trò giảng viên, thực hiện tạo, sửa, xóa một khóa học và xác nhận thay đổi xuất hiện trong danh sách quản trị.

**Acceptance Scenarios**:
1. **Given** giảng viên đăng nhập, **When** tạo khóa học mới, **Then** khóa học xuất hiện trong danh sách quản trị.
2. **Given** giảng viên có khóa học, **When** sửa thông tin khóa học, **Then** thông tin được cập nhật đúng.
3. **Given** giảng viên có khóa học, **When** xóa khóa học, **Then** khóa học không còn trong danh sách.

---


### User Story 2 - Student views published courses (Priority: P2)

Học viên có thể xem danh sách các khóa học đã được xuất bản.

**Why this priority**: Đây là chức năng chính để học viên tiếp cận thông tin khóa học, phục vụ mục tiêu sử dụng hệ thống.

**Independent Test**: Truy cập giao diện học viên, xác nhận hiển thị đúng danh sách các khóa học đã xuất bản.

**Acceptance Scenarios**:
1. **Given** có các khóa học đã xuất bản, **When** học viên truy cập trang danh sách, **Then** hiển thị đầy đủ thông tin các khóa học này.

---


### User Story 3 - (Dự phòng) Quản lý trạng thái xuất bản (Priority: P3)

Giảng viên có thể chuyển đổi trạng thái xuất bản của khóa học (bật/tắt xuất bản).

**Why this priority**: Tăng tính kiểm soát cho giảng viên, giúp ẩn/hiện khóa học với học viên khi cần.

**Independent Test**: Giảng viên thay đổi trạng thái xuất bản, học viên chỉ nhìn thấy các khóa học đang ở trạng thái xuất bản.

**Acceptance Scenarios**:
1. **Given** giảng viên có khóa học, **When** chuyển sang trạng thái "đã xuất bản", **Then** học viên nhìn thấy khóa học đó.
2. **Given** giảng viên có khóa học, **When** chuyển sang trạng thái "chưa xuất bản", **Then** học viên không nhìn thấy khóa học đó.

---

[Add more user stories as needed, each with an assigned priority]


### Edge Cases
- Nếu giảng viên xóa khóa học đang ở trạng thái xuất bản, học viên sẽ không còn nhìn thấy khóa học đó.
- Nếu không có khóa học nào được xuất bản, học viên sẽ thấy thông báo phù hợp.
- Nếu giảng viên cố sửa/xóa khóa học không thuộc quyền sở hữu, hệ thống phải từ chối.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->



### Functional Requirements

#### Authentication & Authorization (JWT)
- **FR-000**: Hệ thống phải cung cấp endpoint đăng ký tài khoản mới với email, mật khẩu, và role (INSTRUCTOR/STUDENT).
- **FR-001**: Hệ thống phải cung cấp endpoint đăng nhập với email/mật khẩu, trả về JWT token nếu thành công.
- **FR-002**: JWT token phải chứa thông tin: `sub` (user ID), `role` (INSTRUCTOR/STUDENT), và `expiresIn` (1 ngày).
- **FR-003**: Hệ thống phải xác thực JWT token từ header `Authorization: Bearer <token>` trên tất cả endpoint bảo vệ.
- **FR-004**: Hệ thống phải từ chối request với token không hợp lệ/hết hạn, trả về HTTP 401 Unauthorized.
- **FR-005**: Hệ thống phải kiểm tra role của user trước khi cho phép truy cập endpoint yêu cầu role cụ thể (ví dụ: chỉ INSTRUCTOR mới tạo được khóa học).
- **FR-006**: Mật khẩu người dùng phải được hash trước khi lưu vào database (sử dụng bcrypt).

#### Course Management
- **FR-007**: Hệ thống phải cho phép giảng viên (INSTRUCTOR) tạo mới khóa học.
- **FR-008**: Hệ thống phải cho phép giảng viên sửa thông tin khóa học của mình.
- **FR-009**: Hệ thống phải cho phép giảng viên xóa khóa học của mình.
- **FR-010**: Hệ thống phải cho phép giảng viên chuyển đổi trạng thái xuất bản của khóa học (publish/unpublish).
- **FR-011**: Hệ thống phải cho phép học viên (STUDENT) xem danh sách các khóa học đã xuất bản (status = PUBLISHED).
- **FR-012**: Hệ thống phải kiểm tra quyền sở hữu: giảng viên chỉ có thể sửa/xóa khóa học của mình (khóa học mà họ tạo ra).

#### API Response Format
- **FR-013**: Tất cả API phải trả về dữ liệu theo format chuẩn: `{ "data": <data>, "message": "<success/error message>" }`.
- **FR-014**: Lỗi API không hợp lệ phải trả về HTTP status code thích hợp (400, 401, 403, 404, 500, etc.).

#### Database Schema
- **FR-015**: Database sử dụng UUID (v4) làm khóa chính cho tất cả bảng.
- **FR-016**: Bảng `users` phải lưu: id, email (unique), password (hashed), name, role (ENUM: INSTRUCTOR/STUDENT), createdAt, updatedAt.
- **FR-017**: Bảng `courses` phải lưu: id, title, description, status (ENUM: DRAFT/PUBLISHED), ownerId (FK → users), createdAt, updatedAt.


### Key Entities

#### User
Đại diện cho người dùng hệ thống:
- `id` (UUID, primary key)
- `email` (string, unique) - Đăng nhập với email
- `password` (string, hashed with bcrypt) - Mật khẩu được hash
- `name` (string) - Tên người dùng
- `role` (ENUM: INSTRUCTOR | STUDENT) - Vai trò trong hệ thống
- `createdAt` (timestamp) - Thời gian tạo tài khoản
- `updatedAt` (timestamp) - Thời gian cập nhật cuối cùng

#### Course
Đại diện cho một khóa học:
- `id` (UUID, primary key)
- `title` (string) - Tên khóa học
- `description` (string) - Mô tả chi tiết khóa học
- `status` (ENUM: DRAFT | PUBLISHED) - Trạng thái xuất bản
  - DRAFT: Chưa xuất bản, chỉ giảng viên thấy
  - PUBLISHED: Đã xuất bản, học viên có thể xem
- `ownerId` (UUID, FK → users) - ID giảng viên tạo khóa học
- `createdAt` (timestamp) - Ngày tạo
- `updatedAt` (timestamp) - Ngày cập nhật cuối

#### JWT Token
Cấu trúc JWT token sau khi đăng nhập:
- `sub` (string) - User ID
- `role` (string) - Vai trò: INSTRUCTOR hoặc STUDENT
- `iat` (number) - Issued at timestamp
- `exp` (number) - Expiration timestamp (1 ngày sau iat)

Ví dụ payload:
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "role": "INSTRUCTOR",
  "iat": 1676500000,
  "exp": 1676586400
}
```

#### Login Response
Phản hồi từ endpoint `/auth/login`:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "instructor@example.com",
    "name": "Instructor Name",
    "role": "INSTRUCTOR"
  }
}
```

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->



### Measurable Outcomes

#### Authentication & Security
- **SC-000**: 100% request tới endpoint bảo vệ đều yêu cầu header `Authorization` chứa JWT token hợp lệ; request không có token hoặc token không hợp lệ bị từ chối (401 Unauthorized).
- **SC-001**: Đăng nhập thành công nhận được JWT token trong 200ms.
- **SC-002**: JWT token hết hạn sau đúng 1 ngày (86400 giây) từ lúc phát hành.
- **SC-003**: 100% mật khẩu người dùng được hash trước khi lưu, không lưu plain text.
- **SC-004**: Đăng nhập với mật khẩu sai bị từ chối ngay lập tức với thông báo lỗi generic (không bộc lộ thông tin người dùng).

#### Authorization (Role-Based Access Control)
- **SC-005**: 100% endpoint yêu cầu INSTRUCTOR (create/update/delete/publish) bị từ chối nếu user có role STUDENT.
- **SC-006**: 100% endpoint yêu cầu STUDENT logic (xem published courses) bị từ chối nếu user chưa đăng nhập.
- **SC-007**: Giảng viên chỉ có thể sửa/xóa/publish khóa học của mình (quyền sở hữu); cố gắng sửa khóa học của người khác bị từ chối (403 Forbidden).

#### Course Management Performance
- **SC-008**: Giảng viên có thể tạo/sửa/xóa khóa học thành công trong vòng 1 phút cho mỗi thao tác.
- **SC-009**: Học viên luôn nhìn thấy danh sách khóa học đã xuất bản đúng với trạng thái thực tế (không trễ quá 5 giây sau khi thay đổi trạng thái xuất bản).
- **SC-010**: 100% thao tác không hợp lệ (ví dụ: sửa/xóa khóa học không thuộc quyền sở hữu, gửi dữ liệu không hợp lệ) đều bị từ chối với thông báo lỗi rõ ràng.
- **SC-011**: 95% người dùng thực hiện thành công các thao tác chính ngay lần thử đầu tiên.

#### User Experience
- **SC-012**: Frontend tự động lưu JWT token vào localStorage sau khi đăng nhập thành công.
- **SC-013**: Frontend tự động gửi JWT token trong header `Authorization` cho tất cả request API.
- **SC-014**: Frontend tự động chuyển hướng người dùng tới trang login nếu token hết hạn hoặc không hợp lệ.
- **SC-015**: Đăng xuất xóa JWT token khỏi localStorage, người dùng trở lại trạng thái chưa đăng nhập.
