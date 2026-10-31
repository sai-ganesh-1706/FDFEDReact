import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class ImportStudentsDto {
  @IsString()
  @MaxLength(1048576)
  csv: string;

  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}
