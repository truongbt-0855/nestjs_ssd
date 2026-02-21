import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationsService {
  constructor(@InjectQueue('notifications') private readonly notificationsQueue: Queue) {}

  async enqueuePurchaseEmail(payload: {
    studentId: string;
    courseId: string;
    amount: string;
  }): Promise<void> {
    await this.notificationsQueue.add('send-purchase-email', payload, {
      attempts: 3,
      removeOnComplete: true,
    });
  }
}
