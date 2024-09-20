import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { COMMON_MESSAGE } from 'src/messages';

export class CreateReviewDto {
  @ApiProperty({
    name: 'comment',
    type: String,
    description: 'Comment for the review',
    required: true,
  })
  @IsString({ message: i18nValidationMessage(COMMON_MESSAGE.INVALID) })
  @IsNotEmpty({ message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY) })
  comment: string;

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
    required: true,
  })
  @IsEnum(['1', '2', '3', '4', '5'], {
    message: i18nValidationMessage(COMMON_MESSAGE.INVALID),
  })
  @IsNotEmpty({ message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY) })
  rating: string;

  @ApiProperty({
    name: 'userId',
    type: String,
    description: 'ID of the user who wrote the review',
    required: true,
  })
  @IsString({ message: i18nValidationMessage(COMMON_MESSAGE.INVALID) })
  @IsNotEmpty({ message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY) })
  userId: string;

  @ApiProperty({
    name: 'hotelId',
    type: String,
    description: 'ID of the hotel being reviewed',
    required: true,
  })
  @IsString({ message: i18nValidationMessage(COMMON_MESSAGE.INVALID) })
  @IsNotEmpty({ message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY) })
  hotelId: string;
}
