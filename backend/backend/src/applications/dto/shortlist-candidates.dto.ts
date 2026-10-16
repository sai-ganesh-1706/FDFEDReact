import { ArrayNotEmpty, IsArray, IsInt, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ShortlistCandidatesDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  opportunityId: number;

  @ApiProperty({ example: [2, 3], description: 'Candidate user IDs to shortlist' })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  candidateIds: number[];
}
