# Feature Specification: Nest-Learn E-Learning Core

**Feature Branch**: `001-nest-learn-elearning`  
**Created**: 2026-02-21  
**Status**: Draft  
**Input**: User description: "Tạo spec cho hệ thống E-Learning tên là Nest-Learn. Instructor đăng khóa học có nhiều bài học video. Student có ví tiền (Balance), mua khóa học sẽ bị trừ tiền và được quyền truy cập bài học. Hệ thống gửi email tự động khi mua hàng và xử lý nén video ngầm. Admin xem thống kê doanh thu. Không cần trang đăng ký, dùng data seed có sẵn cho 3 role: Admin, Instructor, Student"

## User Scenarios & Testing *(mandatory)*

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

### User Story 1 - Student mua khóa học bằng ví và học bài (Priority: P1)

Student xem danh sách khóa học, dùng số dư ví để mua, và sau khi thanh toán thành công có thể truy cập toàn bộ bài học video thuộc khóa học đã mua.

**Why this priority**: Đây là luồng tạo giá trị cốt lõi của hệ thống (chuyển đổi từ người học sang người mua và tiêu thụ nội dung).

**Independent Test**: Có thể kiểm thử độc lập bằng cách đăng nhập tài khoản Student seed, thực hiện mua một khóa học, xác nhận số dư bị trừ đúng, và xác nhận quyền truy cập bài học được mở.

**Acceptance Scenarios**:

1. **Given** Student có số dư ví đủ và chưa sở hữu khóa học, **When** Student xác nhận mua, **Then** hệ thống ghi nhận giao dịch thành công, trừ đúng số dư, và cấp quyền truy cập bài học ngay.
2. **Given** Student có số dư ví không đủ, **When** Student xác nhận mua, **Then** giao dịch bị từ chối, số dư không thay đổi, và không cấp quyền truy cập.
3. **Given** Student đã sở hữu khóa học, **When** Student mở khóa học, **Then** Student truy cập được toàn bộ bài học video mà không cần mua lại.

---

### User Story 2 - Instructor đăng khóa học nhiều video (Priority: P2)

Instructor tạo khóa học mới, thêm nhiều bài học video theo thứ tự, và xuất bản để Student có thể xem/mua.

**Why this priority**: Không có nội dung khóa học thì hệ thống không có sản phẩm để bán; tuy nhiên vẫn xếp sau luồng mua vì P1 là luồng doanh thu trực tiếp.

**Independent Test**: Có thể kiểm thử độc lập bằng tài khoản Instructor seed, tạo khóa học có từ 2 bài học video trở lên, xuất bản và xác nhận khóa học hiển thị trong danh sách có thể mua.

**Acceptance Scenarios**:

1. **Given** Instructor đã đăng nhập, **When** Instructor tạo khóa học và thêm nhiều bài học video hợp lệ, **Then** khóa học được lưu và hiển thị đúng danh sách bài học theo thứ tự.
2. **Given** khóa học có ít nhất một bài học video, **When** Instructor xuất bản khóa học, **Then** khóa học chuyển sang trạng thái có thể mua bởi Student.

---

### User Story 3 - Tự động hóa sau mua và báo cáo doanh thu (Priority: P3)

Sau khi mua thành công, hệ thống tự gửi email xác nhận cho Student và xử lý nén video ngầm để tối ưu phân phối nội dung. Admin xem thống kê doanh thu để theo dõi hoạt động kinh doanh.

**Why this priority**: Đây là nhóm năng lực vận hành và quản trị, quan trọng cho mở rộng nhưng không chặn MVP mua-học.

**Independent Test**: Có thể kiểm thử độc lập bằng giao dịch mua mẫu để xác nhận email tự động được ghi nhận và tác vụ nén video chạy nền; đồng thời đăng nhập Admin xem bảng thống kê doanh thu.

**Acceptance Scenarios**:

1. **Given** giao dịch mua khóa học thành công, **When** hệ thống hoàn tất xử lý giao dịch, **Then** email xác nhận mua được gửi tự động cho Student.
2. **Given** Instructor có bài học video mới, **When** hệ thống tiếp nhận video, **Then** tác vụ nén video được đưa vào xử lý nền và cập nhật trạng thái hoàn tất khi xong.
3. **Given** có dữ liệu giao dịch mua trong hệ thống, **When** Admin mở màn hình thống kê, **Then** Admin xem được tổng doanh thu và doanh thu theo khóa học trong khoảng thời gian được chọn.
4. **Given** giao dịch mua đã được xác nhận thành công, **When** sự kiện mua hoàn tất được phát hành, **Then** luồng gửi email được kích hoạt từ event và không chạy trước khi thanh toán hoàn tất.

---

### Edge Cases

- Student gửi nhiều yêu cầu mua cùng một khóa học trong thời gian rất ngắn: hệ thống chỉ ghi nhận tối đa một giao dịch thành công và không trừ tiền lặp.
- Giao dịch mua thành công nhưng email gửi thất bại tạm thời: quyền truy cập khóa học vẫn được cấp, email được đưa vào cơ chế gửi lại.
- Video nén nền thất bại: bài học giữ trạng thái chưa sẵn sàng chất lượng tối ưu và có thể retry mà không mất metadata bài học.
- Instructor cố xuất bản khóa học không có bài học video hợp lệ: hệ thống từ chối xuất bản và trả thông báo rõ ràng.
- Student đã mua khóa học nhưng video của một bài học chưa nén xong: Student vẫn thấy khóa học đã sở hữu, bài học đó hiển thị trạng thái đang xử lý.
- Dữ liệu danh sách khóa học hoặc giao dịch quá lớn: phân trang phải tiếp tục ổn định bằng cursor, không lặp hoặc bỏ sót bản ghi khi người dùng tải trang kế tiếp.
- Event gửi email bị xử lý lặp do retry: hệ thống phải đảm bảo một giao dịch chỉ gửi tối đa một email xác nhận thành công.
- Frontend cấu hình sai `API_URL` trong `.env`: hệ thống phải trả lỗi rõ ràng ở tầng gọi API và không có cơ chế fallback gọi trực tiếp DB.
- `docker-compose` được chạy từ root nhưng thiếu service dùng chung (Postgres/Redis): môi trường local phải fail-fast với thông báo service thiếu.
- Queue xử lý tác vụ nền bị nghẽn hoặc gián đoạn: tác vụ email/nén video phải có trạng thái theo dõi và cơ chế retry có kiểm soát.
- Token JWT hết hạn hoặc không hợp lệ: mọi API bảo vệ phải từ chối truy cập nhất quán và không rò rỉ dữ liệu.
- Seed migration chạy lại nhiều lần: không tạo trùng 3 tài khoản mẫu và không phá vỡ dữ liệu hiện có.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: Hệ thống MUST cung cấp sẵn dữ liệu seed cho 3 vai trò Admin, Instructor, Student và cho phép dùng trực tiếp dữ liệu đó để sử dụng tính năng.
- **FR-002**: Instructor MUST có thể tạo khóa học, cập nhật thông tin khóa học, và thêm nhiều bài học video cho mỗi khóa.
- **FR-003**: Hệ thống MUST lưu thứ tự bài học trong khóa học và hiển thị đúng thứ tự đó cho người học.
- **FR-004**: Student MUST có ví tiền với số dư hiện tại (Balance) và xem được số dư trước khi mua.
- **FR-005**: Student MUST có thể mua khóa học bằng ví nếu số dư đủ; khi mua thành công hệ thống MUST trừ tiền đúng bằng giá khóa học.
- **FR-006**: Hệ thống MUST từ chối mua khi số dư không đủ và MUST không thay đổi số dư trong trường hợp bị từ chối.
- **FR-007**: Sau giao dịch mua thành công, hệ thống MUST cấp quyền truy cập các bài học của khóa học ngay cho Student.
- **FR-008**: Hệ thống MUST ghi nhận lịch sử giao dịch mua khóa học gồm người mua, khóa học, số tiền, thời gian, và trạng thái giao dịch.
- **FR-009**: Hệ thống MUST tự động gửi email xác nhận cho Student khi giao dịch mua thành công.
- **FR-010**: Hệ thống MUST xử lý nén video ở chế độ nền cho các bài học video và MUST lưu trạng thái xử lý cho từng bài học.
- **FR-011**: Admin MUST xem được thống kê doanh thu tổng quan và doanh thu theo khóa học trong phạm vi thời gian chọn.
- **FR-012**: Hệ thống MUST chỉ cho phép Student truy cập bài học của các khóa học đã sở hữu.
- **FR-013**: Hệ thống MUST đảm bảo mỗi giao dịch mua chỉ được ghi nhận thành công tối đa một lần cho cùng một yêu cầu mua.
- **FR-014**: Hệ thống MUST cung cấp tài liệu Swagger đầy đủ cho toàn bộ REST API endpoint thuộc phạm vi feature.
- **FR-015**: Các endpoint trả danh sách dữ liệu lớn (ví dụ khóa học, bài học, giao dịch) MUST dùng cơ chế phân trang cursor-based.
- **FR-016**: Hệ thống MUST vận hành theo cơ chế event-driven cho hậu xử lý sau thanh toán; chỉ khi thanh toán thành công mới kích hoạt gửi email và các tác vụ liên quan.
- **FR-017**: Hệ thống MUST đảm bảo tính idempotent cho consumer xử lý event hậu thanh toán để tránh xử lý trùng.
- **FR-018**: Toàn bộ hệ thống MUST được tổ chức theo chiến lược monorepo và quản lý đa dự án bằng NPM Workspaces hoặc PNPM Workspaces.
- **FR-019**: Frontend MUST chỉ giao tiếp dữ liệu qua Backend API, MUST NOT truy cập trực tiếp database dưới bất kỳ hình thức nào.
- **FR-020**: Frontend MUST dùng biến môi trường `.env` để cấu hình URL Backend API theo từng môi trường.
- **FR-021**: Hệ thống SHOULD trích xuất DTO hoặc interface dùng chung vào thư mục shared để frontend/backend tái sử dụng khi phù hợp.
- **FR-022**: Hệ thống MUST đặt file `docker-compose.yml` tại root repository để quản lý tập trung Postgres và Redis cho toàn bộ hệ thống.
- **FR-023**: Backend MUST chịu trách nhiệm toàn bộ xử lý logic nghiệp vụ, truy cập database, và điều phối queue cho các tác vụ nền.
- **FR-024**: Frontend MUST chịu trách nhiệm trình bày giao diện người dùng và sử dụng Tailwind CSS cho toàn bộ giao diện trong phạm vi feature.
- **FR-025**: Frontend và Backend MUST giao tiếp qua REST API contracts được mô tả trên Swagger; frontend không dùng kênh giao tiếp dữ liệu nào khác.
- **FR-026**: Backend MUST được xây dựng bằng NestJS, sử dụng Passport JWT cho xác thực API bảo vệ.
- **FR-027**: Backend MUST dùng `@nestjs/bullmq` với Redis cho queue tác vụ nền và dùng `@nestjs/event-emitter` cho phát/nhận sự kiện nội bộ.
- **FR-028**: Database MUST là PostgreSQL chạy qua Docker và truy cập bằng Prisma ORM.
- **FR-029**: Frontend MUST dùng Next.js App Router, Tailwind CSS, và Lucide Icons cho giao diện thuộc phạm vi feature.
- **FR-030**: Hệ thống MUST seed sẵn 3 tài khoản mẫu (Admin, Instructor, Student) vào database ngay khi khởi tạo migration.

### Constitution Alignment *(mandatory)*

 - **CA-001**: Tính năng MUST tuân thủ toàn bộ hiến pháp dự án hiện hành và các quality gate bắt buộc trước khi triển khai.
 - **CA-002**: Các thay đổi liên quan giao dịch tiền MUST có tiêu chí kiểm thử chứng minh tính toàn vẹn dữ liệu khi lỗi giữa chừng.
 - **CA-003**: Các luồng lỗi nghiệp vụ chính MUST có kịch bản chấp nhận rõ ràng để tránh xử lý lỗi phân tán.

### Assumptions

- Không xây dựng chức năng đăng ký tài khoản trong phạm vi feature này.
- Dữ liệu seed đã bao gồm người dùng mẫu cho 3 vai trò và tối thiểu một số khóa học/video mẫu để test luồng.
- Email xác nhận mua hàng dùng mẫu nội dung chuẩn và gửi theo cơ chế tự động không yêu cầu người dùng thao tác thêm.
- Nén video nền là xử lý bất đồng bộ sau khi video được tải lên và có thể hoàn tất sau thời điểm khóa học được tạo.
- Cấu trúc repo hiện tại cho phép tổ chức theo workspace và có thể thêm package shared types nếu cần.
- Cấu hình môi trường có sẵn Redis instance phục vụ BullMQ worker/producer.

### Key Entities *(include if feature involves data)*

- **User**: Người dùng hệ thống với vai trò Admin, Instructor, hoặc Student; có thông tin nhận diện cơ bản.
- **Wallet**: Ví gắn với Student, lưu số dư hiện tại và thay đổi số dư theo giao dịch.
- **Course**: Khóa học do Instructor tạo, gồm thông tin mô tả, giá bán, trạng thái xuất bản, và danh sách bài học.
- **Lesson**: Bài học thuộc Course, có video nguồn, thứ tự hiển thị, và trạng thái nén video.
- **Enrollment**: Bản ghi xác nhận Student sở hữu khóa học sau khi mua thành công.
- **PurchaseTransaction**: Giao dịch mua khóa học, lưu số tiền, trạng thái, thời gian, và liên kết tới Student/Course.
- **RevenueReport**: Tập số liệu tổng hợp doanh thu cho Admin theo mốc thời gian và theo khóa học.
- **EmailNotification**: Bản ghi sự kiện gửi email xác nhận mua hàng và trạng thái gửi.
- **QueueJob**: Công việc nền cho email xác nhận hoặc nén video, gồm trạng thái xử lý, số lần retry, và thời điểm xử lý tiếp theo.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 95% Student có thể hoàn tất mua khóa học (khi số dư đủ) trong dưới 60 giây từ lúc bấm mua đến lúc thấy quyền truy cập.
- **SC-002**: 100% giao dịch bị từ chối do thiếu số dư không làm thay đổi Balance của Student.
- **SC-003**: 99% giao dịch mua thành công tạo đúng 1 bản ghi sở hữu khóa học cho Student và không có bản ghi trùng.
- **SC-004**: 95% email xác nhận mua được gửi trong vòng 5 phút sau khi giao dịch thành công.
- **SC-005**: 95% video bài học mới tải lên được chuyển sang trạng thái nén hoàn tất trong vòng 30 phút.
- **SC-006**: Admin có thể xem báo cáo doanh thu tổng quan và theo khóa học cho bất kỳ khoảng thời gian nào với tỷ lệ truy vấn thành công 99%.
- **SC-007**: 100% endpoint trong phạm vi feature có mô tả và ví dụ request/response trong tài liệu API.
- **SC-008**: 99% yêu cầu duyệt dữ liệu lớn bằng phân trang cursor trả về trang kế tiếp hợp lệ mà không trùng hoặc mất bản ghi.
- **SC-009**: 100% email xác nhận mua chỉ được kích hoạt sau khi giao dịch ở trạng thái thành công.
- **SC-010**: 100% request dữ liệu từ frontend đi qua Backend API endpoint đã công bố; không có truy cập DB trực tiếp từ frontend.
- **SC-011**: 100% môi trường chạy (dev/staging/prod) cấu hình URL API cho frontend bằng biến `.env` hợp lệ.
- **SC-012**: Môi trường local có thể khởi động Postgres và Redis bằng một lệnh từ root thông qua `docker-compose.yml`.
- **SC-013**: 99% tác vụ nền được xử lý thành công qua queue trong ngưỡng thời gian dịch vụ đã cam kết cho hệ thống.
- **SC-014**: 100% tương tác dữ liệu giữa frontend-backend tuân theo REST endpoints đã được công bố trên Swagger.
- **SC-015**: Sau khi chạy khởi tạo database lần đầu, hệ thống có đúng 3 tài khoản mẫu hoạt động cho Admin/Instructor/Student.
- **SC-016**: 100% endpoint yêu cầu xác thực từ chối request không có JWT hợp lệ.
