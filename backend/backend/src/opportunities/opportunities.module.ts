import { Module } from '@nestjs/common';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { OpportunitiesRepository } from './opportunities.repository';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ApplicationsRepository } from '../applications/applications.repository';

@Module({
  imports: [UsersModule, NotificationsModule],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService, OpportunitiesRepository, ApplicationsRepository],
  exports: [OpportunitiesService, OpportunitiesRepository, ApplicationsRepository],
})
export class OpportunitiesModule {}
