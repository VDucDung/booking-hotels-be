import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { COMMON_MESSAGE } from 'src/messages';

export class UpdateReviewDto {
  @ApiProperty({
    name: 'comment',
    type: String,
    description: 'Comment for the review',
    required: false,
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage(COMMON_MESSAGE.INVALID) })
  comment?: string;

  @ApiProperty({
    name: 'images',
    type: [String],
    description: 'Array of image URLs related to the review',
    required: false,
  })
  @IsOptional()
  @IsArray({ message: i18nValidationMessage(COMMON_MESSAGE.INVALID) })
  images?: string[];

  @ApiProperty({
    name: 'rating',
    type: String,
    description: 'Rating given in the review',
    enum: ['1', '2', '3', '4', '5'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['1', '2', '3', '4', '5'], {
    message: i18nValidationMessage(COMMON_MESSAGE.INVALID),
  })
  rating?: string;
}
