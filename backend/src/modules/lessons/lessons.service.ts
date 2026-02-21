import { Injectable, NotFoundException } from '@nestjs/common';
import { CursorPage } from '../../common/pagination/cursor-pagination.dto';
import { CreateLessonDto, LessonCursorQueryDto, UpdateLessonDto } from './dto/lesson.dto';

interface LessonItem {
  id: string;
  courseId: string;
  title: string;
  videoUrl?: string;
  order: number;
}

@Injectable()
export class LessonsService {
  private readonly lessons: LessonItem[] = [];

  async create(courseId: string, dto: CreateLessonDto): Promise<LessonItem> {
    const item: LessonItem = {
      id: crypto.randomUUID(),
      courseId,
      title: dto.title,
      videoUrl: dto.videoUrl,
      order: dto.order,
    };

    this.lessons.push(item);
    return item;
  }

  async findByCourse(courseId: string, query: LessonCursorQueryDto): Promise<CursorPage<LessonItem>> {
    const limit = Number(query.limit ?? '10');
    const source = this.lessons
      .filter((lesson) => lesson.courseId === courseId)
      .sort((a, b) => a.order - b.order);

    const startIndex = query.cursor ? source.findIndex((lesson) => lesson.id === query.cursor) + 1 : 0;
    const data = source.slice(Math.max(startIndex, 0), Math.max(startIndex, 0) + limit);
    const nextCursor = data.length === limit ? data[data.length - 1].id : null;
    return { data, nextCursor };
  }

  async update(id: string, dto: UpdateLessonDto): Promise<LessonItem> {
    const index = this.lessons.findIndex((lesson) => lesson.id === id);
    if (index < 0) {
      throw new NotFoundException('Lesson not found');
    }

    const updated: LessonItem = {
      ...this.lessons[index],
      ...dto,
    };

    this.lessons[index] = updated;
    return updated;
  }
}
