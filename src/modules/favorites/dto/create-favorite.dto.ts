import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateFavoriteDto {
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  userId?: number;

  @IsNumber()
  @IsNotEmpty()
  hotelId: number;
}
