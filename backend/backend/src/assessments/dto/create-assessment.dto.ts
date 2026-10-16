import { IsString, IsNumber, IsBoolean, IsOptional, IsIn, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssessmentDto {
  @ApiProperty({ example: 'Coding Assessment — Round 1' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Software Engineer' })
  @IsString()
  role: string;

  @ApiProperty({ example: '2026-03-05' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '10:00 AM' })
  @IsString()
  time: string;

  @ApiProperty({ example: '90 minutes' })
  @IsString()
  duration: string;

  @ApiProperty({ example: 12 })
  @IsNumber()
  candidates: number;

  @ApiProperty({ example: 'HackerRank' })
  @IsString()
  platform: string;

  @ApiProperty({ example: 'https://hackerrank.com/test/x' })
  @IsString()
  link: string;

  @ApiProperty({ example: 'Online Test', enum: ['Online Test', 'Technical Interview', 'HR Interview', 'Group Discussion'] })
  @IsIn(['Online Test', 'Technical Interview', 'HR Interview', 'Group Discussion'])
  type: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;

  @ApiPropertyOptional({ example: 12, description: 'Schedule for ONE application (the candidate is notified directly)' })
  @IsOptional()
  @IsNumber()
  applicationId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Associated opportunity ID' })
  @IsOptional()
  @IsNumber()
  opportunityId?: number;
}
