import { Module } from '@nestjs/common';
import { FeaturesController } from './features.controller';
import { FeaturesRepository } from './features.repository';
import { CollegesModule } from '../colleges/colleges.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [CollegesModule, UsersModule, NotificationsModule],
  controllers: [FeaturesController],
  providers: [FeaturesRepository],
  exports: [FeaturesRepository],
})
export class FeaturesModule {}
