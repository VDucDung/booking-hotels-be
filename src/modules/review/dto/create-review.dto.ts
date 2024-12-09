import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { COMMON_MESSAGE } from 'src/messages';

export class CreateReviewDto {
  @IsOptional()
  @ApiProperty({
    name: 'customerName',
    type: String,
    required: false,
    default: 'guest',
  })
  @IsString({ message: i18nValidationMessage(COMMON_MESSAGE.INVALID) })
  @IsNotEmpty({ message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY) })
  customerName?: string;

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

  @IsInt({ message: 'Rating must be an integer.' })
  @Min(1, { message: 'Rating must be at least 1.' })
  @Max(5, { message: 'Rating must not exceed 5.' })
  rating: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty({ message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY) })
  userId?: number;

  @ApiProperty({
    name: 'hotelId',
    type: Number,
    description: 'ID of the hotel being reviewed',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty({ message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY) })
  hotelId: number;
}
