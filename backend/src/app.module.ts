import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CourseModule } from './modules/course/course.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [AuthModule, CourseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
