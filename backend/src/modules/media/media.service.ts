import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class MediaService {
  constructor(@InjectQueue('media') private readonly mediaQueue: Queue) {}

  async enqueueCompression(payload: { lessonId: string; videoUrl?: string }): Promise<void> {
    await this.mediaQueue.add('compress-video', payload, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: true,
    });
  }
}
