import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { LessonVideoUploadedListener } from './listeners/lesson-video-uploaded.listener';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';

@Module({
  imports: [MediaModule],
  controllers: [LessonsController],
  providers: [LessonsService, LessonVideoUploadedListener],
  exports: [LessonsService],
})
export class LessonsModule {}
