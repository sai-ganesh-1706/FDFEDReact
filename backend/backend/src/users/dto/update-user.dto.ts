import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { ValidateIf, Matches, IsArray, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: 'Computer Science Student | Aspiring Software Engineer' })
  @IsOptional()
  @IsString()
  headline?: string;

  @ApiPropertyOptional({ example: 'Bangalore, India' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'CareerNest University' })
  @IsOptional()
  @IsString()
  university?: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  @ValidateIf((_object, value) => value !== '')
  @Matches(/^[0-9]{10}$/, { message: 'Phone number must contain exactly 10 digits, with no spaces or special characters' })
  phone?: string;

  @ApiPropertyOptional({ example: 'I am a passionate CS student...' })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiPropertyOptional({ example: 'Placement Season 2025-26' })
  @IsOptional()
  @IsString()
  batchLabel?: string;

  @ApiPropertyOptional({ example: ['React', 'Node.js'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ example: { github: 'https://github.com/x' } })
  @IsOptional()
  @IsObject()
  socialLinks?: { github?: string; linkedin?: string; portfolio?: string };

  @ApiPropertyOptional({ description: 'Profile page data (education, projects, resume, images...)' })
  @IsOptional()
  @IsObject()
  resumeData?: Record<string, any>;

  @ApiPropertyOptional({ example: 'SB' })
  @IsOptional()
  @IsString()
  avatar?: string;
}
