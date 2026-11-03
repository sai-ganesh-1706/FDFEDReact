import { UsersModule } from '../users/users.module';
import { Module, forwardRef } from '@nestjs/common';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './referrals.service';
import { ReferralsRepository } from './referrals.repository';
import { OpportunitiesModule } from '../opportunities/opportunities.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [OpportunitiesModule, NotificationsModule, UsersModule, forwardRef(() => ApplicationsModule)],
  controllers: [ReferralsController],
  providers: [ReferralsService, ReferralsRepository],
  exports: [ReferralsService, ReferralsRepository],
})
export class ReferralsModule {}
