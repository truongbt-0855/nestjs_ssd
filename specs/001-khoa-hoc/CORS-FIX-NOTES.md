# CORS Error Fix - Detailed Notes

## Problem
User reported **CORS error** when calling login API from frontend.

## Final Solution: Dynamic Multi-Origin CORS Configuration

### Backend Configuration (main.ts)
```typescript
const allowedOrigins = [
  'http://localhost:5173',  // Vite default port
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',  // Support Vite dynamic port assignment
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.enableCors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
});
```

### Why This Approach?
1. **Vite Dynamic Ports**: Vite auto-increments port if 5173 is busy
2. **Development Flexibility**: Multiple team members can run simultaneously
3. **Type Safety**: Proper TypeScript types for callback parameters
4. **Security**: Explicit origin validation in production
5. **Tool Compatibility**: Allows Postman/curl requests (no origin header)

## Root Cause Analysis (Iteration 1)

### Issue #1: Port Conflict (EADDRINUSE)
- Backend PORT was hardcoded to 3000 in main.ts
- Multiple old Node processes occupied port 3000
- New backend startup failed: `Error: listen EADDRINUSE: address already in use :::3000`
- **Initial Solution**: Changed backend PORT to 3001 (later reverted to 3000)

### Issue #2: CORS Origin Mismatch
- Backend `.env` had `FRONTEND_URL=http://localhost:5173`
- Backend `main.ts` enabled CORS with **single hardcoded origin**:
  ```typescript
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });
  ```
- Frontend ran on port 5177 (dynamically assigned by Vite when 5173-5176 occupied)
- **CORS blocked**: origin `http://localhost:5177` ≠ `http://localhost:5173`
- **Final Solution**: Dynamic multi-origin callback with array validation

### Issue #3: Missing Frontend .env
- Frontend `src/services/auth.service.ts` uses `VITE_API_URL`
- Frontend `.env` did not exist initially
- API_URL defaulted to `http://localhost:3000` (old port)
- **Solution**: Created `frontend/.env` with `VITE_API_URL=http://localhost:3000`

## Configuration Files

### backend/.env
```env
PORT=3000
FRONTEND_URL=http://localhost:5173  # Primary but not exclusive
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nest_course
JWT_SECRET=your-secret-key-change-in-production-12345
NODE_ENV=development
```

### frontend/.env
```env
VITE_API_URL=http://localhost:3000
```

## Verification Tests

### CORS Headers (curl test)
```bash
$ curl -v -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{"email":"instructor1@example.com","password":"password123"}'

✅ Response Headers:
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: http://localhost:5173
< Access-Control-Allow-Credentials: true
< Vary: Origin
```

### Backend Routes
```
✅ [RouterExplorer] Mapped {/auth/login, POST} route
✅ Backend: http://localhost:3000
✅ Frontend: http://localhost:5173
```

## Technical Details

### NestJS CORS Options
```typescript
interface CorsOptions {
  origin: string | RegExp | (string | RegExp)[] | CustomOrigin;
  credentials?: boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

type CustomOrigin = (
  requestOrigin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
) => void;
```

### Browser CORS Pre-flight Flow
```
1. Browser sends OPTIONS request (pre-flight)
   Origin: http://localhost:5173
   Access-Control-Request-Method: POST
   Access-Control-Request-Headers: content-type, authorization

2. Server responds with allowed origins/methods
   Access-Control-Allow-Origin: http://localhost:5173
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Authorization, Accept
   Access-Control-Allow-Credentials: true

3. Browser sends actual POST request
   Origin: http://localhost:5173
   Authorization: Bearer <token>

4. Server responds with data + CORS headers
   Access-Control-Allow-Origin: http://localhost:5173
   Access-Control-Allow-Credentials: true
```

### Vite Port Assignment Logic
```
Port 5173 → occupied? Try 5174
Port 5174 → occupied? Try 5175
Port 5175 → occupied? Try 5176
...continues until free port found
```

## Files Modified
1. ✅ `backend/src/main.ts`: Dynamic multi-origin CORS with TypeScript types
2. ✅ `backend/.env`: PORT=3000, FRONTEND_URL for reference
3. ✅ `frontend/.env`: VITE_API_URL=http://localhost:3000 (created)

## Key Learnings

### 1. CORS Origin Validation
- Browser enforces Same-Origin Policy strictly
- Server must return matching `Access-Control-Allow-Origin` header
- Use custom callback for flexible origin validation in development
- Production should use strict origin whitelist or env var

### 2. TypeScript Strict Mode
- Callback parameters need explicit types
- `origin: string | undefined` (can be undefined for same-origin requests)
- `callback: (err: Error | null, allow?: boolean) => void`

### 3. Development vs Production
```typescript
// Development: Allow multiple ports
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', ...]

// Production: Strict single origin
app.enableCors({
  origin: process.env.FRONTEND_URL, // https://app.example.com
  credentials: true,
})
```

### 4. Credentials Flag
- `credentials: true` → browser includes cookies & Authorization header
- Required for JWT authentication in separate origin
- Must set `Access-Control-Allow-Credentials: true` response header

## Production Deployment Checklist

- [ ] Update `allowedOrigins` to production domain only
- [ ] Set `FRONTEND_URL` env var to production URL
- [ ] Remove localhost origins from array
- [ ] Enable HTTPS (required for credentials: true in production)
- [ ] Test CORS pre-flight with production domain
- [ ] Verify Authorization header passes through

## Commit History
- `5381fbe`: Initial TypeScript build error fixes
- `c401cd5`: Added CORS fix documentation (iteration 1)
- `ac619a3`: **Final fix** - Dynamic multi-origin CORS configuration ✓
