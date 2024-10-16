import { IsString, IsOptional } from 'class-validator';

export class UpdateTypeUtilityDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  hotelId?: number;
}
