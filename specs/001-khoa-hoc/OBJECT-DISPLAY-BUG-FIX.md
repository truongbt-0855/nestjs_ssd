# Object Object Display Bug - Fix Notes

## Issue
Error messages displayed as **"[object Object]"** on login page instead of readable text.

## Root Cause

### Backend (AllExceptionsFilter)
```typescript
// ❌ BEFORE
const message = exception instanceof HttpException
  ? exception.getResponse()  // Returns OBJECT, not string!
  : exception;
```

`HttpException.getResponse()` returns:
```json
{
  "statusCode": 401,
  "message": "Email hoặc mật khẩu không chính xác",
  "error": "Unauthorized"
}
```

This object was directly passed to response:
```json
{
  "data": null,
  "message": { "statusCode": 401, "message": "...", "error": "..." },  // OBJECT!
  "statusCode": 401
}
```

### Frontend (auth.service)
```typescript
// ❌ BEFORE
throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
```

When `message` is object, `Error.message` becomes `"[object Object]"`.

## Solution

### Backend Fix
```typescript
// ✅ AFTER
let message = 'Internal server error';
if (exception instanceof HttpException) {
  const exceptionResponse = exception.getResponse();
  if (typeof exceptionResponse === 'string') {
    message = exceptionResponse;
  } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
    message = (exceptionResponse as any).message || exception.message;
  }
}
```

### Frontend Fix
```typescript
// ✅ AFTER
let errorMessage = 'Đăng nhập thất bại';
if (error.response?.data?.message) {
  const msg = error.response.data.message;
  errorMessage = typeof msg === 'string' ? msg : (msg.message || msg.error || errorMessage);
}
throw new Error(errorMessage);
```

## Response Format After Fix

### Error Response (401)
```json
{
  "data": null,
  "message": "Email hoặc mật khẩu không chính xác",  ✅ STRING
  "statusCode": 401,
  "timestamp": "2026-02-16T08:22:29.000Z",
  "path": "/auth/login"
}
```

### Success Response (200)
```json
{
  "data": {
    "access_token": "eyJhbGc...",
    "user": { "id": "...", "email": "...", "name": "...", "role": "..." }
  },
  "message": "Đăng nhập thành công"  ✅ STRING
}
```

## Testing

### Wrong Password
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"instructor1@example.com","password":"wrong"}'

✅ Output: {"data":null,"message":"Email hoặc mật khẩu không chính xác",...}
```

### Correct Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"instructor1@example.com","password":"password123"}'

✅ Output: {"data":{...},"message":"Đăng nhập thành công"}
```

## Key Learnings

1. **NestJS HttpException.getResponse()** returns object, not string
2. **Type checking required** before displaying in UI
3. **Defensive programming** - handle both string and object formats
4. **Error message extraction** - nested fields need proper parsing
5. **JSX renders** - objects as `"[object Object]"`, only primitives render properly

## Files Modified
- `backend/src/common/filters/all-exceptions.filter.ts` ✓
- `frontend/src/services/auth.service.ts` ✓

## Commit
`f729a18` - fix: resolve 'object object' display issue in error messages
