import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { RecruitersModule } from '../recruiters/recruiters.module';
import { CollegesModule } from '../colleges/colleges.module';

@Module({ imports: [RecruitersModule, CollegesModule], controllers: [ContactController] })
export class ContactModule {}
