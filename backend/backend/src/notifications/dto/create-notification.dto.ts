import { IsString, IsBoolean, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiPropertyOptional({
    example: 'assessment',
    enum: ['assessment', 'status', 'offer', 'referral', 'general'],
    description: 'Notification category — drives icon and filter on dashboard',
  })
  @IsOptional()
  @IsIn(['assessment', 'status', 'offer', 'referral', 'general'])
  type?: string;

  @ApiProperty({ example: '📝 Assessment Scheduled: Coding Round 1' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'TechCorp has scheduled an assessment for the SWE role. Platform: HackerRank · Date: 2026-06-10 at 10:00 AM · Duration: 90 minutes.' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ example: 'applications.html', description: 'Page to navigate to on click' })
  @IsOptional()
  @IsString()
  href?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
