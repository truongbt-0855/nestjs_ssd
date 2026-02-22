import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PrismaTransactionService } from '../../common/prisma/prisma-transaction.service';
import { PurchaseCourseDto, PurchaseCourseResponseDto } from './dto/purchase-course.dto';
import { PurchaseCompletedEvent } from './events/purchase-completed.event';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: PrismaTransactionService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async purchase(studentId: string, dto: PurchaseCourseDto): Promise<PurchaseCourseResponseDto> {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: { wallet: true },
    });

    if (!student || student.role !== 'STUDENT') {
      throw new NotFoundException('Student not found');
    }

    if (!student.wallet) {
      throw new BadRequestException('Student wallet not found');
    }

    const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (!course.published) {
      throw new BadRequestException('Course is not published');
    }

    const existedEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId: dto.courseId,
        },
      },
    });

    if (existedEnrollment) {
      return {
        success: true,
        message: 'Bạn đã sở hữu khóa học này',
      };
    }

    if (student.wallet.balance.lessThan(course.price)) {
      throw new BadRequestException('Số dư ví không đủ để mua khóa học');
    }

    await this.transactionService.runInTransaction(async (tx) => {
      await tx.wallet.update({
        where: { userId: studentId },
        data: { balance: { decrement: course.price } },
      });

      await tx.enrollment.create({
        data: {
          userId: studentId,
          courseId: dto.courseId,
        },
      });

      await tx.purchaseTransaction.create({
        data: {
          userId: studentId,
          courseId: dto.courseId,
          amount: new Prisma.Decimal(course.price),
          status: 'SUCCESS',
        },
      });
    });

    this.eventEmitter.emit(
      'order.purchase.completed',
      new PurchaseCompletedEvent(studentId, dto.courseId, course.price.toString()),
    );

    return {
      success: true,
      message: 'Mua khóa học thành công',
    };
  }
}
