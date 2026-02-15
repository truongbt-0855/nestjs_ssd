# Development Journal - Error & Solution Log

## 2026-02-16

### 1. Lỗi: Failed to resolve import "react-router-dom" from "src/App.tsx"
- **Ngữ cảnh:** Khi chạy Vite frontend (http://localhost:5173/), báo lỗi không tìm thấy module react-router-dom.
- **Nguyên nhân:** Chưa cài package react-router-dom và @types/react-router-dom cho frontend.
- **Giải pháp:**
  - Chạy `npm install react-router-dom` trong thư mục frontend.
  - Chạy `npm install @types/react-router-dom --save-dev` để hỗ trợ TypeScript.
  - Kiểm tra lại bằng `npm run dev`, frontend đã hoạt động bình thường.
- **Kết quả:** Đã fix, commit và push lên repo.

### 2. Lỗi: Quên kiểm tra/cài package trước khi push
- **Ngữ cảnh:** Khi implement task frontend, chưa kiểm tra đủ package, dẫn đến lỗi khi test thực tế.
- **Giải pháp:**
  - Luôn kiểm tra, cài đủ package, chạy thử trước khi commit & push.
  - Đã bổ sung quy trình kiểm tra này vào workflow.

---
File này được cập nhật tự động để lưu lại các lỗi thực tế và cách giải quyết trong quá trình phát triển.
