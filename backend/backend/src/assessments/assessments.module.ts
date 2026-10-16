import { Module, forwardRef } from '@nestjs/common';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';
import { AssessmentsRepository } from './assessments.repository';
import { ApplicationsModule } from '../applications/applications.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OpportunitiesModule } from '../opportunities/opportunities.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    forwardRef(() => ApplicationsModule), // forwardRef breaks the circular dep (ApplicationsModule → AssessmentsModule)
    NotificationsModule,
    OpportunitiesModule,
    UsersModule,
  ],
  controllers: [AssessmentsController],
  providers: [AssessmentsService, AssessmentsRepository],
  exports: [AssessmentsService, AssessmentsRepository],
})
export class AssessmentsModule {}
