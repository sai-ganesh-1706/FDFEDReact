import { ArrayNotEmpty, IsArray, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkStatusDto {
  @ApiProperty({ example: [11, 12], description: 'Application IDs to move' })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  applicationIds: number[];

  @ApiProperty({ example: 'Shortlisted', enum: ['Shortlisted', 'Rejected'] })
  @IsIn(['Shortlisted', 'Rejected'])
  status: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
