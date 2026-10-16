import { IsString, IsEmail, IsOptional, IsIn, Length, Matches, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCollegeDto {
  @ApiProperty({ example: 'IIIT Sri City' })
  @IsString()
  @Length(3, 100, { message: 'College name must be 3–100 characters' })
  @Matches(/^[A-Za-z0-9][A-Za-z0-9 .,&'()-]*$/, { message: 'College name contains invalid characters' })
  name: string;

  @ApiProperty({ example: 'IIITSRICITY' })
  @IsString()
  @Matches(/^[A-Z0-9-]{2,12}$/, { message: 'College code must be 2–12 capital letters, numbers or hyphens' })
  code: string;

  @ApiProperty({ example: 'admin@iiitsricity.ac.in' })
  @IsEmail({}, { message: 'Enter a valid college email address' })
  email: string;

  @ApiPropertyOptional({ example: '+91 8626 252525' })
  @IsOptional()
  @Matches(/^[+]?[0-9 ()-]{8,16}$/, { message: 'Enter a valid phone number (8–16 digits)' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Chittoor, Andhra Pradesh' })
  @IsOptional()
  @IsString()
  @Length(5, 200, { message: 'Address must be 5–200 characters' })
  address?: string;

  @ApiPropertyOptional({ example: 'https://iiits.ac.in' })
  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'Website must be a full URL starting with http:// or https://' })
  website?: string;

  @ApiPropertyOptional({ example: 'active', enum: ['active', 'inactive', 'suspended'] })
  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: 'active' | 'inactive' | 'suspended';
}
