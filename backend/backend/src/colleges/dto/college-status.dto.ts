import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CollegeStatusDto {
  @ApiProperty({ enum: ['active', 'inactive', 'suspended'] })
  @IsIn(['active', 'inactive', 'suspended'])
  status: 'active' | 'inactive' | 'suspended';
}
