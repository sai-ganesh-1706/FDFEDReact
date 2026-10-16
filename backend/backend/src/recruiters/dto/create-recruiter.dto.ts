import { IsString, IsEmail, IsOptional, IsNumber, Length, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRecruiterDto {
  @ApiProperty({ example: 'Priya Kapoor' })
  @IsString()
  @Length(2, 60)
  @Matches(/^[A-Za-z][A-Za-z .'-]+$/, { message: 'Name may only contain letters, spaces and . \' -' })
  name: string;

  @ApiProperty({ example: 'TechCorp Solutions' })
  @IsString()
  @Length(2, 80)
  company: string;

  @ApiProperty({ example: 'HR Manager' })
  @IsString()
  @Length(2, 60)
  role: string;

  @ApiProperty({ example: 'priya.kapoor@techcorp.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+91 98765 43210' })
  @IsOptional()
  @Matches(/^[+]?[0-9 ()-]{8,16}$/, { message: 'Enter a valid phone number' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Mumbai, Maharashtra' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'Experienced HR professional with 8+ years in talent acquisition.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional({ description: 'College whose placement cell the recruiter wants to reach' })
  @IsOptional()
  @IsNumber()
  collegeId?: number;

  @ApiPropertyOptional({ description: 'Free-text message for the placement cell' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
