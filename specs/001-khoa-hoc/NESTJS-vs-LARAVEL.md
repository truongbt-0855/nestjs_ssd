# NestJS vs Laravel - So sánh chi tiết cho Laravel Developer

> Tài liệu so sánh **NestJS + TypeScript + Prisma + PostgreSQL** với **Laravel + PHP + Eloquent + MySQL**

---

## 📚 Mục lục

1. [Tổng quan Architecture](#1-tổng-quan-architecture)
2. [Dependency Injection (DI)](#2-dependency-injection-di)
3. [ORM - Prisma vs Eloquent](#3-orm---prisma-vs-eloquent)
4. [Controllers & Routing](#4-controllers--routing)
5. [Authentication & Guards](#5-authentication--guards)
6. [Middleware](#6-middleware)
7. [DTOs & Validation](#7-dtos--validation)
8. [Database Migrations](#8-database-migrations)
9. [TypeScript vs PHP](#9-typescript-vs-php)
10. [Module System](#10-module-system)

---

## 1. Tổng quan Architecture

### Laravel (MVC)
```
app/
├── Http/
│   ├── Controllers/     # Controllers
│   ├── Middleware/      # Middleware
│   └── Requests/        # Form Requests (Validation)
├── Models/              # Eloquent Models
├── Services/            # Business Logic (optional)
└── Providers/           # Service Providers
```

### NestJS (Modular Architecture)
```
src/
├── modules/
│   ├── course/
│   │   ├── course.module.ts       # Module definition
│   │   ├── course.controller.ts   # Routes & handlers
│   │   ├── course.service.ts      # Business logic
│   │   └── dto/                   # Data Transfer Objects
│   └── auth/
│       ├── auth.module.ts
│       ├── auth.controller.ts
│       ├── auth.service.ts
│       └── strategies/            # Passport strategies
├── common/
│   ├── guards/                    # Guards (= Middleware)
│   ├── decorators/                # Custom decorators
│   └── filters/                   # Exception filters
└── services/
    └── prisma.service.ts          # Prisma client
```

**Điểm khác biệt:**
- **Laravel**: MVC traditional, tất cả controller trong 1 folder
- **NestJS**: Modular, mỗi feature là 1 module riêng (giống cấu trúc microservices)

---

## 2. Dependency Injection (DI)

### Laravel - Service Container

```php
// Laravel: Inject qua constructor
class CourseController extends Controller
{
    protected $courseService;
    
    public function __construct(CourseService $courseService)
    {
        $this->courseService = $courseService;
    }
    
    public function index()
    {
        return $this->courseService->getAllCourses();
    }
}

// Register service in AppServiceProvider
public function register()
{
    $this->app->bind(CourseService::class, function ($app) {
        return new CourseService();
    });
}
```

### NestJS - Built-in DI Container

```typescript
// NestJS: Inject qua constructor (tương tự Laravel)
@Injectable()  // ← Decorator đánh dấu class có thể inject
export class CourseService {
  constructor(private prisma: PrismaService) {}  // ← Auto inject
  
  async getAllCourses() {
    return this.prisma.course.findMany();
  }
}

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}  // ← Auto inject
  
  @Get()
  async index() {
    return this.courseService.getAllCourses();
  }
}

// Register trong module
@Module({
  controllers: [CourseController],
  providers: [CourseService, PrismaService],  // ← Tự động DI
})
export class CourseModule {}
```

**So sánh:**
| Laravel | NestJS |
|---------|---------|
| Cần register trong `AppServiceProvider` | Chỉ cần thêm vào `providers` array |
| Dùng `$this->` để access | Dùng `this.` (TypeScript) |
| Type-hint trong constructor | TypeScript auto type checking |

---

## 3. ORM - Prisma vs Eloquent

### Laravel Eloquent (Active Record)

```php
// Model
class Course extends Model
{
    protected $fillable = ['title', 'description', 'owner_id'];
    
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}

// Query
$courses = Course::where('status', 'published')
    ->with('owner')
    ->orderBy('created_at', 'desc')
    ->get();

// Create
$course = Course::create([
    'title' => 'Laravel Course',
    'description' => 'Learn Laravel',
    'owner_id' => $userId,
]);

// Update
$course->update(['status' => 'published']);

// Delete
$course->delete();
```

### NestJS Prisma (Data Mapper)

```typescript
// Schema (schema.prisma) - thay vì Model class
model Course {
  id          String   @id @default(uuid())
  title       String
  description String?
  status      CourseStatus @default(DRAFT)
  ownerId     String
  owner       User     @relation("InstructorCourses", fields: [ownerId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Service (Business Logic)
@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  // Query
  async findAllPublished() {
    return this.prisma.course.findMany({
      where: { status: CourseStatus.PUBLISHED },
      include: { owner: true },  // ← như .with() trong Laravel
      orderBy: { createdAt: 'desc' },
    });
  }

  // Create
  async create(userId: string, data: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        ownerId: userId,
      },
    });
  }

  // Update
  async update(id: string, data: UpdateCourseDto) {
    return this.prisma.course.update({
      where: { id },
      data,
    });
  }

  // Delete
  async remove(id: string) {
    return this.prisma.course.delete({
      where: { id },
    });
  }
}
```

**So sánh chi tiết:**

| Feature | Laravel Eloquent | NestJS Prisma |
|---------|-----------------|---------------|
| **Pattern** | Active Record | Data Mapper |
| **Model** | PHP Class extends Model | Schema file (.prisma) |
| **Type Safety** | Không (runtime only) | ✅ Full TypeScript support |
| **Query Builder** | Fluent, chainable | Object-based |
| **Relationships** | `hasMany()`, `belongsTo()` | Defined in schema |
| **Eager Loading** | `->with('relation')` | `include: { relation: true }` |
| **Where** | `->where('status', 'published')` | `where: { status: 'PUBLISHED' }` |
| **Auto-completion** | ❌ No | ✅ Yes (TypeScript) |

**Ví dụ quan hệ:**

```php
// Laravel Eloquent
class User extends Model {
    public function courses() {
        return $this->hasMany(Course::class, 'owner_id');
    }
}

$user = User::with('courses')->find($id);
```

```typescript
// Prisma Schema
model User {
  id      String   @id @default(uuid())
  courses Course[] @relation("InstructorCourses")
}

model Course {
  id      String @id @default(uuid())
  ownerId String
  owner   User   @relation("InstructorCourses", fields: [ownerId], references: [id])
}

// Query
const user = await this.prisma.user.findUnique({
  where: { id },
  include: { courses: true },
});
```

---

## 4. Controllers & Routing

### Laravel Routes + Controller

```php
// routes/api.php
Route::prefix('courses')->group(function () {
    Route::get('published', [CourseController::class, 'published']); // Public
    
    Route::middleware(['auth:sanctum', 'role:instructor'])->group(function () {
        Route::get('/', [CourseController::class, 'index']);
        Route::post('/', [CourseController::class, 'store']);
        Route::get('/{id}', [CourseController::class, 'show']);
        Route::put('/{id}', [CourseController::class, 'update']);
        Route::delete('/{id}', [CourseController::class, 'destroy']);
        Route::patch('/{id}/publish', [CourseController::class, 'publish']);
    });
});

// app/Http/Controllers/CourseController.php
class CourseController extends Controller
{
    public function index()
    {
        $courses = auth()->user()->courses;
        return response()->json(['data' => $courses]);
    }
    
    public function store(CreateCourseRequest $request)
    {
        $course = auth()->user()->courses()->create($request->validated());
        return response()->json(['data' => $course], 201);
    }
}
```

### NestJS Controller (Decorator-based routing)

```typescript
// course.controller.ts - Routes DEFINED IN CONTROLLER
@ApiTags('courses')
@Controller('courses')  // ← Prefix: /courses
@UseGuards(JwtAuthGuard, RolesGuard)  // ← Global guard cho controller
@Roles(Role.INSTRUCTOR)  // ← Require INSTRUCTOR role
@ApiBearerAuth('JWT-auth')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Public()  // ← Override guard, cho phép public access
  @Get('published')  // ← GET /courses/published
  async findAllPublished() {
    const courses = await this.courseService.findAllPublished();
    return { data: courses, message: 'Published courses retrieved' };
  }

  @Get()  // ← GET /courses
  async findAll(@CurrentUser() user: any) {  // ← Custom decorator lấy user
    const courses = await this.courseService.findAll(user.id);
    return { data: courses };
  }

  @Post()  // ← POST /courses
  async create(
    @CurrentUser() user: any,
    @Body() createCourseDto: CreateCourseDto,  // ← Auto validate
  ) {
    const course = await this.courseService.create(user.id, createCourseDto);
    return { data: course, message: 'Course created' };
  }

  @Put(':id')  // ← PUT /courses/:id
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,  // ← Lấy param từ URL
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    const course = await this.courseService.update(id, user.id, updateCourseDto);
    return { data: course };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)  // ← Custom status code
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    await this.courseService.remove(id, user.id);
    return { message: 'Course deleted' };
  }

  @Patch(':id/publish')  // ← PATCH /courses/:id/publish
  async publish(@CurrentUser() user: any, @Param('id') id: string) {
    const course = await this.courseService.updateStatus(id, user.id, CourseStatus.PUBLISHED);
    return { data: course };
  }
}
```

**So sánh:**

| Laravel | NestJS |
|---------|---------|
| Routes trong file riêng `routes/api.php` | Routes TRONG controller (decorators) |
| `Route::get('/path', [Controller::class, 'method'])` | `@Get('/path')` decorator |
| `$request->input('field')` | `@Body() dto: CreateDto` |
| `$request->route('id')` | `@Param('id') id: string` |
| `auth()->user()` | `@CurrentUser() user: User` |
| `middleware(['auth', 'role'])` | `@UseGuards(JwtAuthGuard, RolesGuard)` |
| Request validation riêng | Auto validate qua DTO class |

**Decorators trong NestJS:**
- `@Controller('path')` - Định nghĩa controller với prefix
- `@Get()`, `@Post()`, `@Put()`, `@Delete()`, `@Patch()` - HTTP methods
- `@Param('name')` - Lấy route parameter
- `@Body()` - Lấy request body (tự động validate)
- `@Query()` - Lấy query string
- `@CurrentUser()` - Custom decorator lấy user từ request
- `@UseGuards()` - Apply guards (middleware)
- `@Roles()` - Custom decorator check role

---

## 5. Authentication & Guards

### Laravel - Middleware + Sanctum

```php
// app/Http/Middleware/Authenticate.php
class Authenticate extends Middleware
{
    protected function redirectTo($request)
    {
        if (!$request->expectsJson()) {
            return route('login');
        }
    }
}

// app/Http/Middleware/CheckRole.php
class CheckRole
{
    public function handle($request, Closure $next, $role)
    {
        if (auth()->user()->role !== $role) {
            abort(403, 'Forbidden');
        }
        return $next($request);
    }
}

// routes/api.php
Route::middleware(['auth:sanctum', 'role:instructor'])->group(function () {
    Route::get('/courses', [CourseController::class, 'index']);
});

// Controller
class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
        
        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }
        
        $user = auth()->user();
        $token = $user->createToken('auth_token')->plainTextToken;
        
        return response()->json([
            'access_token' => $token,
            'user' => $user,
        ]);
    }
}
```

### NestJS - Guards + Passport JWT

```typescript
// ============================================
// 1. JWT Strategy (tương tự Sanctum guard)
// ============================================
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // Validate user từ DB (tự động gọi khi có token)
    return this.authService.validateUser(payload);
  }
}

// ============================================
// 2. JWT Auth Guard (middleware check token)
// ============================================
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;  // Skip authentication
    }
    return super.canActivate(context);  // Validate JWT
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new UnauthorizedException('Authentication required');
    }
    return user;  // Attach user to request
  }
}

// ============================================
// 3. Roles Guard (check user role)
// ============================================
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;  // No role required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;  // From JwtAuthGuard

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

// ============================================
// 4. Custom Decorators
// ============================================
// @Public() - Mark route as public
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// @Roles() - Set required roles
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

// @CurrentUser() - Get current user
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// ============================================
// 5. Auth Service & Controller
// ============================================
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcryptjs.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return { access_token, user };
  }

  async validateUser(payload: any) {
    return this.prisma.user.findUnique({ where: { id: payload.sub } });
  }
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    const result = await this.authService.login(body.email, body.password);
    return { data: result, message: 'Login successful' };
  }
}

// ============================================
// 6. Sử dụng trong Controller
// ============================================
@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)  // ← Apply guards globally
@Roles(Role.INSTRUCTOR)  // ← Require INSTRUCTOR role
export class CourseController {
  @Public()  // ← Override, cho phép truy cập public
  @Get('published')
  async getPublished() {
    // No authentication needed
  }

  @Get()  // ← Require JWT + INSTRUCTOR role
  async getMyCourses(@CurrentUser() user: User) {
    // user được inject tự động từ JWT
  }
}
```

**Flow so sánh:**

```mermaid
graph LR
    A[Request] --> B{JwtAuthGuard}
    B -->|@Public| C[Allow]
    B -->|No token| D[401 Unauthorized]
    B -->|Valid token| E{RolesGuard}
    E -->|Has role| F[Controller]
    E -->|No role| G[403 Forbidden]
```

**So sánh:**

| Laravel | NestJS |
|---------|---------|
| `auth:sanctum` middleware | `JwtAuthGuard` |
| `role:instructor` middleware | `RolesGuard` + `@Roles()` decorator |
| `auth()->user()` | `@CurrentUser()` decorator |
| `Auth::attempt()` | `bcryptjs.compare()` + `jwtService.sign()` |
| Personal Access Token | JWT Token |

---

## 6. Middleware

### Laravel Middleware

```php
// app/Http/Middleware/FormatApiResponse.php
class FormatApiResponse
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);
        
        // Modify response
        $data = $response->getData(true);
        $formatted = [
            'success' => true,
            'data' => $data,
            'timestamp' => now(),
        ];
        
        $response->setData($formatted);
        return $response;
    }
}

// app/Http/Kernel.php
protected $middleware = [
    \App\Http\Middleware\FormatApiResponse::class,
];
```

### NestJS Middleware & Interceptor

```typescript
// ============================================
// Middleware (giống Laravel middleware)
// ============================================
@Injectable()
export class ApiResponseFormatMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Chỉ modify request, không modify response
    console.log(`[${req.method}] ${req.url}`);
    next();
  }
}

// Apply trong AppModule
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiResponseFormatMiddleware)
      .forRoutes('*');  // Apply cho tất cả routes
  }
}

// ============================================
// Interceptor (modify response - khuyên dùng trong NestJS)
// ============================================
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

// Apply global
app.useGlobalInterceptors(new TransformInterceptor());

// ============================================
// Exception Filter (catch exceptions)
// ============================================
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

// Apply global
app.useGlobalFilters(new AllExceptionsFilter());
```

**So sánh:**

| Laravel | NestJS |
|---------|---------|
| Middleware | Middleware (modify request) |
| - | **Interceptor** (modify response) ⭐ |
| Exception Handler | **Exception Filter** |
| `$next($request)` | `next.handle()` (RxJS Observable) |

---

## 7. DTOs & Validation

### Laravel - Form Request

```php
// app/Http/Requests/CreateCourseRequest.php
class CreateCourseRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }
    
    public function rules()
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ];
    }
    
    public function messages()
    {
        return [
            'title.required' => 'Course title is required',
        ];
    }
}

// Controller
public function store(CreateCourseRequest $request)
{
    $validated = $request->validated();  // Auto validate
    $course = Course::create($validated);
    return response()->json($course, 201);
}
```

### NestJS - DTO with class-validator

```typescript
// dto/create-course.dto.ts
export class CreateCourseDto {
  @ApiProperty({
    description: 'Course title',
    example: 'NestJS Advanced Course',
  })
  @IsString()
  @IsNotEmpty({ message: 'Course title is required' })
  title: string;

  @ApiProperty({
    description: 'Course description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

// Controller - Auto validate
@Post()
async create(@Body() createCourseDto: CreateCourseDto) {
  // createCourseDto đã được validate tự động
  return this.courseService.create(createCourseDto);
}

// main.ts - Enable validation globally
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,  // Loại bỏ fields không có trong DTO
    forbidNonWhitelisted: true,  // Throw error nếu có field thừa
    transform: true,  // Auto transform types (string -> number)
  }),
);
```

**Common validators:**

| Laravel | NestJS (class-validator) |
|---------|--------------------------|
| `required` | `@IsNotEmpty()` |
| `string` | `@IsString()` |
| `email` | `@IsEmail()` |
| `min:6` | `@MinLength(6)` |
| `max:255` | `@MaxLength(255)` |
| `nullable` | `@IsOptional()` |
| `integer` | `@IsInt()` |
| `boolean` | `@IsBoolean()` |
| `in:draft,published` | `@IsEnum(CourseStatus)` |
| `unique:users,email` | Custom validator |

---

## 8. Database Migrations

### Laravel Migrations

```php
// database/migrations/2024_01_01_000000_create_courses_table.php
public function up()
{
    Schema::create('courses', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->string('title');
        $table->text('description')->nullable();
        $table->enum('status', ['draft', 'published'])->default('draft');
        $table->foreignUuid('owner_id')->constrained('users');
        $table->timestamps();
    });
}

public function down()
{
    Schema::dropIfExists('courses');
}

// Run migration
php artisan migrate
php artisan migrate:rollback
```

### Prisma Migrations

```prisma
// prisma/schema.prisma
model Course {
  id          String       @id @default(uuid())
  title       String
  description String?
  status      CourseStatus @default(DRAFT)
  ownerId     String
  owner       User         @relation("InstructorCourses", fields: [ownerId], references: [id])
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

enum CourseStatus {
  DRAFT
  PUBLISHED
}
```

```bash
# Generate migration từ schema
npx prisma migrate dev --name init

# Apply migration
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Generate Prisma Client (cập nhật types)
npx prisma generate
```

**Migration files được tạo tự động:**

```sql
-- prisma/migrations/20260215180551_init/migration.sql
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Course" ADD CONSTRAINT "Course_ownerId_fkey" 
    FOREIGN KEY ("ownerId") REFERENCES "User"("id");
```

**So sánh:**

| Laravel | Prisma |
|---------|---------|
| PHP migration files | `schema.prisma` (single source of truth) |
| `php artisan migrate` | `npx prisma migrate dev` |
| Manual SQL trong migration | Auto-generate SQL |
| `Schema::create()` | Prisma schema language |
| `php artisan migrate:rollback` | `prisma migrate reset` |

---

## 9. TypeScript vs PHP

### Type Safety

```php
// ❌ PHP - Không có type checking compile-time
function getCourse($id) {
    return Course::find($id);  // Có thể null, không warn
}

$course = getCourse(123);
echo $course->title;  // Runtime error nếu null
```

```typescript
// ✅ TypeScript - Type checking compile-time
async function getCourse(id: string): Promise<Course | null> {
  return this.prisma.course.findUnique({ where: { id } });
}

const course = await getCourse('123');
console.log(course.title);  // ❌ TS Error: Object is possibly 'null'

// Phải check null
if (course) {
  console.log(course.title);  // ✅ OK
}
```

### Async/Await vs Promises

```php
// PHP - Synchronous (blocking)
$user = User::find($userId);
$courses = $user->courses;
return response()->json($courses);
```

```typescript
// TypeScript - Asynchronous (non-blocking)
const user = await this.prisma.user.findUnique({
  where: { id: userId },
  include: { courses: true },
});
return user.courses;
```

### Interfaces & Types

```typescript
// Interface (giống contract trong PHP)
interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

// Type alias
type CourseStatus = 'DRAFT' | 'PUBLISHED';

// Generic type
async function findById<T>(id: string): Promise<T | null> {
  // ...
}
```

---

## 10. Module System

### Laravel - Service Providers

```php
// app/Providers/CourseServiceProvider.php
class CourseServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->bind(CourseService::class, function ($app) {
            return new CourseService();
        });
    }
    
    public function boot()
    {
        // Boot logic
    }
}

// config/app.php
'providers' => [
    App\Providers\CourseServiceProvider::class,
];
```

### NestJS - Modules

```typescript
// course.module.ts
@Module({
  imports: [PrismaModule],  // Import modules khác
  controllers: [CourseController],  // Controllers
  providers: [CourseService],  // Services (Injectable)
  exports: [CourseService],  // Export để modules khác dùng
})
export class CourseModule {}

// app.module.ts - Root module
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),  // Config global
    AuthModule,
    CourseModule,  // Import CourseModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Feature Module Pattern:**

```typescript
// Mỗi feature là 1 module riêng
courses/
├── course.module.ts      # Module definition
├── course.controller.ts  # Routes
├── course.service.ts     # Business logic
└── dto/                  # DTOs

auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
└── strategies/
```

---

## 📝 Tóm tắt chuyển đổi từ Laravel sang NestJS

| Khái niệm | Laravel | NestJS |
|-----------|---------|---------|
| **ORM** | Eloquent (Active Record) | Prisma (Data Mapper) |
| **Routing** | `routes/api.php` | Decorators trong Controller |
| **Middleware** | Middleware | Guards + Interceptors |
| **Validation** | Form Request | DTO + class-validator |
| **DI Container** | Service Container | Built-in DI |
| **Database** | MySQL | PostgreSQL |
| **Language** | PHP | TypeScript |
| **Request/Response** | `$request`, `response()` | `@Body()`, `@Param()`, return object |
| **Auth** | Sanctum | Passport JWT |
| **Migration** | Artisan commands | Prisma CLI |
| **Module** | Service Providers | `@Module()` decorator |

---

## 🎯 Key Takeaways

1. **NestJS = Laravel structure + TypeScript type safety**
2. **Prisma = Eloquent nhưng type-safe và schema-first**
3. **Guards = Middleware nhưng mạnh hơn**
4. **Decorators = Annotations (giống @Route trong Laravel)**
5. **Module system = Microservices-ready architecture**
6. **Everything is TypeScript = Catch errors at compile-time**

---

## 📚 Học tiếp

1. **Prisma**:
   - [Prisma Docs](https://www.prisma.io/docs)
   - [Prisma vs Eloquent](https://www.prisma.io/docs/concepts/more/comparisons/prisma-and-eloquent)

2. **NestJS**:
   - [NestJS Docs](https://docs.nestjs.com)
   - [NestJS Fundamentals](https://docs.nestjs.com/fundamentals)

3. **TypeScript**:
   - [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**Happy coding! 🚀**
