import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CoursesService } from './courses.service';
import { CourseCursorQueryDto, CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

@ApiTags('courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  async create(@Body() dto: CreateCourseDto): Promise<unknown> {
    return this.coursesService.create(dto);
  }

  @Get()
  async findAll(@Query() query: CourseCursorQueryDto): Promise<unknown> {
    return this.coursesService.findAll(query);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCourseDto): Promise<unknown> {
    return this.coursesService.update(id, dto);
  }
}
