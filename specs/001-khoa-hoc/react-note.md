# Development Journal - Error & Solution Log

## 2026-02-16

### Session 1: Frontend Setup Issues

**1. Lỗi: Failed to resolve import "react-router-dom" from "src/App.tsx"**
- **Ngữ cảnh:** Khi chạy Vite frontend (http://localhost:5173/), báo lỗi không tìm thấy module react-router-dom.
- **Nguyên nhân:** Chưa cài package react-router-dom và @types/react-router-dom cho frontend.
- **Giải pháp:**
  - Chạy `npm install react-router-dom` trong thư mục frontend.
  - Chạy `npm install @types/react-router-dom --save-dev` để hỗ trợ TypeScript.
  - Kiểm tra lại bằng `npm run dev`, frontend đã hoạt động bình thường.
- **Kết quả:** Đã fix, commit và push lên repo.

**2. Lỗi: Quên kiểm tra/cài package trước khi push**
- **Ngữ cảnh:** Khi implement task frontend, chưa kiểm tra đủ package, dẫn đến lỗi khi test thực tế.
- **Giải pháp:**
  - Luôn kiểm tra, cài đủ package, chạy thử trước khi commit & push.
  - Đã bổ sung quy trình kiểm tra này vào workflow.

---

### Session 2: User Story 1 Frontend Implementation Errors

**3. Missing @tanstack/react-query Dependency**
- **File affected**: `frontend/src/pages/admin/courses/AdminCoursesPage.tsx`
- **Error**:
  ```
  Cannot find module '@tanstack/react-query' or its corresponding type declarations
  ```
- **Root Cause**: Package chưa được cài đặt khi implement Course management UI
- **Solution**: ✅ FIXED
  ```bash
  cd frontend
  npm install @tanstack/react-query axios
  ```

**4. Missing axios Dependency**
- **File affected**: `frontend/src/services/course.service.ts`
- **Error**:
  ```
  Cannot find module 'axios' or its corresponding type declarations
  ```
- **Root Cause**: Package chưa được cài đặt
- **Solution**: ✅ FIXED (cùng lúc với @tanstack/react-query)

---

**5. TypeScript verbatimModuleSyntax Error**
- **Files affected**:
  - `frontend/src/pages/admin/courses/AdminCoursesPage.tsx`
  - `frontend/src/components/CourseForm.tsx`
  - `frontend/src/components/CourseList.tsx`

- **Error**:
  ```
  'Course' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled
  'CreateCourseDto' is a type and must be imported using a type-only import...
  'UpdateCourseDto' is a type and must be imported using a type-only import...
  ```

- **Root Cause**: TypeScript config bật `verbatimModuleSyntax`, yêu cầu type imports phải được đánh dấu rõ ràng với `type` keyword

- **Solution**: ✅ FIXED
  ```typescript
  // ❌ Wrong:
  import { Course, CreateCourseDto } from '../services/course.service';

  // ✅ Correct (Option 1 - Type-only import):
  import type { Course, CreateCourseDto } from '../services/course.service';

  // ✅ Correct (Option 2 - Mixed import):
  import { courseService, type Course, type CreateCourseDto } from '../services/course.service';
  ```

- **Explanation**: 
  - `verbatimModuleSyntax` là TypeScript compiler option yêu cầu type và value imports phải tách biệt rõ ràng
  - Giúp tránh side effects khi transpile, đảm bảo types không xuất hiện trong runtime code

---

**6. Wrong Import Path in Components**
- **Files affected**:
  - `frontend/src/components/CourseForm.tsx`
  - `frontend/src/components/CourseList.tsx`

- **Error**:
  ```
  Cannot find module '../../../services/course.service'
  ```

- **Root Cause**: 
  - Components nằm ở `src/components/` (1 level từ src)
  - Import path dùng `../../../` (3 levels up) → sai
  - Đúng phải là `../services/` (1 level up tới src, rồi vào services)

- **Solution**: ✅ FIXED
  ```typescript
  // ❌ Wrong (from src/components/):
  import type { Course } from '../../../services/course.service';

  // ✅ Correct:
  import type { Course } from '../services/course.service';
  ```

- **Tip**: Đếm số `../` bằng cách:
  - File hiện tại: `src/components/CourseForm.tsx`
  - Target: `src/services/course.service.ts`
  - Từ `components/` lên `src/`: `../`
  - Từ `src/` vào `services/`: `services/`
  - Result: `../services/course.service`

---

**7. Implicit Any Type in Axios Config**
- **File affected**: `frontend/src/services/course.service.ts`

- **Error**:
  ```
  Parameter 'config' implicitly has an 'any' type
  ```

- **Root Cause**: TypeScript strict mode yêu cầu explicit type cho parameters, axios config parameter không có type annotation

- **Solution**: ✅ FIXED
  ```typescript
  // ❌ Wrong:
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // ✅ Correct:
  api.interceptors.request.use((config: any) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  ```

- **Note**: Dùng `any` ở đây là acceptable vì axios InternalAxiosRequestConfig type phức tạp và `any` đủ cho use case này

---

### ✅ Frontend Ready Status

**Build**: ✅ No TypeScript errors  
**Dependencies**: ✅ All packages installed (@tanstack/react-query, axios)  
**Type Safety**: ✅ verbatimModuleSyntax compliant  
**Import Paths**: ✅ All corrected  

**Dev Server**:
```bash
cd frontend
npm run dev
```

**Production Build**:
```bash
cd frontend
npm run build
```

---

### 📋 Prevention Checklist for Future Features

**Before Writing Code**:
- [ ] Check package.json có đủ dependencies cần thiết
- [ ] Kiểm tra TypeScript config (verbatimModuleSyntax, strict mode, etc.)
- [ ] Xác định project structure để tính đúng import paths
- [ ] Verify target dependencies có TypeScript types (@types/* packages)

**While Writing Code**:
- [ ] Dùng `type` keyword cho type-only imports khi `verbatimModuleSyntax` enabled
- [ ] Đếm đúng số `../` cho relative imports (count folders từ current file)
- [ ] Add type annotations cho function parameters (tránh implicit any)
- [ ] Separate type imports vs value imports

**After Writing Code**:
- [ ] Run `npm install` để sync dependencies
- [ ] Check TypeScript errors: VS Code hoặc `npm run build`
- [ ] Test dev server: `npm run dev`
- [ ] Test production build: `npm run build`
- [ ] Restart TS Server nếu có cached errors

---

### 🎓 Lessons Learned

1. **verbatimModuleSyntax**: Luôn dùng `type` keyword cho type imports khi option này bật
2. **Import Paths**: Đếm levels cẩn thận, verify từng `../` trước khi save
3. **Package Dependencies**: Install dependencies trước khi code để có IntelliSense
4. **Type Annotations**: Thêm types ngay cả khi dùng `any` để satisfy strict mode
5. **Build Testing**: `npm run build` expose errors tốt hơn dev mode
6. **Axios Types**: InternalAxiosRequestConfig phức tạp, `any` acceptable cho interceptors

---

File này được cập nhật tự động để lưu lại các lỗi thực tế và cách giải quyết trong quá trình phát triển React + TypeScript + Vite.
