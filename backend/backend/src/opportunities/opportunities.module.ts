import { Module } from '@nestjs/common';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { OpportunitiesRepository } from './opportunities.repository';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [UsersModule, NotificationsModule],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService, OpportunitiesRepository],
  exports: [OpportunitiesService, OpportunitiesRepository],
})
export class OpportunitiesModule {}
