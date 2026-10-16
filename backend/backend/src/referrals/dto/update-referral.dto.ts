import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReferralDto {
  @ApiPropertyOptional({ example: 'Approved', enum: ['Approved', 'Pending', 'Rejected', 'approved', 'declined', 'pending'] })
  @IsOptional()
  @IsIn(['Approved', 'Pending', 'Rejected', 'approved', 'declined', 'pending'])
  status?: string;

  @ApiPropertyOptional({ example: 'Arjun is a strong candidate. Happy to refer him.' })
  @IsOptional()
  @IsString()
  alumniResponse?: string;
}
