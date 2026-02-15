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

## 5. Errors Log - Implementation Phase (2026-02-16)

### 🔴 Lỗi Gặp Phải Khi Implement User Story 1 (T011-T017)

#### A. Backend Errors

**A1. Missing Prisma Client Types**
- **Files affected**: 
  - `backend/src/modules/course/course.service.ts`
  - `backend/src/common/guards/roles.guard.ts`
  - `backend/prisma/seed.ts`
  - `backend/tests/contract/course-crud.spec.ts`

- **Error**:
  ```
  Module '"@prisma/client"' has no exported member 'CourseStatus'
  Module '"@prisma/client"' has no exported member 'Role'
  ```

- **Root Cause**: Prisma client chưa được generate sau khi tạo schema

- **Solution**: ✅ FIXED
  ```bash
  cd backend
  npx prisma generate
  ```
  **Important**: Cần restart TypeScript server trong VS Code sau khi generate để nhận types mới

---

**A2. Missing @nestjs/passport Dependency**
- **File affected**: `backend/src/common/guards/jwt-auth.guard.ts`

- **Error**:
  ```
  Cannot find module '@nestjs/passport' or its corresponding type declarations
  ```

- **Root Cause**: Package chưa được cài đặt khi tạo JwtAuthGuard

- **Solution**: ✅ FIXED
  ```bash
  cd backend
  npm install @nestjs/passport passport passport-jwt @types/passport-jwt
  ```

---

**A3. Supertest Import Error in Contract Tests**
- **File affected**: `backend/tests/contract/course-crud.spec.ts`

- **Error**:
  ```
  This expression is not callable.
  Type '{ default: SuperTestStatic; ... }' has no call signatures
  ```

- **Root Cause**: Sai cách import supertest (dùng namespace import thay vì default import)

- **Solution**: ✅ FIXED
  ```typescript
  // ❌ Wrong:
  import * as request from 'supertest';

  // ✅ Correct:
  import request from 'supertest';
  ```

- **Also Fixed**: Type annotation cho mock guard context
  ```typescript
  // ❌ Wrong:
  canActivate: (context) => {

  // ✅ Correct:
  canActivate: (context: any) => {
  ```

---

#### B. Frontend Errors

**B1. Missing @tanstack/react-query Dependency**
- **File affected**: `frontend/src/pages/admin/courses/AdminCoursesPage.tsx`

- **Error**:
  ```
  Cannot find module '@tanstack/react-query' or its corresponding type declarations
  ```

- **Root Cause**: Package chưa được cài đặt

- **Solution**: ✅ FIXED
  ```bash
  cd frontend
  npm install @tanstack/react-query axios
  ```

---

**B2. TypeScript verbatimModuleSyntax Error**
- **Files affected**: 
  - `frontend/src/pages/admin/courses/AdminCoursesPage.tsx`
  - `frontend/src/components/CourseForm.tsx`
  - `frontend/src/components/CourseList.tsx`

- **Error**:
  ```
  'Course' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled
  'CreateCourseDto' is a type and must be imported using a type-only import...
  ```

- **Root Cause**: TypeScript config bật `verbatimModuleSyntax`, yêu cầu type imports phải được đánh dấu rõ ràng

- **Solution**: ✅ FIXED
  ```typescript
  // ❌ Wrong:
  import { Course, CreateCourseDto } from '../services/course.service';

  // ✅ Correct (Option 1):
  import type { Course, CreateCourseDto } from '../services/course.service';

  // ✅ Correct (Option 2):
  import { courseService, type Course, type CreateCourseDto } from '../services/course.service';
  ```

---

**B3. Wrong Import Path in Components**
- **Files affected**: 
  - `frontend/src/components/CourseForm.tsx`
  - `frontend/src/components/CourseList.tsx`

- **Error**:
  ```
  Cannot find module '../../../services/course.service'
  ```

- **Root Cause**: Components nằm ở `src/components/` (1 cấp từ src) nhưng import path dùng `../../../` (3 cấp)

- **Solution**: ✅ FIXED
  ```typescript
  // ❌ Wrong (from src/components/):
  import type { Course } from '../../../services/course.service';

  // ✅ Correct:
  import type { Course } from '../services/course.service';
  ```

---

### ✅ Final Status - All Errors Fixed

**Backend**:
- ✅ Prisma client generated với đầy đủ types
- ✅ Dependencies installed: `@nestjs/passport`, `passport`, `passport-jwt`, `@nestjs/jwt`
- ✅ Import errors fixed trong tests
- ✅ Type annotations added
- ✅ JWT Strategy configured
- ✅ DTO type consistency fixed

---

## 6. Backend Build & Runtime Errors (2026-02-16 - Phase 2)

### 🔴 Lỗi Khi Chạy Backend Sau Implementation

**B1. Type Mismatch - Description Field**
- **Files affected**: `backend/src/modules/course/course.service.ts` (4 locations)

- **Error**:
  ```
  Type '{ id: string; ... description: string | null; ... }' is not assignable to type 'CourseResponseDto'
  Types of property 'description' are incompatible.
    Type 'string | null' is not assignable to type 'string | undefined'.
      Type 'null' is not assignable to type 'string | undefined'.
  ```

- **Root Cause**: Prisma trả về `description: string | null` (từ database nullable field), nhưng DTO định nghĩa là `description?: string` (tức `string | undefined`)

- **Solution**: ✅ FIXED
  ```typescript
  // ❌ Wrong (backend/src/modules/course/dto/course-response.dto.ts):
  export class CourseResponseDto {
    description?: string;  // string | undefined
  }

  // ✅ Correct:
  export class CourseResponseDto {
    description: string | null;  // match với Prisma
  }
  ```

---

**B2. CreateCourseDto Required Field Mismatch**
- **File affected**: `backend/src/modules/course/dto/create-course.dto.ts`

- **Error**: Validation yêu cầu description bắt buộc nhưng trong DB là nullable

- **Root Cause**: DTO missing `@IsOptional()` decorator cho optional fields

- **Solution**: ✅ FIXED
  ```typescript
  // ❌ Wrong:
  export class CreateCourseDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    description: string;  // Required nhưng DB là nullable
  }

  // ✅ Correct:
  import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

  export class CreateCourseDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()  // Thêm decorator này
    description?: string;
  }
  ```

---

**B3. Missing JWT Strategy Configuration**
- **Error**: JwtAuthGuard sử dụng Passport strategy 'jwt' nhưng strategy chưa được define

- **Root Cause**: AuthModule chưa có JwtStrategy provider

- **Solution**: ✅ FIXED
  - Tạo file `backend/src/modules/auth/strategies/jwt.strategy.ts`:
  ```typescript
  import { Injectable } from '@nestjs/common';
  import { PassportStrategy } from '@nestjs/passport';
  import { ExtractJwt, Strategy } from 'passport-jwt';
  import { ConfigService } from '@nestjs/config';

  export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
  }

  @Injectable()
  export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
      });
    }

    async validate(payload: JwtPayload) {
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    }
  }
  ```

---

**B4. AuthModule Missing JWT Configuration**
- **File affected**: `backend/src/modules/auth/auth.module.ts`

- **Error**: Module không có JwtModule registration

- **Solution**: ✅ FIXED
  ```typescript
  import { Module } from '@nestjs/common';
  import { JwtModule } from '@nestjs/jwt';
  import { PassportModule } from '@nestjs/passport';
  import { ConfigModule, ConfigService } from '@nestjs/config';
  import { AuthService } from './auth.service';
  import { AuthController } from './auth.controller';
  import { JwtStrategy } from './strategies/jwt.strategy';
  import { PrismaService } from '../../services/prisma.service';

  @Module({
    imports: [
      PassportModule.register({ defaultStrategy: 'jwt' }),
      JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
          signOptions: {
            expiresIn: '1d' as const,
          },
        }),
        inject: [ConfigService],
      }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, PrismaService],
    exports: [AuthService, JwtStrategy, PassportModule],
  })
  export class AuthModule {}
  ```

---

**B5. Missing @nestjs/jwt Package**
- **Error**: `Cannot find module '@nestjs/jwt'`

- **Solution**: ✅ FIXED
  ```bash
  cd backend
  npm install @nestjs/jwt
  ```

---

**B6. Main.ts Missing CORS and Global Pipes**
- **File affected**: `backend/src/main.ts`

- **Issue**: 
  - Frontend không thể gọi API (CORS blocked)
  - Validation decorators không hoạt động (missing global pipe)

- **Solution**: ✅ FIXED
  ```typescript
  import { NestFactory } from '@nestjs/core';
  import { ValidationPipe } from '@nestjs/common';
  import { AppModule } from './app.module';
  import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
  import { ApiResponseFormatMiddleware } from './middleware/api-response-format.middleware';

  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    // Enable CORS for frontend
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    });
    
    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    
    app.useGlobalFilters(new AllExceptionsFilter());
    app.use(new ApiResponseFormatMiddleware().use);
    
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
  }
  bootstrap();
  ```

---

**B7. Missing Environment Configuration**
- **Issue**: Không có .env.example để hướng dẫn config

- **Solution**: ✅ FIXED
  - Tạo `backend/.env.example`:
  ```env
  # Database
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nestjs_course_db?schema=public"

  # JWT
  JWT_SECRET="your-secret-key-change-in-production"
  JWT_EXPIRES_IN="1d"

  # Application
  PORT=3000
  NODE_ENV="development"

  # Frontend (for CORS)
  FRONTEND_URL="http://localhost:5173"
  ```

---

### ✅ Backend Ready Status

**Build**: ✅ `npm run build` - No errors  
**Type Safety**: ✅ All TypeScript errors resolved  
**Configuration**: ✅ JWT, CORS, Validation configured  
**Dependencies**: ✅ All packages installed  

**Server Ready**:
```bash
cd backend
npm run start:dev  # Development mode
# hoặc
npm run start      # Production mode
```

**API Endpoints Available**:
- `POST /courses` - Create course (requires JWT auth, INSTRUCTOR role)
- `GET /courses` - List user's courses (requires JWT auth, INSTRUCTOR role)
- `GET /courses/:id` - Get course detail (requires JWT auth, INSTRUCTOR role)
- `PUT /courses/:id` - Update course (requires JWT auth, INSTRUCTOR role)
- `DELETE /courses/:id` - Delete course (requires JWT auth, INSTRUCTOR role)

---

### ⚠️ Post-Fix Action Required

**VS Code TypeScript Server Cache Issue**:

Sau khi generate Prisma client, VS Code có thể vẫn hiển thị lỗi do cache của TypeScript language server.

**Solution**:
1. Open Command Palette: `Ctrl+Shift+P` (Windows) / `Cmd+Shift+P` (Mac)
2. Run command: `TypeScript: Restart TS Server`
3. Hoặc: Reload VS Code window (`Ctrl+R` hoặc `Developer: Reload Window`)

Sau khi restart, tất cả lỗi sẽ biến mất hoàn toàn.

---

### 📋 Prevention Checklist for Future Features

**Before Writing Code**:
- [ ] Check schema.prisma có đầy đủ models/enums cần thiết
- [ ] Run `npx prisma generate` sau khi sửa schema
- [ ] Verify dependencies trong package.json
- [ ] Kiểm tra TypeScript config rules (strict mode, etc.)
- [ ] Tạo .env.example cho config cần thiết

**While Writing Code**:
- [ ] DTO types phải match với Prisma types (`null` vs `undefined`)
- [ ] Thêm `@IsOptional()` cho optional fields trong DTOs
- [ ] Add type annotations cho callbacks và parameters
- [ ] Use default import cho CommonJS modules (supertest, etc.)
- [ ] Configure strategies cho Passport guards

**After Writing Code**:
- [ ] Run `npm install` để sync dependencies
- [ ] Run `npm run build` để check compile errors
- [ ] Test với `npm run start` để check runtime errors
- [ ] Restart TypeScript server nếu có type errors không rõ ràng
- [ ] Test API endpoints với curl hoặc Postman

---

### 🎓 Lessons Learned

1. **Prisma Type Consistency**: Luôn đảm bảo DTO types match với Prisma nullable fields (`string | null` không phải `string | undefined`)
2. **Validation Decorators**: `@IsOptional()` bắt buộc cho các fields không required
3. **JWT Setup**: Cần cả JwtModule, PassportModule, và JwtStrategy cùng lúc
4. **Global Configuration**: CORS và ValidationPipe phải được setup trong `main.ts`
5. **Environment Variables**: Luôn tạo `.env.example` để document required configs
6. **Build Before Run**: `npm run build` expose compile errors trước khi runtime
7. **Type Safety First**: TypeScript strict mode giúp catch lỗi sớm

---

File này ghi lại quá trình debug và giải pháp cho các lỗi phổ biến khi setup NestJS + Prisma + JWT với TypeScript strict mode.
---

## 2026-02-16: User Story 2 - Published Courses Public Endpoint

### Implementation Notes

**Public Endpoint for Students (T019)**
- ✅ Added `@Public()` decorator to bypass JWT authentication
- ✅ Created `public.decorator.ts` in `src/common/decorators/`
- ✅ Updated `jwt-auth.guard.ts` to check for @Public metadata using Reflector
- ✅ Added `findAllPublished()` service method that filters by CourseStatus.PUBLISHED
- ✅ Endpoint: `GET /courses/published` (public, no auth required)

**Key Code**:
```typescript
// public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// jwt-auth.guard.ts updates
constructor(private reflector: Reflector) {
  super(configService);
}

async canActivate(context: ExecutionContext): Promise<boolean> {
  const isPublic = this.reflector.getAllAndOverride<boolean>(
    IS_PUBLIC_KEY,
    [context.getHandler(), context.getClass()],
  );
  if (isPublic) {
    return true;
  }
  return super.canActivate(context);
}

// course.service.ts
async findAllPublished(): Promise<CourseResponseDto[]> {
  const courses = await this.prisma.course.findMany({
    where: { status: CourseStatus.PUBLISHED },
    orderBy: { createdAt: 'desc' }
  });
  return courses;
}

// course.controller.ts
@Public()
@Get('published')
async findAllPublished() {
  const courses = await this.courseService.findAllPublished();
  return { data: courses, message: 'Published courses retrieved successfully' };
}
```

**Testing (T020)**
- ✅ Created `tests/integration/course-list.spec.ts`
- ✅ All 7 tests passing:
  - Returns array of courses
  - Filters only PUBLISHED status
  - Works for all instructors
  - Orders by creation date (newest first)
  - Has all required fields (id, title, description, status, ownerId, createdAt, updatedAt)
  - Requires no authentication (@Public works)
  - Handles null description

**No New Errors in NestJS Backend**
- Backend builds successfully
- TypeScript compilation clean
- All decorator and service implementations work without errors
- Integration tests pass without issues

---
