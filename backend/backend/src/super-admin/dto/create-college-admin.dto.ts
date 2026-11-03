import { IsString, IsEmail, IsOptional, Length, Matches, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DEFAULT_INITIAL_PASSWORD, MIN_PASSWORD_LENGTH } from '../../common/auth/password-policy';

export class CreateCollegeAdminDto {
  @ApiProperty({ example: 'Dr. Ganesh Kumar' })
  @IsString()
  @Length(2, 60, { message: 'Name must be 2–60 characters' })
  name: string;

  @ApiProperty({ example: 'ganesh@iiitsricity.ac.in' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'Welcome@123', description: `Minimum ${MIN_PASSWORD_LENGTH} characters. Defaults to ${DEFAULT_INITIAL_PASSWORD}.` })
  @IsOptional()
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH, { message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` })
  @Matches(/^\S(?:.*\S)?$/, { message: 'Password cannot start or end with whitespace' })
  password?: string;
}
