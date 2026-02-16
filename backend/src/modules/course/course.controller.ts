import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Patch,
  Delete, 
  Body, 
  Param, 
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role, CourseStatus } from '@prisma/client';

@ApiTags('courses')
@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.INSTRUCTOR)
@ApiBearerAuth('JWT-auth')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Public()
  @Get('published')
  @ApiOperation({ summary: 'Get all published courses', description: 'Public endpoint - no authentication required' })
  @ApiResponse({ status: 200, description: 'Published courses retrieved successfully' })
  async findAllPublished() {
    const courses = await this.courseService.findAllPublished();
    return { data: courses, message: 'Published courses retrieved successfully' };
  }

  @Post()
  @ApiOperation({ summary: 'Create new course', description: 'Only INSTRUCTOR role can create courses' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - INSTRUCTOR role required' })
  async create(
    @CurrentUser() user: any,
    @Body() createCourseDto: CreateCourseDto,
  ) {
    const course = await this.courseService.create(user.id, createCourseDto);
    return { data: course, message: 'Course created successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses owned by current instructor', description: 'Returns courses created by the authenticated instructor' })
  @ApiResponse({ status: 200, description: 'Courses retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@CurrentUser() user: any) {
    const courses = await this.courseService.findAll(user.id);
    return { data: courses, message: 'Courses retrieved successfully' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID', description: 'Get single course details by UUID' })
  @ApiParam({ name: 'id', description: 'Course UUID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Course retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    const course = await this.courseService.findOne(id, user.id);
    return { data: course, message: 'Course retrieved successfully' };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update course', description: 'Update course details by UUID' })
  @ApiParam({ name: 'id', description: 'Course UUID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the course owner' })
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    const course = await this.courseService.update(id, user.id, updateCourseDto);
    return { data: course, message: 'Course updated successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete course', description: 'Permanently delete course by UUID' })
  @ApiParam({ name: 'id', description: 'Course UUID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the course owner' })
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    await this.courseService.remove(id, user.id);
    return { data: null, message: 'Course deleted successfully' };
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish course', description: 'Change course status to PUBLISHED' })
  @ApiParam({ name: 'id', description: 'Course UUID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Course published successfully' })
  async publish(@CurrentUser() user: any, @Param('id') id: string) {
    const course = await this.courseService.updateStatus(id, user.id, CourseStatus.PUBLISHED);
    return { data: course, message: 'Course published successfully' };
  }

  @Patch(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish course', description: 'Change course status to DRAFT' })
  @ApiParam({ name: 'id', description: 'Course UUID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Course unpublished successfully' })
  async unpublish(@CurrentUser() user: any, @Param('id') id: string) {
    const course = await this.courseService.updateStatus(id, user.id, CourseStatus.DRAFT);
    return { data: course, message: 'Course unpublished successfully' };
  }
}
