import { IsString, IsEmail, IsOptional, Length, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCollegeAdminDto {
  @ApiProperty({ example: 'Dr. Ganesh Kumar' })
  @IsString()
  @Length(2, 60, { message: 'Name must be 2–60 characters' })
  name: string;

  @ApiProperty({ example: 'ganesh@iiitsricity.ac.in' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '123' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Password must be at least 3 characters' })
  password?: string;
}
