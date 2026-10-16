import { PartialType } from '@nestjs/swagger';
import { CreateRecruiterDto } from './create-recruiter.dto';
import { IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRecruiterDto extends PartialType(CreateRecruiterDto) {
  @ApiPropertyOptional({ example: 'active', enum: ['active', 'pending', 'declined'] })
  @IsOptional()
  @IsIn(['active', 'pending', 'declined'])
  status?: string;
}
