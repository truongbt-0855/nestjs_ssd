import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaTransactionService } from '../../common/prisma/prisma-transaction.service';
import { PurchaseCourseDto, PurchaseCourseResponseDto } from './dto/purchase-course.dto';
import { PurchaseCompletedEvent } from './events/purchase-completed.event';

@Injectable()
export class OrdersService {
  constructor(
    private readonly transactionService: PrismaTransactionService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async purchase(studentId: string, dto: PurchaseCourseDto): Promise<PurchaseCourseResponseDto> {
    await this.transactionService.runInTransaction(async () => {
      return Promise.resolve();
    });

    this.eventEmitter.emit(
      'order.purchase.completed',
      new PurchaseCompletedEvent(studentId, dto.courseId, '100.00'),
    );

    return {
      success: true,
      message: 'Mua khóa học thành công',
    };
  }
}
