import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReferralDto {
  @ApiProperty({ example: 1, description: 'Opportunity ID for the referral' })
  @IsNumber()
  opportunityId: number;

  @ApiPropertyOptional({ example: 1, description: 'Candidate user ID' })
  @IsOptional()
  @IsNumber()
  candidateId?: number;

  @ApiPropertyOptional({ example: 'Sneha Reddy', description: 'Alumni name to request from' })
  @IsOptional()
  @IsString()
  alumniName?: string;

  @ApiPropertyOptional({ example: 7, description: 'Alumni user ID' })
  @IsOptional()
  @IsNumber()
  alumniId?: number;

  @ApiProperty({ example: 'Hi, I am applying for this role and would love a referral.' })
  @IsString()
  userMessage: string;

  // Extra fields forwarded from the frontend
  @IsOptional() @IsString() candidateName?: string;
  @IsOptional() @IsString() candidateInitials?: string;
  @IsOptional() @IsString() alumniInitials?: string;
  @IsOptional() @IsString() alumniAvatarColor?: string;
  @IsOptional() @IsString() alumniCompany?: string;
  @IsOptional() @IsString() alumniBatch?: string;
  @IsOptional() @IsString() appliedRole?: string;
  @IsOptional() @IsString() appliedCompany?: string;
  @IsOptional() @IsString() requestedDate?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() department?: string;
  @IsOptional() @IsNumber() cgpa?: number;
  @IsOptional() @IsNumber() applicationId?: number;
}
