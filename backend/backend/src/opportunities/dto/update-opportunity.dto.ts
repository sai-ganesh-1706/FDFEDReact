import { PartialType } from '@nestjs/swagger';
import { CreateOpportunityDto } from './create-opportunity.dto';
import { IsOptional, IsIn, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOpportunityDto extends PartialType(CreateOpportunityDto) {
  @ApiPropertyOptional({ example: 'Published', enum: ['Published', 'Draft', 'Closed', 'pending', 'approved', 'rejected'] })
  @IsOptional()
  @IsIn(['Published', 'Draft', 'Closed', 'pending', 'approved', 'rejected'])
  status?: string;

  @ApiPropertyOptional({ example: 'Eligibility criteria not met' })
  @IsOptional()
  rejectionRemark?: string;

  @ApiPropertyOptional({ example: 78 })
  @IsOptional()
  @IsNumber()
  applications?: number;
}
