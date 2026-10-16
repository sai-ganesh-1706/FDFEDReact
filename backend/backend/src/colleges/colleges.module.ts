import { Module } from '@nestjs/common';
import { CollegesController } from './colleges.controller';
import { CollegesService } from './colleges.service';
import { CollegesRepository } from './colleges.repository';

@Module({
  controllers: [CollegesController],
  providers: [CollegesService, CollegesRepository],
  exports: [CollegesService, CollegesRepository],
})
export class CollegesModule {}
