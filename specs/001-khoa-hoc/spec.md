
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


### User Story 1 - Instructor manages courses (Priority: P1)

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
- **FR-001**: Hệ thống phải cho phép giảng viên tạo mới khóa học.
- **FR-002**: Hệ thống phải cho phép giảng viên sửa thông tin khóa học của mình.
- **FR-003**: Hệ thống phải cho phép giảng viên xóa khóa học của mình.
- **FR-004**: Hệ thống phải cho phép giảng viên chuyển đổi trạng thái xuất bản của khóa học.
- **FR-005**: Hệ thống phải cho phép học viên xem danh sách các khóa học đã xuất bản.
- **FR-006**: Tất cả API trả về dữ liệu theo format `{ "data": ..., "message": "..." }`.
- **FR-007**: Database sử dụng UUID làm khóa chính cho bảng khóa học.
- **FR-008**: Hệ thống phải kiểm tra quyền sở hữu khi giảng viên thao tác với khóa học.


### Key Entities
- **Course**: Đại diện cho một khóa học, gồm các thuộc tính: id (UUID), title, description, status (published/unpublished), ownerId (giảng viên tạo), createdAt, updatedAt.
- **User**: Đại diện cho người dùng hệ thống, gồm các thuộc tính: id (UUID), name, role (instructor/student), ...

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->


### Measurable Outcomes
- **SC-001**: Giảng viên có thể tạo/sửa/xóa khóa học thành công trong vòng 1 phút cho mỗi thao tác.
- **SC-002**: Học viên luôn nhìn thấy danh sách khóa học đã xuất bản đúng với trạng thái thực tế (không trễ quá 5 giây sau khi thay đổi trạng thái xuất bản).
- **SC-003**: 100% thao tác không hợp lệ (ví dụ: sửa/xóa khóa học không thuộc quyền sở hữu) đều bị từ chối với thông báo rõ ràng.
- **SC-004**: 95% người dùng thực hiện thành công các thao tác chính ngay lần thử đầu tiên.
