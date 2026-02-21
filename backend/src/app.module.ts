import { Module } from '@nestjs/common';
import { EventsModule } from './common/events/events.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { QueueModule } from './common/queue/queue.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { MediaModule } from './modules/media/media.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrdersModule } from './modules/orders/orders.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    PrismaModule,
    EventsModule,
    QueueModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    LessonsModule,
    OrdersModule,
    NotificationsModule,
    MediaModule,
    AdminModule,
  ],
})
export class AppModule {}
