import { ValidateIf, Matches, IsString, IsEmail, IsNumber, IsOptional, IsIn, Min, Max, IsInt, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DEFAULT_INITIAL_PASSWORD, MIN_PASSWORD_LENGTH } from '../../common/auth/password-policy';

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

  @ApiPropertyOptional({ example: 'Welcome@123', description: `Initial password, at least ${MIN_PASSWORD_LENGTH} characters. Defaults to ${DEFAULT_INITIAL_PASSWORD} when omitted.` })
  @IsOptional()
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  @Matches(/^\S(?:.*\S)?$/, { message: 'Password cannot start or end with whitespace' })
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
  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  @ValidateIf((_object, value) => value !== '')
  @Matches(/^[0-9]{10}$/, { message: 'Phone number must contain exactly 10 digits, with no spaces or special characters' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Bangalore' })
  @IsOptional()
  @IsString()
  location?: string;
}
