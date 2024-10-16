import { IsString, IsOptional } from 'class-validator';

export class CreateTypeUtilityDto {
  @IsString()
  name: string;

  @IsOptional()
  hotelId?: number;
}
