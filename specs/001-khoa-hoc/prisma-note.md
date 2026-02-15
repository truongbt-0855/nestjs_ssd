# Prisma & Validation Issues - Debug Note

## 1. Lỗi không import được enum/model từ @prisma/client
**Vấn đề:**
- Khi import `Role` hoặc `CourseStatus` từ `@prisma/client` trong code, VSCode và TypeScript báo không tìm thấy export tương ứng.
- Nguyên nhân: Chưa chạy `prisma generate` hoặc cấu hình Prisma chưa đúng chuẩn 7.x (cần prisma.config.ts).

**Giải pháp:**
- Tạo file `prisma.config.ts` đúng chuẩn Prisma 7+ (tham khảo docs chính thức).
- Đảm bảo schema.prisma có enum/model cần thiết.
- Chạy `npx prisma generate` trong đúng thư mục backend để sinh lại client.

## 2. Lỗi không tìm thấy module 'class-validator'
**Vấn đề:**
- Khi import `IsString`, `IsNotEmpty` từ 'class-validator', TypeScript báo không tìm thấy module.
- Nguyên nhân: Chưa cài package `class-validator` và `class-transformer`.

**Giải pháp:**
- Chạy `npm install class-validator class-transformer` trong backend.

## 3. Lỗi defineConfig không phải là function
**Vấn đề:**
- Khi dùng `defineConfig` từ `@prisma/internals` trong `prisma.config.ts`, Prisma báo không phải là function.
- Nguyên nhân: Có thể do version Prisma chưa đồng bộ hoặc docs chưa cập nhật, hoặc import sai.

**Giải pháp:**
- Đảm bảo cả `prisma`, `@prisma/client`, `@prisma/internals` đều là 7.x trở lên.
- Nếu vẫn lỗi, export default object thay vì dùng defineConfig:
```js
export default {
  schema: './prisma/schema.prisma',
  generator: {
    provider: 'prisma-client-js',
    output: './node_modules/@prisma/client',
  },
  datasource: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nest_course',
  },
};
```

## 4. Quy trình fix tổng thể
1. Đảm bảo schema.prisma có enum/model đúng.
2. Tạo/cập nhật prisma.config.ts đúng chuẩn.
3. Cài đủ các package: prisma, @prisma/client, @prisma/internals, class-validator, class-transformer (đều 7.x nếu có thể).
4. Chạy `npx prisma generate` trong backend.
5. Khởi động lại backend, kiểm tra lại import enum/model từ @prisma/client.

---
File này tự động sinh ra bởi AI để note lại quá trình debug và giải pháp cho các lỗi phổ biến khi setup Prisma 7+ và validation cho NestJS.