import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MediaService } from '../../media/media.service';

interface LessonVideoUploadedEvent {
  lessonId: string;
  videoUrl?: string;
}

@Injectable()
export class LessonVideoUploadedListener {
  constructor(private readonly mediaService: MediaService) {}

  @OnEvent('lesson.video.uploaded')
  async handle(event: LessonVideoUploadedEvent): Promise<void> {
    await this.mediaService.enqueueCompression({
      lessonId: event.lessonId,
      videoUrl: event.videoUrl,
    });
  }
}
