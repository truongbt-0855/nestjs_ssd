import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../../notifications/notifications.service';
import { PurchaseCompletedEvent } from '../events/purchase-completed.event';

@Injectable()
export class PurchaseCompletedListener {
  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('order.purchase.completed')
  async handle(event: PurchaseCompletedEvent): Promise<void> {
    await this.notificationsService.enqueuePurchaseEmail({
      studentId: event.studentId,
      courseId: event.courseId,
      amount: event.amount,
    });
  }
}
