import { IsString, IsNumber, IsArray, IsOptional, IsIn, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOpportunityDto {
  @ApiProperty({ example: 'Software Engineer' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'TechCorp Solutions' })
  @IsString()
  company: string;

  @ApiProperty({ example: 'Bangalore, Karnataka' })
  @IsString()
  location: string;

  @ApiProperty({ example: '2026-05-25' })
  @IsDateString()
  deadline: string;

  @ApiProperty({ example: '12 LPA' })
  @IsString()
  salary: string;

  @ApiProperty({ example: 15 })
  @IsNumber()
  openings: number;

  @ApiProperty({ example: 7.5 })
  @IsNumber()
  @Min(0)
  @Max(10)
  cgpa: number;

  @ApiProperty({ example: ['CSE', 'ECE', 'IT'] })
  @IsArray()
  @IsString({ each: true })
  branches: string[];

  @ApiProperty({ example: 'Full-Time', enum: ['Full-Time', 'Internship'] })
  @IsIn(['Full-Time', 'Internship'])
  type: string;

  @ApiPropertyOptional({ example: ['JavaScript', 'Node.js', 'React'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'Join our engineering team to build scalable applications.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Resume → Assessment → Technical → HR' })
  @IsOptional()
  @IsString()
  rounds?: string;

  @ApiPropertyOptional({ example: 'Not allowed' })
  @IsOptional()
  @IsString()
  backlogs?: string;

  @ApiPropertyOptional({ example: 'priya.kapoor@google.com', description: 'Email of the recruiter who posted this opportunity — used for per-recruiter filtering' })
  @IsOptional()
  @IsString()
  submittedBy?: string;
}
