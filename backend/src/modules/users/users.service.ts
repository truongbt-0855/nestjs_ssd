import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  balance: string;
}

export interface PurchasedCourseItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  enrolledAt: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      balance: user.wallet?.balance.toString() ?? '0.00',
    };
  }

  async getPurchasedCourses(userId: string): Promise<PurchasedCourseItem[]> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const courseIds = enrollments.map((enrollment) => enrollment.courseId);
    const courses = await this.prisma.course.findMany({
      where: { id: { in: courseIds } },
    });

    const transactions = await this.prisma.purchaseTransaction.findMany({
      where: {
        userId,
        status: 'SUCCESS',
        courseId: { in: courseIds },
      },
      orderBy: { createdAt: 'desc' },
    });

    const courseMap = new Map(courses.map((course) => [course.id, course]));
    const amountByCourseId = new Map<string, number>();
    for (const transaction of transactions) {
      if (!amountByCourseId.has(transaction.courseId)) {
        amountByCourseId.set(transaction.courseId, Number(transaction.amount));
      }
    }

    const result: PurchasedCourseItem[] = [];
    for (const enrollment of enrollments) {
      const course = courseMap.get(enrollment.courseId);
      if (!course) {
        continue;
      }

      result.push({
        id: course.id,
        title: course.title,
        description: course.description ?? undefined,
        price: amountByCourseId.get(course.id) ?? 0,
        enrolledAt: enrollment.createdAt.toISOString(),
      });
    }

    return result;
  }
}
