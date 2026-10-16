import { Module } from '@nestjs/common';
import { RecruitersController } from './recruiters.controller';
import { RecruitersService } from './recruiters.service';
import { RecruitersRepository } from './recruiters.repository';

import { UsersModule } from '../users/users.module';
import { CollegesModule } from '../colleges/colleges.module';

@Module({
  imports: [UsersModule, CollegesModule],
  controllers: [RecruitersController],
  providers: [RecruitersService, RecruitersRepository],
  exports: [RecruitersService],
})
export class RecruitersModule {}
