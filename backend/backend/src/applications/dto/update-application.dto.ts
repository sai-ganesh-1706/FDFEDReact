import { IsBoolean, IsIn, IsOptional, IsString, IsDateString, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateApplicationDto {
  @ApiPropertyOptional({ example: '2026-03-15' })
  @IsOptional()
  @IsDateString()
  interviewDate?: string;

  @ApiPropertyOptional({ example: 'Strong technical background' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({
    example: { technicalSkills: 4, problemSolving: 5 },
    description: 'Performance evaluation metrics (star ratings 1–5)',
  })
  @IsOptional()
  @IsObject()
  evaluation?: Record<string, number>;

  @IsOptional()
  @IsString()
  recruiterFeedback?: string;

  @IsOptional()
  @IsBoolean()
  feedbackSent?: boolean;

  @ApiPropertyOptional({
    example: { resume: 'Pass', assessment: 'Pass', technical: 'Pending', hr: 'Pending' },
    description: 'Round-by-round results updated by the recruiter',
  })
  @IsOptional()
  @IsObject()
  rounds?: {
    resume?: string;
    assessment?: string;
    technical?: string;
    hr?: string;
  };

  @ApiPropertyOptional({
    example: 'Interview',
    enum: ['Applied', 'Shortlisted', 'Assessment', 'Interview', 'Offered', 'Rejected', 'Withdrawn'],
  })
  @IsOptional()
  @IsIn(['Applied', 'Shortlisted', 'Assessment', 'Interview', 'Offered', 'Rejected', 'Withdrawn'])
  status?: string;
}
