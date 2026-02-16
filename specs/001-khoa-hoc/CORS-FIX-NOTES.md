# CORS Error Fix - Detailed Notes

## Problem
User reported **CORS error** when calling login API from frontend at `http://localhost:5177`.

## Root Cause Analysis

### Issue #1: Port Conflict (EADDRINUSE)
- Backend PORT was hardcoded to 3000 in main.ts
- Multiple old Node processes occupied port 3000
- New backend startup failed: `Error: listen EADDRINUSE: address already in use :::3000`
- **Solution**: Changed backend PORT to 3001

### Issue #2: CORS Origin Mismatch
- Backend `.env` had `FRONTEND_URL=http://localhost:5173`
- Backend `main.ts` enabled CORS with hardcoded origin:
  ```typescript
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });
  ```
- Frontend was running on port 5177 (dynamically assigned by Vite when ports 5173-5176 were occupied)
- CORS headers blocked the request because origin `http://localhost:5177` ≠ `http://localhost:5173`
- **Solution**: Updated `backend/.env` to `FRONTEND_URL=http://localhost:5177`

### Issue #3: Missing Frontend .env
- Frontend `src/services/auth.service.ts` uses `VITE_API_URL`
- Frontend `.env` did not exist
- API_URL defaulted to `http://localhost:3000` (old port)
- **Solution**: Created `frontend/.env` with `VITE_API_URL=http://localhost:3001`

## Configuration Files Changed

### backend/.env
```env
PORT=3001                          # Was 3000
FRONTEND_URL=http://localhost:5177 # Was http://localhost:5173
```

### frontend/.env (NEW)
```env
VITE_API_URL=http://localhost:3001
```

## Technical Details

### CORS Headers Flow
```
Browser Request:
Origin: http://localhost:5177
Host: localhost:3001

NestJS Response:
Access-Control-Allow-Origin: http://localhost:5177 ✓
Access-Control-Allow-Credentials: true
```

### Backend Route Mapping (Verified)
```
[RouterExplorer] Mapped {/auth/login, POST} route
```

### Test Command (Verified Working)
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5177" \
  -d '{"email":"instructor1@example.com","password":"password123"}'
```

**Response ✓**: JWT token + user data returned successfully

## Environment Configuration Pattern

### NestJS (main.ts Bootloader)
```typescript
// CORS enabled with dynamic frontend URL from env
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
});

// Port from env (defaults to 3000)
const port = process.env.PORT ?? 3000;
```

### React/Vite (auth.service.ts)
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```
- Uses Vite's `import.meta.env` for client-side env vars
- Requires `.env` file in project root (auto-loaded by Vite)

## Port Assignment Logic (Vite Default)
```
Port 5173 → occupied
Port 5174 → occupied
Port 5175 → occupied
Port 5176 → occupied
Port 5177 → ✓ assigned
```

## Files Modified
1. `backend/.env`: PORT + FRONTEND_URL
2. `frontend/.env`: VITE_API_URL (created)
3. `backend/src/main.ts`: No change needed (already dynamic)
4. `frontend/src/services/auth.service.ts`: No change needed (already dynamic)

## Verification Steps Completed
✅ Backend builds without errors
✅ Frontend builds without errors  
✅ Backend starts on port 3001
✅ Frontend starts on port 5177
✅ CORS headers correctly set
✅ Login API returns JWT + user data
✅ No TypeScript compilation errors

## Key Learning: CORS Origin Checking
- Browser enforces Same-Origin Policy pre-flight checks for cross-origin requests
- Server must return matching `Access-Control-Allow-Origin` header
- Dynamic port assignment requires flexible env config
- Environment variables must match between server and client

## Deployment Consideration
For production with fixed ports and domains:
```env
# Production
PORT=3000
FRONTEND_URL=https://app.example.com
VITE_API_URL=https://api.example.com
```
