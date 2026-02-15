import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseResponseDto } from './dto/course-response.dto';
import { CourseStatus } from '@prisma/client';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createCourseDto: CreateCourseDto): Promise<CourseResponseDto> {
    const course = await this.prisma.course.create({
      data: {
        title: createCourseDto.title,
        description: createCourseDto.description,
        ownerId: userId,
        status: CourseStatus.DRAFT,
      },
    });

    return course;
  }

  async findAll(userId: string): Promise<CourseResponseDto[]> {
    const courses = await this.prisma.course.findMany({
      where: {
        ownerId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return courses;
  }

  async findAllPublished(): Promise<CourseResponseDto[]> {
    const courses = await this.prisma.course.findMany({
      where: {
        status: CourseStatus.PUBLISHED,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return courses;
  }

  async findOne(id: string, userId: string): Promise<CourseResponseDto> {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    // Check ownership
    if (course.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to access this course');
    }

    return course;
  }

  async update(id: string, userId: string, updateCourseDto: UpdateCourseDto): Promise<CourseResponseDto> {
    // Check if course exists and user owns it
    await this.findOne(id, userId);

    const course = await this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
    });

    return course;
  }

  async remove(id: string, userId: string): Promise<void> {
    // Check if course exists and user owns it
    await this.findOne(id, userId);

    await this.prisma.course.delete({
      where: { id },
    });
  }
}
