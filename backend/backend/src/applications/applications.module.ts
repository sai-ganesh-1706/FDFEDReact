import { Module, forwardRef } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { ApplicationsRepository } from './applications.repository';
import { OpportunitiesModule } from '../opportunities/opportunities.module';
import { AssessmentsModule } from '../assessments/assessments.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { ReferralsModule } from '../referrals/referrals.module';

@Module({
  imports: [OpportunitiesModule, forwardRef(() => AssessmentsModule), NotificationsModule, UsersModule, ReferralsModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService, ApplicationsRepository],
  exports: [ApplicationsService, ApplicationsRepository],
})
export class ApplicationsModule {}

