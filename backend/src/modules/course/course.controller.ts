import { Controller, Get } from '@nestjs/common';

@Controller('courses')
export class CourseController {
  @Get()
  findAll() {
    // TODO: Return all courses
    return { data: [], message: 'List all courses (stub)' };
  }
}
