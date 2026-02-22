import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
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
  constructor(private readonly prisma: PrismaService) {}

  async create(courseId: string, dto: CreateLessonDto): Promise<LessonItem> {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const created = await this.prisma.lesson.create({
      data: {
        courseId,
        title: dto.title,
        videoUrl: dto.videoUrl,
        order: dto.order,
      },
    });

    return {
      id: created.id,
      courseId: created.courseId,
      title: created.title,
      videoUrl: created.videoUrl ?? undefined,
      order: created.order,
    };
  }

  async findByCourse(
    courseId: string,
    query: LessonCursorQueryDto,
    viewer: { userId: string; role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT' },
  ): Promise<CursorPage<LessonItem>> {
    if (viewer.role === 'STUDENT') {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: viewer.userId,
            courseId,
          },
        },
      });

      if (!enrollment) {
        throw new ForbiddenException('Bạn chưa sở hữu khóa học này');
      }
    }

    const limit = Number(query.limit ?? '10');
    const items = await this.prisma.lesson.findMany({
      where: { courseId },
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });

    const sliced = items.slice(0, limit);
    const data = sliced.map((lesson) => ({
      id: lesson.id,
      courseId: lesson.courseId,
      title: lesson.title,
      videoUrl: lesson.videoUrl ?? undefined,
      order: lesson.order,
    }));

    const nextCursor = items.length > limit ? items[limit].id : null;
    return { data, nextCursor };
  }

  async update(id: string, dto: UpdateLessonDto): Promise<LessonItem> {
    const existing = await this.prisma.lesson.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Lesson not found');
    }

    const updated = await this.prisma.lesson.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.videoUrl !== undefined ? { videoUrl: dto.videoUrl } : {}),
      },
    });

    return {
      id: updated.id,
      courseId: updated.courseId,
      title: updated.title,
      videoUrl: updated.videoUrl ?? undefined,
      order: updated.order,
    };
  }
}
