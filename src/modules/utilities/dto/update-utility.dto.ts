import { IsOptional, IsString } from 'class-validator';

export class UpdateUtilityDto {
  @IsString()
  @IsOptional()
  name?: string;
}
