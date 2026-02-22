import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { CoursesService } from './courses.service';
import { CourseCursorQueryDto, CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

@ApiTags('courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles('INSTRUCTOR')
  async create(@Body() dto: CreateCourseDto): Promise<unknown> {
    return this.coursesService.create(dto);
  }

  @Get()
  async findAll(
    @Query() query: CourseCursorQueryDto,
    @CurrentUser('role') role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT',
  ): Promise<unknown> {
    return this.coursesService.findAll(query, role);
  }

  @Patch(':id')
  @Roles('INSTRUCTOR')
  async update(@Param('id') id: string, @Body() dto: UpdateCourseDto): Promise<unknown> {
    return this.coursesService.update(id, dto);
  }
}
