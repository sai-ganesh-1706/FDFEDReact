import { UsersModule } from '../users/users.module';
import { Module } from '@nestjs/common';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './referrals.service';
import { ReferralsRepository } from './referrals.repository';
import { OpportunitiesModule } from '../opportunities/opportunities.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [OpportunitiesModule, NotificationsModule, UsersModule],
  controllers: [ReferralsController],
  providers: [ReferralsService, ReferralsRepository],
  exports: [ReferralsService, ReferralsRepository],
})
export class ReferralsModule {}
