import { IsString, IsEmail, IsNumber, IsOptional, IsIn, Min, Max, IsInt, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Sai Ganesh' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'sai.ganesh@college.in' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'candidate',
    enum: ['candidate', 'recruiter', 'alumni', 'placement_officer', 'college_admin', 'super_admin'],
  })
  @IsIn(['candidate', 'recruiter', 'alumni', 'placement_officer', 'college_admin', 'super_admin'])
  role: string;

  @ApiPropertyOptional({ example: 1, description: 'College ID (null for super_admin)' })
  @IsOptional()
  @IsNumber()
  collegeId?: number;

  @ApiPropertyOptional({ example: 'active', enum: ['active', 'inactive', 'placed'] })
  @IsOptional()
  @IsIn(['active', 'inactive', 'placed'])
  status?: string;

  @ApiPropertyOptional({ example: 'Welcome@123', description: 'Initial password. Defaults to 123 when omitted.' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  password?: string;

  // ── Candidate fields ─────────────────────────────────────────────
  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: 9.06 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  cgpa?: number;

  @ApiPropertyOptional({ example: 'B22CS012' })
  @IsOptional()
  @IsString()
  rollNumber?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  backlogs?: number;

  // ── Alumni fields ─────────────────────────────────────────────────
  @ApiPropertyOptional({ example: 'Google' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ example: '2022' })
  @IsOptional()
  @IsString()
  batch?: string;

  @ApiPropertyOptional({ example: 'Software Engineer' })
  @IsOptional()
  @IsString()
  headline?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  referrals?: number;

  // ── Recruiter fields ───────────────────────────────────────────────
  @ApiPropertyOptional({ example: '+91 98765 43210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Bangalore' })
  @IsOptional()
  @IsString()
  location?: string;
}
