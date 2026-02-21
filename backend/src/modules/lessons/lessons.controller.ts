import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLessonDto, LessonCursorQueryDto, UpdateLessonDto } from './dto/lesson.dto';
import { LessonsService } from './lessons.service';

@ApiTags('lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('courses/:courseId/lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  async create(@Param('courseId') courseId: string, @Body() dto: CreateLessonDto): Promise<unknown> {
    return this.lessonsService.create(courseId, dto);
  }

  @Get()
  async findByCourse(
    @Param('courseId') courseId: string,
    @Query() query: LessonCursorQueryDto,
  ): Promise<unknown> {
    return this.lessonsService.findByCourse(courseId, query);
  }

  @Patch(':lessonId')
  async update(@Param('lessonId') lessonId: string, @Body() dto: UpdateLessonDto): Promise<unknown> {
    return this.lessonsService.update(lessonId, dto);
  }
}
