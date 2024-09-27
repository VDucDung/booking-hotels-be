import { IsNotEmpty, IsArray, IsNumber, IsOptional } from 'class-validator';

export class CreateFavoriteDto {
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  userId: number;

  @IsArray()
  @IsNotEmpty()
  hotels: number[];
}
