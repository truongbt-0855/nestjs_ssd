import { Injectable, NotFoundException } from '@nestjs/common';
import { CursorPage } from '../../common/pagination/cursor-pagination.dto';
import { CourseCursorQueryDto, CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

interface CourseItem {
  id: string;
  title: string;
  description?: string;
  published: boolean;
  createdAt: string;
}

@Injectable()
export class CoursesService {
  private readonly courses: CourseItem[] = [];

  async create(dto: CreateCourseDto): Promise<CourseItem> {
    const item: CourseItem = {
      id: crypto.randomUUID(),
      title: dto.title,
      description: dto.description,
      published: false,
      createdAt: new Date().toISOString(),
    };
    this.courses.unshift(item);
    return item;
  }

  async findAll(query: CourseCursorQueryDto): Promise<CursorPage<CourseItem>> {
    const limit = Number(query.limit ?? '10');
    const startIndex = query.cursor ? this.courses.findIndex((course) => course.id === query.cursor) + 1 : 0;
    const data = this.courses.slice(Math.max(startIndex, 0), Math.max(startIndex, 0) + limit);
    const nextCursor = data.length === limit ? data[data.length - 1].id : null;
    return { data, nextCursor };
  }

  async update(id: string, dto: UpdateCourseDto): Promise<CourseItem> {
    const index = this.courses.findIndex((course) => course.id === id);
    if (index < 0) {
      throw new NotFoundException('Course not found');
    }

    const updated: CourseItem = {
      ...this.courses[index],
      ...dto,
    };

    this.courses[index] = updated;
    return updated;
  }
}
