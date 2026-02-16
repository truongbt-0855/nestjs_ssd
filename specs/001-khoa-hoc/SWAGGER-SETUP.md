# Swagger API Documentation - Setup Guide

## Quick Access
**Swagger UI**: http://localhost:3000/api-docs

## Overview
Comprehensive API documentation using OpenAPI 3.0 specification via NestJS Swagger module.

## Features Implemented

### 1. Swagger Configuration
**Location**: `backend/src/main.ts`

```typescript
const config = new DocumentBuilder()
  .setTitle('Course Management API')
  .setDescription('API documentation for Course Management System')
  .setVersion('1.0')
  .addTag('auth', 'Authentication endpoints')
  .addTag('courses', 'Course management endpoints')
  .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    name: 'JWT',
    description: 'Enter JWT token',
    in: 'header',
  }, 'JWT-auth')
  .build();
```

### 2. Authentication Testing

#### Step 1: Get JWT Token
1. Navigate to **auth** section
2. Expand `POST /auth/login`
3. Click **Try it out**
4. Use test credentials:
   ```json
   {
     "email": "instructor1@example.com",
     "password": "password123"
   }
   ```
5. Click **Execute**
6. Copy `access_token` from response

#### Step 2: Authorize Protected Endpoints
1. Click **🔓 Authorize** button (top right)
2. Paste JWT token (without "Bearer " prefix)
3. Click **Authorize**
4. Click **Close**
5. Now all 🔒 protected endpoints are accessible

### 3. API Endpoints Documentation

#### Auth Endpoints (`@ApiTags('auth')`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | Login with email/password | ❌ Public |

**Response Example**:
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "instructor1@example.com",
      "name": "Instructor One",
      "role": "INSTRUCTOR"
    }
  },
  "message": "Đăng nhập thành công"
}
```

#### Course Endpoints (`@ApiTags('courses')`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/courses/published` | Get all published courses | ❌ Public | - |
| POST | `/courses` | Create new course | ✅ JWT | INSTRUCTOR |
| GET | `/courses` | Get instructor's courses | ✅ JWT | INSTRUCTOR |
| GET | `/courses/:id` | Get course by ID | ✅ JWT | INSTRUCTOR |
| PUT | `/courses/:id` | Update course | ✅ JWT | INSTRUCTOR |
| DELETE | `/courses/:id` | Delete course | ✅ JWT | INSTRUCTOR |
| PATCH | `/courses/:id/publish` | Publish course | ✅ JWT | INSTRUCTOR |
| PATCH | `/courses/:id/unpublish` | Unpublish course | ✅ JWT | INSTRUCTOR |

### 4. DTOs with Swagger Decorators

#### CreateCourseDto
```typescript
@ApiProperty({
  description: 'Course title',
  example: 'NestJS Advanced Course',
  required: true,
})
title: string;

@ApiProperty({
  description: 'Course description',
  example: 'Learn advanced NestJS concepts...',
  required: false,
})
description?: string;
```

#### UpdateCourseDto
```typescript
@ApiProperty({
  description: 'Course title',
  example: 'Updated Course Title',
  required: false,
})
title?: string;

@ApiProperty({
  description: 'Course description',
  example: 'Updated course description...',
  required: false,
})
description?: string;
```

### 5. Controller Decorators Used

#### Class-level
```typescript
@ApiTags('courses')           // Group endpoints
@ApiBearerAuth('JWT-auth')    // Require JWT for all routes
@Controller('courses')
```

#### Method-level
```typescript
@ApiOperation({ 
  summary: 'Create new course',
  description: 'Only INSTRUCTOR role can create courses'
})
@ApiResponse({ status: 201, description: 'Course created successfully' })
@ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
@ApiResponse({ status: 403, description: 'Forbidden - INSTRUCTOR role required' })
@ApiParam({ name: 'id', description: 'Course UUID', type: 'string' })
```

## Swagger UI Features

### 1. Try It Out
- Interactive API testing directly from browser
- Fill request body with examples
- Execute requests and see real responses
- View response headers and status codes

### 2. Models/Schemas
- Auto-generated from DTOs
- Shows required/optional fields
- Example values for each property
- Type information (string, number, etc.)

### 3. Authorization
- Global authorize button
- Supports Bearer token authentication
- Persists token across requests during session

### 4. Response Examples
- HTTP status codes documented
- Success response schemas
- Error response schemas
- Real example data

## Testing Workflow

### Test Public Endpoint
```bash
# No auth required
GET /courses/published
→ Click "Try it out" → Execute
→ See list of published courses
```

### Test Protected Endpoint
```bash
# 1. Login first
POST /auth/login
Body: { "email": "instructor1@example.com", "password": "password123" }
→ Copy access_token

# 2. Authorize
Click 🔓 Authorize → Paste token → Authorize

# 3. Test protected endpoint
POST /courses
Body: { "title": "Test Course", "description": "Test description" }
→ Execute → See 201 Created response
```

### Test RBAC (Role-Based Access Control)
```bash
# Login as STUDENT
POST /auth/login
Body: { "email": "student1@example.com", "password": "password123" }

# Try to create course (should fail)
POST /courses
→ Expected: 403 Forbidden (INSTRUCTOR role required)
```

## Customization

### Custom Styling
```typescript
SwaggerModule.setup('api-docs', app, document, {
  customSiteTitle: 'Course Management API Docs',
  customfavIcon: 'https://nestjs.com/img/logo_text.svg',
  customCss: '.swagger-ui .topbar { display: none }',
});
```

### CORS Support
Swagger UI respects the CORS configuration in `main.ts`, allowing testing from the browser.

## Files Modified

| File | Purpose |
|------|---------|
| `backend/src/main.ts` | Swagger configuration & setup |
| `backend/src/modules/auth/auth.controller.ts` | Auth endpoint documentation |
| `backend/src/modules/course/course.controller.ts` | Course endpoints documentation |
| `backend/src/modules/course/dto/create-course.dto.ts` | CreateCourseDto schema |
| `backend/src/modules/course/dto/update-course.dto.ts` | UpdateCourseDto schema |
| `backend/package.json` | Added swagger dependencies |

## Dependencies Installed
```json
{
  "@nestjs/swagger": "^7.x.x",
  "swagger-ui-express": "^5.x.x"
}
```

## Production Considerations

### 1. Disable in Production (Optional)
```typescript
if (process.env.NODE_ENV !== 'production') {
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
}
```

### 2. API Versioning
```typescript
.setVersion('1.0')
// Update when breaking changes occur
```

### 3. Security
- Swagger UI doesn't expose sensitive data by default
- JWT tokens are only in browser memory (not persisted)
- CORS still enforced for API calls

## Troubleshooting

### Swagger UI not loading
```bash
# Check backend is running
curl http://localhost:3000/api-docs

# Should return HTML
# If not, check terminal for errors
```

### Authorization not working
```bash
# 1. Check JWT token is valid
# 2. Token should NOT include "Bearer " prefix in Authorize dialog
# 3. Click Authorize, then Close (don't click Logout)
# 4. Look for 🔒 lock icon to confirm authorization
```

### Missing endpoints
```bash
# Ensure controller has @ApiTags() decorator
# Ensure methods have @ApiOperation() decorator
# Restart backend to reload Swagger config
```

## Advanced Features (Future Enhancements)

- [ ] Add response DTO classes with @ApiProperty
- [ ] Document query parameters with @ApiQuery
- [ ] Add file upload examples (@ApiConsumes('multipart/form-data'))
- [ ] Create example responses with @ApiExtraModels
- [ ] Add API deprecation warnings (@ApiDeprecated)
- [ ] Generate SDK from OpenAPI spec
- [ ] Add rate limiting documentation

## Commit
`cabfdbc` - feat: add Swagger API documentation
