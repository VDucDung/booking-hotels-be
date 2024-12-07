import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { COMMON_MESSAGE } from 'src/messages';

export class UpdateReviewDto {
  @IsOptional()
  @ApiProperty({
    name: 'comment',
    type: String,
    required: true,
  })
  comment: string;

  @IsOptional()
  @ApiProperty({
    name: 'images',
    type: [String],
    required: false,
  })
  images?: string[];

  @IsOptional()
  @IsNumber()
  rating: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty({ message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY) })
  userId?: number;

  @IsOptional()
  @ApiProperty({
    name: 'hotelId',
    type: Number,
    required: true,
  })
  @IsNotEmpty({ message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY) })
  hotelId: number;
}
