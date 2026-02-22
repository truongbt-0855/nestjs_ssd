import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CursorPage } from '../../common/pagination/cursor-pagination.dto';
import { CourseCursorQueryDto, CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

interface CourseItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  published: boolean;
  createdAt: string;
}

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCourseDto): Promise<CourseItem> {
    const created = await this.prisma.course.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: new Prisma.Decimal(dto.price),
        published: dto.published ?? false,
      },
    });

    return {
      id: created.id,
      title: created.title,
      description: created.description ?? undefined,
      price: Number(created.price),
      published: created.published,
      createdAt: created.createdAt.toISOString(),
    };
  }

  async findAll(
    query: CourseCursorQueryDto,
    role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT',
  ): Promise<CursorPage<CourseItem>> {
    const limit = Number(query.limit ?? '10');

    const items = await this.prisma.course.findMany({
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      ...(role === 'STUDENT' ? { where: { published: true } } : {}),
      orderBy: { createdAt: 'desc' },
    });

    const sliced = items.slice(0, limit);
    const data: CourseItem[] = sliced.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description ?? undefined,
      price: Number(course.price),
      published: course.published,
      createdAt: course.createdAt.toISOString(),
    }));

    const nextCursor = items.length > limit ? items[limit].id : null;
    return { data, nextCursor };
  }

  async update(id: string, dto: UpdateCourseDto): Promise<CourseItem> {
    const existing = await this.prisma.course.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Course not found');
    }

    const updated = await this.prisma.course.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.published !== undefined ? { published: dto.published } : {}),
        ...(dto.price !== undefined ? { price: new Prisma.Decimal(dto.price) } : {}),
      },
    });

    return {
      id: updated.id,
      title: updated.title,
      description: updated.description ?? undefined,
      price: Number(updated.price),
      published: updated.published,
      createdAt: updated.createdAt.toISOString(),
    };
  }
}
