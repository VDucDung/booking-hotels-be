import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PHONE_VN_REGEX } from 'src/constants';
import { COMMON_MESSAGE } from 'src/messages';
import { Review } from 'src/modules/review/entities/review.entity';

export class CreateHotelDto {
  @IsNotEmpty({
    message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY),
  })
  @ApiProperty({
    name: 'hotelName',
    type: String,
    required: true,
  })
  hotelName: string;

  @IsNotEmpty({
    message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY),
  })
  @ApiProperty({
    name: 'address',
    type: String,
    required: true,
  })
  address: string;

  @MaxLength(30, {
    message: i18nValidationMessage(COMMON_MESSAGE.MAX),
  })
  @Matches(PHONE_VN_REGEX, {
    message: i18nValidationMessage(COMMON_MESSAGE.INVALID_PHONE),
  })
  @ApiProperty({
    name: 'phone',
    type: String,
    required: true,
  })
  contactPhone: string;

  @IsOptional()
  @ApiProperty({
    name: 'description',
    type: String,
    required: true,
  })
  description?: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    name: 'images',
    type: [String],
    required: false,
  })
  images: string[];

  @IsOptional()
  @IsNotEmpty({
    message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY),
  })
  @ApiProperty({
    name: 'favoriteId',
    type: Number,
    required: false,
  })
  favoriteId?: number;

  @IsOptional()
  @IsNotEmpty({
    message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY),
  })
  @ApiProperty({
    name: 'reviews',
    type: [Review],
    required: false,
  })
  reviews?: Review[];

  @IsOptional()
  @IsNotEmpty({
    message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY),
  })
  @ApiProperty({
    name: 'typeRoomIds',
    type: [Number],
    required: false,
  })
  typeRoomIds?: number[];
}
