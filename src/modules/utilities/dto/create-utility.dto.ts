import { IsNumber, IsString } from 'class-validator';

export class CreateUtilityDto {
  @IsString()
  name: string;

  @IsNumber()
  typeUtilityId: number;
}
