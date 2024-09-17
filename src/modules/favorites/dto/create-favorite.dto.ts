import { IsEnum, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateFavoriteDto {
  @IsEnum(['tv', 'movie'])
  mediaType: 'tv' | 'movie';

  @IsString()
  @IsNotEmpty()
  mediaId: string;

  @IsString()
  @IsNotEmpty()
  mediaTitle: string;

  @IsString()
  @IsNotEmpty()
  mediaPoster: string;

  @IsNumber()
  @IsNotEmpty()
  mediaRate: number;
}
