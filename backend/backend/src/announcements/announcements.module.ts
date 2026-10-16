import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsRepository } from './announcements.repository';

@Module({
  imports: [UsersModule, NotificationsModule],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsRepository],
})
export class AnnouncementsModule {}
