import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('media')
export class MediaProcessor extends WorkerHost {
  private readonly logger = new Logger(MediaProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.log(`Process media job ${job.id} (${job.name})`);
  }
}
