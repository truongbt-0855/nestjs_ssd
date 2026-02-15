import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.INSTRUCTOR)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Public()
  @Get('published')
  async findAllPublished() {
    const courses = await this.courseService.findAllPublished();
    return { data: courses, message: 'Published courses retrieved successfully' };
  }

  @Post()
  async create(
    @CurrentUser() user: any,
    @Body() createCourseDto: CreateCourseDto,
  ) {
    const course = await this.courseService.create(user.id, createCourseDto);
    return { data: course, message: 'Course created successfully' };
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    const courses = await this.courseService.findAll(user.id);
    return { data: courses, message: 'Courses retrieved successfully' };
  }

  @Get(':id')
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    const course = await this.courseService.findOne(id, user.id);
    return { data: course, message: 'Course retrieved successfully' };
  }

  @Put(':id')
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
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    await this.courseService.remove(id, user.id);
    return { data: null, message: 'Course deleted successfully' };
  }
}
